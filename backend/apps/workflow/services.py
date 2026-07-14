import logging
from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.bills.models import Bill
from apps.workflow.models import WorkflowHistory
from apps.notifications.services import NotificationService
from apps.audit.services import AuditService
from core.choices import BillStatus, UserRole, WorkflowAction, WorkflowRejectReason, WorkflowHoldReason

logger = logging.getLogger(__name__)
User = get_user_model()


class WorkflowService:
    """
    Business service layer orchestrating the state machine workflow transitions for Bills.
    """

    # Role permission mappings for each workflow status stage
    STATUS_ROLE_MAP = {
        BillStatus.RECEIVING: UserRole.DATA_ENTRY,
        BillStatus.DATA_ENTRY: UserRole.DATA_ENTRY,
        BillStatus.SUPERVISOR: UserRole.SUPERVISOR,
        BillStatus.DEPARTMENT_MANAGER: UserRole.DEPARTMENT_MANAGER,
        BillStatus.ACCOUNTS: UserRole.ACCOUNTS,
    }

    # Standard forward approval transition path
    APPROVAL_CHAIN = {
        BillStatus.RECEIVING: BillStatus.DATA_ENTRY,
        BillStatus.DATA_ENTRY: BillStatus.SUPERVISOR,
        BillStatus.SUPERVISOR: BillStatus.DEPARTMENT_MANAGER,
        BillStatus.DEPARTMENT_MANAGER: BillStatus.ACCOUNTS,
        BillStatus.ACCOUNTS: BillStatus.ACCOUNTS_CLEARED,
    }

    # Reverse rejection transition path (must never skip levels)
    REJECTION_CHAIN = {
        BillStatus.ACCOUNTS: BillStatus.DEPARTMENT_MANAGER,
        BillStatus.DEPARTMENT_MANAGER: BillStatus.SUPERVISOR,
        BillStatus.SUPERVISOR: BillStatus.DATA_ENTRY,
        BillStatus.DATA_ENTRY: BillStatus.RECEIVING,
    }

    @staticmethod
    def validate_action_permission(user, bill):
        """
        Validates that the user has authorization matching the bill's current stage.
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
    def approve_bill(user, bill_id, comments=""):
        """
        Transitions a bill forward along the approval workflow chain.
        """
        try:
            bill = Bill.objects.select_for_update().get(pk=bill_id)
        except Bill.DoesNotExist:
            raise ValidationError({"bill_id": ["Bill not found."]})

        if bill.current_status == BillStatus.ACCOUNTS_CLEARED:
            raise ValidationError({"status": ["This bill is already cleared."]})

        WorkflowService.validate_action_permission(user, bill)

        from_status = bill.current_status
        to_status = WorkflowService.APPROVAL_CHAIN.get(from_status)

        if not to_status:
            raise ValidationError({"status": [f"No next approval status defined from {from_status}."]})

        bill.current_status = to_status
        bill.updated_by = user
        bill.save(update_fields=["current_status", "updated_by", "updated_at"])

        # Record workflow timeline history
        WorkflowHistory.objects.create(
            bill=bill,
            from_status=from_status,
            to_status=to_status,
            action=WorkflowAction.APPROVE,
            performed_by=user,
            comments=comments,
        )

        # Log system audit log
        AuditService.log_activity(
            user=user,
            action="UPDATE",
            instance=bill,
            changes={"current_status": [from_status, to_status]},
        )

        # Dispatch notifications
        next_role = WorkflowService.STATUS_ROLE_MAP.get(to_status)
        if next_role:
            next_users = User.objects.filter(role=next_role, is_active=True)
            for next_user in next_users:
                NotificationService.create_notification(
                    recipient=next_user,
                    title="Bill Approval Required",
                    message=f"Bill {bill.bill_number} requires review and approval.",
                    notification_type="APPROVAL_REQUIRED",
                    bill=bill,
                )
        else:
            # Reached Accounts Cleared
            NotificationService.create_notification(
                recipient=bill.created_by,
                title="Bill Cleared",
                message=f"Your registered bill {bill.bill_number} has been cleared.",
                notification_type="CLEARED",
                bill=bill,
            )

        return bill

    @staticmethod
    @transaction.atomic
    def reject_bill(user, bill_id, reason_code, reason_note="", comments=""):
        """
        Transitions a bill backward to the previous stage in the workflow.
        Rejection must follow the reverse reject flow level-by-level without skipping.
        """
        try:
            bill = Bill.objects.select_for_update().get(pk=bill_id)
        except Bill.DoesNotExist:
            raise ValidationError({"bill_id": ["Bill not found."]})

        if bill.current_status in [BillStatus.RECEIVING, BillStatus.ACCOUNTS_CLEARED]:
            raise ValidationError({"status": [f"Rejection not possible from status: {bill.current_status}."]})

        WorkflowService.validate_action_permission(user, bill)

        from_status = bill.current_status
        to_status = WorkflowService.REJECTION_CHAIN.get(from_status)

        if not to_status:
            raise ValidationError({"status": [f"No reverse reject status defined from {from_status}."]})

        # Reject comments/note are required (either code or custom notes)
        rejection_reason = reason_note if reason_code == WorkflowRejectReason.OTHER else reason_code
        if not rejection_reason or not rejection_reason.strip():
            raise ValidationError({"reason_code": ["A reject reason details string is required."]})

        bill.current_status = to_status
        bill.rejection_reason = rejection_reason.strip()
        bill.updated_by = user
        bill.save(update_fields=["current_status", "rejection_reason", "updated_by", "updated_at"])

        # Record workflow timeline history
        WorkflowHistory.objects.create(
            bill=bill,
            from_status=from_status,
            to_status=to_status,
            action=WorkflowAction.REJECT,
            performed_by=user,
            comments=comments,
            reason_code=reason_code,
            reason_note=reason_note,
        )

        # Log system audit log
        AuditService.log_activity(
            user=user,
            action="UPDATE",
            instance=bill,
            changes={
                "current_status": [from_status, to_status],
                "rejection_reason": [None, bill.rejection_reason],
            },
        )

        # Notify users in the rejected stage
        next_role = WorkflowService.STATUS_ROLE_MAP.get(to_status)
        if next_role:
            next_users = User.objects.filter(role=next_role, is_active=True)
            for next_user in next_users:
                NotificationService.create_notification(
                    recipient=next_user,
                    title="Bill Rejected",
                    message=f"Bill {bill.bill_number} has been rejected back to your stage. Reason: {rejection_reason}",
                    notification_type="REJECTED",
                    bill=bill,
                )

        return bill

    @staticmethod
    @transaction.atomic
    def hold_bill(user, bill_id, reason_code, reason_note="", comments=""):
        """
        Puts an active bill workflow on hold, recording hold reason code and customized notes.
        """
        try:
            bill = Bill.objects.select_for_update().get(pk=bill_id)
        except Bill.DoesNotExist:
            raise ValidationError({"bill_id": ["Bill not found."]})

        if bill.current_status in [BillStatus.ACCOUNTS_CLEARED, BillStatus.HOLDING]:
            raise ValidationError({"status": [f"Cannot hold bill from status: {bill.current_status}."]})

        WorkflowService.validate_action_permission(user, bill)

        from_status = bill.current_status
        to_status = BillStatus.HOLDING

        bill.current_status = to_status
        bill.updated_by = user
        bill.save(update_fields=["current_status", "updated_by", "updated_at"])

        # Record workflow timeline history with hold reason code and customized notes
        WorkflowHistory.objects.create(
            bill=bill,
            from_status=from_status,
            to_status=to_status,
            action=WorkflowAction.HOLD,
            performed_by=user,
            comments=comments,
            reason_code=reason_code,
            reason_note=reason_note,
        )

        # Log system audit log
        AuditService.log_activity(
            user=user,
            action="UPDATE",
            instance=bill,
            changes={"current_status": [from_status, to_status]},
        )

        return bill

    @staticmethod
    @transaction.atomic
    def resume_bill(user, bill_id, comments=""):
        """
        Resumes a held bill workflow, restoring the exact state prior to holding it.
        """
        try:
            bill = Bill.objects.select_for_update().get(pk=bill_id)
        except Bill.DoesNotExist:
            raise ValidationError({"bill_id": ["Bill not found."]})

        if bill.current_status != BillStatus.HOLDING:
            raise ValidationError({"status": [f"Bill is not on hold (current status: {bill.current_status})."]})

        # Locate latest workflow history entry representing hold
        last_hold = (
            WorkflowHistory.objects.filter(bill=bill, action=WorkflowAction.HOLD)
            .order_by("-created_at")
            .first()
        )

        if not last_hold:
            raise ValidationError({"status": ["No hold history found to resume from."]})

        target_status = last_hold.from_status

        # Validate permission on the target status stage
        bill.current_status = target_status
        try:
            WorkflowService.validate_action_permission(user, bill)
        except Exception as e:
            # Revert temp status assign before re-throwing
            bill.current_status = BillStatus.HOLDING
            raise e

        # Finalize restore
        bill.updated_by = user
        bill.save(update_fields=["current_status", "updated_by", "updated_at"])

        # Record resume action in history
        WorkflowHistory.objects.create(
            bill=bill,
            from_status=BillStatus.HOLDING,
            to_status=target_status,
            action=WorkflowAction.RESUME,
            performed_by=user,
            comments=comments,
        )

        # Log system audit log
        AuditService.log_activity(
            user=user,
            action="UPDATE",
            instance=bill,
            changes={"current_status": [BillStatus.HOLDING, target_status]},
        )

        return bill

    @staticmethod
    def annotate_held_status(queryset):
        """
        Subquery annotating each bill with the from_status of its latest HOLD history step.
        """
        from django.db.models import Subquery, OuterRef
        last_hold_from_status = Subquery(
            WorkflowHistory.objects.filter(
                bill=OuterRef("pk"), action=WorkflowAction.HOLD
            )
            .order_by("-created_at")
            .values("from_status")[:1]
        )
        return queryset.annotate(held_from_status=last_hold_from_status)

    @staticmethod
    def get_history(bill_id):
        """
        Retrieves workflow timeline history records for a bill.
        """
        return (
            WorkflowHistory.objects.filter(bill_id=bill_id)
            .select_related("performed_by", "assigned_to")
            .order_by("created_at")
        )

    @staticmethod
    def list_pending(user):
        """
        Queries all bills optimized with select_related that are currently pending user actions.
        """
        base_queryset = Bill.objects.select_related(
            "vendor", "department", "created_by", "updated_by"
        )
        base_queryset = WorkflowService.annotate_held_status(base_queryset)

        if user.is_superuser or user.role == UserRole.SUPER_ADMIN:
            return base_queryset.exclude(current_status=BillStatus.ACCOUNTS_CLEARED)

        from django.db.models import Q
        if user.role == UserRole.DATA_ENTRY:
            return base_queryset.filter(
                Q(current_status__in=[BillStatus.RECEIVING, BillStatus.DATA_ENTRY]) |
                Q(current_status=BillStatus.HOLDING, held_from_status__in=[BillStatus.RECEIVING, BillStatus.DATA_ENTRY])
            )
        elif user.role == UserRole.SUPERVISOR:
            return base_queryset.filter(
                Q(current_status=BillStatus.SUPERVISOR) |
                Q(current_status=BillStatus.HOLDING, held_from_status=BillStatus.SUPERVISOR)
            )
        elif user.role == UserRole.DEPARTMENT_MANAGER:
            return base_queryset.filter(
                Q(current_status=BillStatus.DEPARTMENT_MANAGER) |
                Q(current_status=BillStatus.HOLDING, held_from_status=BillStatus.DEPARTMENT_MANAGER)
            )
        elif user.role == UserRole.ACCOUNTS:
            return base_queryset.filter(
                Q(current_status=BillStatus.ACCOUNTS) |
                Q(current_status=BillStatus.HOLDING, held_from_status=BillStatus.ACCOUNTS)
            )

        return base_queryset.none()
