import logging
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.utils import timezone

from apps.bills.models import Bill
from apps.vendors.models import Vendor
from apps.departments.models import Department
from apps.workflow.models import WorkflowHistory
from core.choices import BillStatus, UserRole, WorkflowAction
from apps.workflow.services import WorkflowService

logger = logging.getLogger(__name__)


class DashboardService:
    """
    Business logic layer aggregating metrics and statistical data.
    Provides decoupled role-based card summaries.
    """

    @staticmethod
    def get_super_admin_dashboard(user):
        """
        Generates dashboard statistics for Super Admin users.
        """
        today = timezone.localdate()

        # Aggregated KPIs
        total_bills = Bill.objects.count()
        pending_bills = Bill.objects.exclude(current_status=BillStatus.ACCOUNTS_CLEARED).count()
        cleared_bills = Bill.objects.filter(current_status=BillStatus.ACCOUNTS_CLEARED).count()
        rejected_bills = Bill.objects.exclude(rejection_reason__isnull=True).exclude(rejection_reason="").count()
        active_vendors = Vendor.objects.filter(is_active=True).count()
        active_depts = Department.objects.filter(is_active=True).count()

        cards = [
            {"title": "Total Bills", "value": str(total_bills), "description": "System-wide invoices"},
            {"title": "Pending Bills", "value": str(pending_bills), "description": "In approval pipeline"},
            {"title": "Cleared Bills", "value": str(cleared_bills), "description": "Fully processed payments"},
            {"title": "Rejected Bills", "value": str(rejected_bills), "description": "Invoices flagged for correction"},
            {"title": "Active Vendors", "value": str(active_vendors), "description": "Selectable suppliers"},
            {"title": "Active Departments", "value": str(active_depts), "description": "Internal stores departments"},
        ]

        # Department wise distribution (Optimized Query)
        dept_distribution = (
            Bill.objects.values("department__name")
            .annotate(count=Count("id"), total=Sum("amount"))
            .order_by("-total")[:10]
        )
        department_wise = [
            {
                "name": item["department__name"] or "Unassigned",
                "count": item["count"],
                "amount": float(item["total"] or 0),
            }
            for item in dept_distribution
        ]

        # Vendor wise distribution (Optimized Query)
        vendor_distribution = (
            Bill.objects.values("vendor__name")
            .annotate(count=Count("id"), total=Sum("amount"))
            .order_by("-total")[:10]
        )
        vendor_wise = [
            {
                "name": item["vendor__name"] or "Unknown",
                "count": item["count"],
                "amount": float(item["total"] or 0),
            }
            for item in vendor_distribution
        ]

        # Monthly Trends (last 6 months - Optimized Query)
        trends = (
            Bill.objects.annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"), total=Sum("amount"))
            .order_by("-month")[:6]
        )
        monthly_trends = [
            {
                "month": item["month"].strftime("%b %Y") if item["month"] else "Unknown",
                "count": item["count"],
                "amount": float(item["total"] or 0),
            }
            for item in reversed(list(trends))
        ]

        # Recent Workflow Activities
        recent_qs = WorkflowHistory.objects.select_related("bill", "performed_by").order_by("-created_at")[:10]
        recent_activities = [
            {
                "bill_number": item.bill.bill_number,
                "user_name": f"{item.performed_by.first_name} {item.performed_by.last_name}".strip() or item.performed_by.email,
                "from_status": item.from_status or "None",
                "to_status": item.to_status,
                "action": item.action,
                "timestamp": item.created_at.strftime("%d %b %Y, %I:%M %p"),
                "note": item.comments or "",
            }
            for item in recent_qs
        ]

        return {
            "role": UserRole.SUPER_ADMIN,
            "cards": cards,
            "department_wise": department_wise,
            "vendor_wise": vendor_wise,
            "monthly_trends": monthly_trends,
            "recent_activities": recent_activities,
        }

    @staticmethod
    def get_receiving_dashboard(user):
        """
        Generates dashboard statistics for the Receiving department.
        """
        today = timezone.localdate()

        from django.db.models import Q
        pending = (
            WorkflowService.annotate_held_status(Bill.objects.all())
            .filter(
                Q(current_status=BillStatus.RECEIVING)
                | Q(current_status=BillStatus.HOLDING, held_from_status=BillStatus.RECEIVING)
            )
            .count()
        )
        received_today = Bill.objects.filter(created_at__date=today).count()
        returned = (
            Bill.objects.filter(current_status=BillStatus.RECEIVING)
            .exclude(rejection_reason__isnull=True)
            .exclude(rejection_reason="")
            .count()
        )

        cards = [
            {"title": "Pending Bills", "value": str(pending), "description": "Draft bills awaiting submission"},
            {"title": "Bills Received Today", "value": str(received_today), "description": "Registered today"},
            {"title": "Bills Returned", "value": str(returned), "description": "Returned for revision"},
        ]

        return {
            "role": "RECEIVING",
            "cards": cards,
        }

    @staticmethod
    def get_data_entry_dashboard(user):
        """
        Generates dashboard statistics for the Data Entry department.
        """
        today = timezone.localdate()

        from django.db.models import Q
        pending = (
            WorkflowService.annotate_held_status(Bill.objects.all())
            .filter(
                Q(current_status=BillStatus.DATA_ENTRY)
                | Q(current_status=BillStatus.HOLDING, held_from_status=BillStatus.DATA_ENTRY)
            )
            .count()
        )
        completed_today = WorkflowHistory.objects.filter(
            performed_by=user,
            action__in=[WorkflowAction.SUBMIT, WorkflowAction.APPROVE],
            created_at__date=today,
        ).count()
        returned = (
            Bill.objects.filter(current_status=BillStatus.DATA_ENTRY)
            .exclude(rejection_reason__isnull=True)
            .exclude(rejection_reason="")
            .count()
        )

        cards = [
            {"title": "Pending Entry", "value": str(pending), "description": "Awaiting department mapping"},
            {"title": "Completed Today", "value": str(completed_today), "description": "Submitted to supervisor today"},
            {"title": "Returned Bills", "value": str(returned), "description": "Rejected back for entry fixes"},
        ]

        return {
            "role": UserRole.DATA_ENTRY,
            "cards": cards,
        }

    @staticmethod
    def get_supervisor_dashboard(user):
        """
        Generates dashboard statistics for the Department Supervisor.
        """
        today = timezone.localdate()

        pending = WorkflowService.list_pending(user).count()
        approved_today = WorkflowHistory.objects.filter(
            performed_by=user, action=WorkflowAction.APPROVE, created_at__date=today
        ).count()
        rejected_today = WorkflowHistory.objects.filter(
            performed_by=user, action=WorkflowAction.REJECT, created_at__date=today
        ).count()

        cards = [
            {"title": "Pending Approval", "value": str(pending), "description": "Awaiting supervisor authorization"},
            {"title": "Approved Today", "value": str(approved_today), "description": "Approved by you today"},
            {"title": "Rejected Bills", "value": str(rejected_today), "description": "Rejected by you today"},
        ]

        return {
            "role": UserRole.SUPERVISOR,
            "cards": cards,
        }

    @staticmethod
    def get_manager_dashboard(user):
        """
        Generates dashboard statistics for the Department Manager.
        """
        today = timezone.localdate()

        pending = WorkflowService.list_pending(user).count()
        approved_today = WorkflowHistory.objects.filter(
            performed_by=user, action=WorkflowAction.APPROVE, created_at__date=today
        ).count()
        rejected_today = WorkflowHistory.objects.filter(
            performed_by=user, action=WorkflowAction.REJECT, created_at__date=today
        ).count()

        cards = [
            {"title": "Pending Approval", "value": str(pending), "description": "Awaiting manager authorization"},
            {"title": "Approved Today", "value": str(approved_today), "description": "Approved by you today"},
            {"title": "Rejected Bills", "value": str(rejected_today), "description": "Rejected by you today"},
        ]

        return {
            "role": UserRole.MANAGER,
            "cards": cards,
        }

    @staticmethod
    def get_accounts_dashboard(user):
        """
        Generates dashboard statistics for the Accounts department.
        """
        today = timezone.localdate()

        pending = WorkflowService.list_pending(user).count()
        cleared_today = WorkflowHistory.objects.filter(
            performed_by=user,
            action=WorkflowAction.APPROVE,
            to_status=BillStatus.ACCOUNTS_CLEARED,
            created_at__date=today,
        ).count()
        rejected_today = WorkflowHistory.objects.filter(
            performed_by=user, action=WorkflowAction.REJECT, created_at__date=today
        ).count()

        cards = [
            {"title": "Pending Verification", "value": str(pending), "description": "Awaiting final clearance"},
            {"title": "Cleared Bills", "value": str(cleared_today), "description": "Cleared by you today"},
            {"title": "Rejected Bills", "value": str(rejected_today), "description": "Rejected by you today"},
        ]

        return {
            "role": UserRole.ACCOUNTS,
            "cards": cards,
        }
