import logging
from django.db import transaction
from django.conf import settings
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.bills.models import Bill
from apps.workflow.models import WorkflowHistory
from apps.notifications.services import NotificationService
from apps.audit.services import AuditService
from core.choices import BillStatus, UserRole, WorkflowAction

logger = logging.getLogger(__name__)


class WorkflowService:
    """
    State machine orchestrator for Bill transitions.
    Defines allowed states, user role validations, and history logging.
    """

    # Maps the current status to the user role allowed to act on it
    STATUS_ROLE_MAP = {
        BillStatus.RECEIVING: UserRole.DATA_ENTRY,
        BillStatus.DATA_ENTRY: UserRole.DATA_ENTRY,
        BillStatus.SUPERVISOR: UserRole.SUPERVISOR,
        BillStatus.DEPARTMENT_MANAGER: UserRole.DEPARTMENT_MANAGER,
        BillStatus.ACCOUNTS: UserRole.ACCOUNTS,
    }

    # Standard linear approval chain
    APPROVAL_CHAIN = {
        BillStatus.RECEIVING: BillStatus.SUPERVISOR,
        BillStatus.DATA_ENTRY: BillStatus.SUPERVISOR,
        BillStatus.SUPERVISOR: BillStatus.DEPARTMENT_MANAGER,
        BillStatus.DEPARTMENT_MANAGER: BillStatus.ACCOUNTS,
        BillStatus.ACCOUNTS: BillStatus.ACCOUNTS_CLEARED,
    }

    # Rejection returns to previous step
    REJECTION_CHAIN = {
        BillStatus.SUPERVISOR: BillStatus.DATA_ENTRY,
        BillStatus.DEPARTMENT_MANAGER: BillStatus.SUPERVISOR,
        BillStatus.ACCOUNTS: BillStatus.DEPARTMENT_MANAGER,
    }

    @staticmethod
    def validate_action_permission(user, bill):
        """
        Validates if the user has the correct role to perform actions on the bill.
        Super Admin bypasses all checks.
        """
        if user.is_superuser or user.role == UserRole.SUPER_ADMIN:
            return True

        required_role = WorkflowService.STATUS_ROLE_MAP.get(bill.current_status)
        if not required_role or user.role != required_role:
            raise PermissionDenied(
                f"Your role ({user.role}) is not authorized to act on bills in the {bill.current_status} stage."
            )

        return True

    @staticmethod
    @transaction.atomic
    def submit_bill(user, bill_id, comments=""):
        """
        Submits a newly created bill from RECEIVING to SUPERVISOR
        """
        bill = Bill.objects.select_for_update().get(pk=bill_id)

        if bill.current_status != BillStatus.RECEIVING:
            raise ValidationError(f"Only bills in RECEIVING status can be submitted.")

        WorkflowService.validate_action_permission(user, bill)

        from_status = bill.current_status
        to_status = BillStatus.SUPERVISOR

        bill.current_status = to_status
        bill.assigned_to = None  # Clear assigned user so any supervisor can claim it
        bill.save()

        # Create history entry
        history = WorkflowHistory.objects.create(
            bill=bill,
            from_status=from_status,
            to_status=to_status,
            action=WorkflowAction.SUBMIT,
            performed_by=user,
            comments=comments,
        )

        # Notify supervisors
        from django.contrib.auth import get_user_model

        User = get_user_model()
        supervisors = User.objects.filter(role=UserRole.SUPERVISOR, is_active=True)
        for supervisor in supervisors:
            NotificationService.create_notification(
                recipient=supervisor,
                title="New Bill Submitted",
                message=f"Bill {bill.bill_number} is pending approval.",
                notification_type="APPROVAL_REQUIRED",
                bill=bill,
            )

        AuditService.log_activity(
            user=user,
            action="UPDATE",
            instance=bill,
            changes={"current_status": [from_status, to_status]},
        )

        return bill

    @staticmethod
    @transaction.atomic
    def approve_bill(user, bill_id, comments=""):
        """
        Approves a bill, moving it forward in the approval chain.
        """
        bill = Bill.objects.select_for_update().get(pk=bill_id)

        if bill.current_status in [BillStatus.RECEIVING, BillStatus.ACCOUNTS_CLEARED]:
            raise ValidationError(f"No approval action possible on status: {bill.current_status}.")

        WorkflowService.validate_action_permission(user, bill)

        from_status = bill.current_status
        to_status = WorkflowService.APPROVAL_CHAIN.get(from_status)

        if not to_status:
            raise ValidationError(f"No next approval state defined for: {from_status}.")

        bill.current_status = to_status
        bill.assigned_to = None  # Clear assignment so anyone with the next role can claim
        bill.save()

        WorkflowHistory.objects.create(
            bill=bill,
            from_status=from_status,
            to_status=to_status,
            action=WorkflowAction.APPROVE,
            performed_by=user,
            comments=comments,
        )

        # Notify next role groups
        next_role = WorkflowService.STATUS_ROLE_MAP.get(to_status)
        if next_role:
            from django.contrib.auth import get_user_model

            User = get_user_model()
            next_users = User.objects.filter(role=next_role, is_active=True)
            for next_user in next_users:
                NotificationService.create_notification(
                    recipient=next_user,
                    title="Bill Approval Required",
                    message=f"Bill {bill.bill_number} has been approved to your stage.",
                    notification_type="APPROVAL_REQUIRED",
                    bill=bill,
                )
        else:
            # Reached final status ACCOUNTS_CLEARED
            # Notify creator
            NotificationService.create_notification(
                recipient=bill.created_by,
                title="Bill Cleared",
                message=f"Your bill {bill.bill_number} has been fully cleared.",
                notification_type="CLEARED",
                bill=bill,
            )

        AuditService.log_activity(
            user=user,
            action="UPDATE",
            instance=bill,
            changes={"current_status": [from_status, to_status]},
        )

        return bill

    @staticmethod
    @transaction.atomic
    def reject_bill(user, bill_id, comments):
        """
        Rejects a bill, sending it back to the previous stage.
        Rejection comments are mandatory.
        """
        if not comments or not comments.strip():
            raise ValidationError({"comments": ["Comments are required when rejecting a bill."]})

        bill = Bill.objects.select_for_update().get(pk=bill_id)

        if bill.current_status in [BillStatus.RECEIVING, BillStatus.ACCOUNTS_CLEARED]:
            raise ValidationError(f"No rejection action possible on status: {bill.current_status}.")

        WorkflowService.validate_action_permission(user, bill)

        from_status = bill.current_status
        to_status = WorkflowService.REJECTION_CHAIN.get(from_status)

        if not to_status:
            raise ValidationError(f"No rejection state defined for: {from_status}.")

        bill.current_status = to_status
        bill.assigned_to = None
        bill.save()

        WorkflowHistory.objects.create(
            bill=bill,
            from_status=from_status,
            to_status=to_status,
            action=WorkflowAction.REJECT,
            performed_by=user,
            comments=comments,
        )

        # Notify creator or data entry roles
        next_role = WorkflowService.STATUS_ROLE_MAP.get(to_status)
        if next_role:
            from django.contrib.auth import get_user_model

            User = get_user_model()
            next_users = User.objects.filter(role=next_role, is_active=True)
            for next_user in next_users:
                NotificationService.create_notification(
                    recipient=next_user,
                    title="Bill Rejected",
                    message=f"Bill {bill.bill_number} has been rejected back to your stage. Reason: {comments}",
                    notification_type="REJECTED",
                    bill=bill,
                )

        AuditService.log_activity(
            user=user,
            action="UPDATE",
            instance=bill,
            changes={"current_status": [from_status, to_status]},
        )

        return bill

    @staticmethod
    @transaction.atomic
    def reassign_bill(user, bill_id, target_user_id, comments=""):
        """
        Reassigns the bill to another active user.
        The target user must have the appropriate role matching the bill's current stage.
        """
        bill = Bill.objects.select_for_update().get(pk=bill_id)

        if bill.current_status == BillStatus.ACCOUNTS_CLEARED:
            raise ValidationError("Cannot reassign cleared bills.")

        WorkflowService.validate_action_permission(user, bill)

        from django.contrib.auth import get_user_model

        User = get_user_model()
        target_user = User.objects.get(pk=target_user_id)

        if not target_user.is_active:
            raise ValidationError({"target_user": ["Target user is inactive."]})

        required_role = WorkflowService.STATUS_ROLE_MAP.get(bill.current_status)
        if target_user.role != required_role and not target_user.is_superuser:
            raise ValidationError(
                {
                    "target_user": [
                        f"Target user role ({target_user.role}) does not match the required stage role ({required_role})."
                    ]
                }
            )

        old_assignee = bill.assigned_to
        bill.assigned_to = target_user
        bill.save()

        WorkflowHistory.objects.create(
            bill=bill,
            from_status=bill.current_status,
            to_status=bill.current_status,
            action=WorkflowAction.REASSIGN,
            performed_by=user,
            assigned_to=target_user,
            comments=comments or f"Reassigned from {old_assignee} to {target_user}",
        )

        # Notify the reassigned user
        NotificationService.create_notification(
            recipient=target_user,
            title="Bill Reassigned to You",
            message=f"Bill {bill.bill_number} has been assigned to you for review.",
            notification_type="REASSIGNED",
            bill=bill,
        )

        AuditService.log_activity(
            user=user,
            action="UPDATE",
            instance=bill,
            changes={
                "assigned_to_id": [old_assignee.pk if old_assignee else None, target_user.pk]
            },
        )

        return bill
