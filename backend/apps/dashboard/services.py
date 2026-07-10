from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from apps.bills.models import Bill
from core.choices import BillStatus


class DashboardService:
    """
    Business logic layer for aggregating metrics and statistical data.
    Provides role-based context filters.
    """

    @staticmethod
    def get_metrics(user):
        """
        Retrieves aggregated KPIs, vendor/department distributions and trends.
        """
        # Base query excluding soft deleted bills
        base_query = Bill.objects.all()

        # KPIs calculations
        pending_stats = base_query.exclude(current_status=BillStatus.ACCOUNTS_CLEARED).aggregate(
            count=Count("id"), total=Sum("amount")
        )
        completed_stats = base_query.filter(current_status=BillStatus.ACCOUNTS_CLEARED).aggregate(
            count=Count("id"), total=Sum("amount")
        )

        pending_count = pending_stats["count"] or 0
        pending_amount = pending_stats["total"] or 0.00
        completed_count = completed_stats["count"] or 0
        completed_amount = completed_stats["total"] or 0.00

        # Department wise distribution
        dept_distribution = (
            base_query.values("department__name", "department__code")
            .annotate(count=Count("id"), total=Sum("amount"))
            .order_by("-total")[:10]
        )

        dept_wise = [
            {
                "name": item["department__name"],
                "code": item["department__code"],
                "count": item["count"],
                "amount": float(item["total"] or 0),
            }
            for item in dept_distribution
            if item["department__name"]
        ]

        # Vendor wise distribution
        vendor_distribution = (
            base_query.values("vendor__name")
            .annotate(count=Count("id"), total=Sum("amount"))
            .order_by("-total")[:10]
        )

        vendor_wise = [
            {
                "name": item["vendor__name"],
                "count": item["count"],
                "amount": float(item["total"] or 0),
            }
            for item in vendor_distribution
            if item["vendor__name"]
        ]

        # Status wise counts
        status_distribution = base_query.values("current_status").annotate(
            count=Count("id"), total=Sum("amount")
        )

        status_wise = [
            {
                "status": item["current_status"],
                "count": item["count"],
                "amount": float(item["total"] or 0),
            }
            for item in status_distribution
        ]

        # Monthly Trends (last 6 months)
        trends = (
            base_query.annotate(month=TruncMonth("created_at"))
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

        # User specific work queues
        assigned_to_user_count = base_query.filter(assigned_to=user).count()

        return {
            "summary": {
                "pending_count": pending_count,
                "pending_amount": float(pending_amount),
                "completed_count": completed_count,
                "completed_amount": float(completed_amount),
                "total_count": pending_count + completed_count,
                "total_amount": float(pending_amount + completed_amount),
                "my_assigned_count": assigned_to_user_count,
            },
            "department_wise": dept_wise,
            "vendor_wise": vendor_wise,
            "status_wise": status_wise,
            "monthly_trends": monthly_trends,
        }
