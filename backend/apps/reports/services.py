import csv
import io
from django.db import models
from django.utils import timezone
from apps.bills.models import Bill
from apps.workflow.models import WorkflowHistory
from apps.vendors.models import Vendor
from apps.departments.models import Department
from core.choices import BillStatus, WorkflowAction

class ReportService:
    """
    Service Layer for generating enterprise reports and files (CSV/HTML)
    and compiling real-time analytics indicators.
    """

    @staticmethod
    def get_report_data(filters=None):
        """
        Retrieves filtered bills queryset based on reports parameters.
        """
        if filters is None:
            filters = {}

        # Default query retrieves all bills including related values for DB efficiency
        queryset = Bill.objects.select_related("vendor", "department", "created_by").all()

        department = filters.get("department")
        if department:
            queryset = queryset.filter(department__name__iexact=department)

        vendor = filters.get("vendor")
        if vendor:
            queryset = queryset.filter(vendor_id=vendor)

        status = filters.get("status")
        if status:
            queryset = queryset.filter(current_status=status)

        start_date = filters.get("startDate") or filters.get("start_date")
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)

        end_date = filters.get("endDate") or filters.get("end_date")
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        rejected = filters.get("rejected")
        if rejected == "true" or rejected is True:
            queryset = queryset.filter(history__action=WorkflowAction.REJECT).distinct()

        search = filters.get("search")
        if search:
            queryset = queryset.filter(
                models.Q(tracking_id__icontains=search)
                | models.Q(bill_number__icontains=search)
                | models.Q(vendor__name__icontains=search)
            )

        ordering = filters.get("ordering")
        if ordering:
            if ordering == "age":
                queryset = queryset.order_by("created_at")
            elif ordering == "-age":
                queryset = queryset.order_by("-created_at")
            elif ordering == "amount":
                queryset = queryset.order_by("amount")
            elif ordering == "-amount":
                queryset = queryset.order_by("-amount")
            elif ordering == "vendor":
                queryset = queryset.order_by("vendor__name")
            elif ordering == "-vendor":
                queryset = queryset.order_by("-vendor__name")
            elif ordering == "department":
                queryset = queryset.order_by("department__name")
            elif ordering == "-department":
                queryset = queryset.order_by("-department__name")
            else:
                queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by("-created_at")

        return queryset

    @staticmethod
    def get_dashboard_summary(filters=None):
        base_qs = ReportService.get_report_data(filters)

        total_bills = base_qs.count()
        pending_bills = base_qs.exclude(current_status=BillStatus.ACCOUNTS_CLEARED).count()
        completed_bills = base_qs.filter(current_status=BillStatus.ACCOUNTS_CLEARED).count()

        rejected_bills = WorkflowHistory.objects.filter(
            bill__in=base_qs,
            action=WorkflowAction.REJECT
        ).values("bill").distinct().count()

        bills_on_hold = base_qs.filter(current_status=BillStatus.HOLDING).count()

        total_vendors = base_qs.values("vendor").distinct().count()
        total_departments = base_qs.values("department").distinct().count()

        return {
            "total_bills": total_bills,
            "pending_bills": pending_bills,
            "completed_bills": completed_bills,
            "rejected_bills": rejected_bills,
            "bills_on_hold": bills_on_hold,
            "total_vendors": total_vendors,
            "total_departments": total_departments,
        }

    @staticmethod
    def get_department_report(filters=None):
        base_qs = ReportService.get_report_data(filters)

        report = base_qs.values("department__name").annotate(
            total_bills=models.Count("id"),
            pending=models.Count("id", filter=~models.Q(current_status=BillStatus.ACCOUNTS_CLEARED)),
            completed=models.Count("id", filter=models.Q(current_status=BillStatus.ACCOUNTS_CLEARED)),
            hold=models.Count("id", filter=models.Q(current_status=BillStatus.HOLDING)),
        ).order_by("-total_bills")

        rejected_counts = WorkflowHistory.objects.filter(
            bill__in=base_qs,
            action=WorkflowAction.REJECT
        ).values("bill__department__name").annotate(
            count=models.Count("bill", distinct=True)
        )
        rejected_map = {rc["bill__department__name"]: rc["count"] for rc in rejected_counts}

        results = []
        for r in report:
            dept_name = r["department__name"] or "Unassigned"
            rejected_count = rejected_map.get(dept_name, 0)

            results.append({
                "department": dept_name,
                "total_bills": r["total_bills"],
                "pending": r["pending"],
                "completed": r["completed"],
                "rejected": rejected_count,
                "hold": r["hold"]
            })
        return results

    @staticmethod
    def get_vendor_report(filters=None):
        base_qs = ReportService.get_report_data(filters)

        report = base_qs.values("vendor__name").annotate(
            total_bills=models.Count("id"),
            total_amount=models.Sum("amount"),
            pending=models.Count("id", filter=~models.Q(current_status=BillStatus.ACCOUNTS_CLEARED)),
            completed=models.Count("id", filter=models.Q(current_status=BillStatus.ACCOUNTS_CLEARED)),
        ).order_by("-total_bills")

        results = []
        for r in report:
            results.append({
                "vendor": r["vendor__name"] or "Unknown Vendor",
                "total_bills": r["total_bills"],
                "total_amount": float(r["total_amount"] or 0),
                "pending": r["pending"],
                "completed": r["completed"],
            })
        return results

    @staticmethod
    def get_workflow_report(filters=None):
        base_qs = ReportService.get_report_data(filters)

        latest_history = WorkflowHistory.objects.filter(
            bill=models.OuterRef("pk"),
            to_status=models.OuterRef("current_status")
        ).order_by("-created_at")

        annotated_bills = base_qs.annotate(
            latest_transition_time=models.Subquery(latest_history.values("created_at")[:1])
        )

        from collections import defaultdict
        stage_data = defaultdict(list)
        for bill in annotated_bills:
            transition_time = bill.latest_transition_time or bill.created_at
            hours = (timezone.now() - transition_time).total_seconds() / 3600.0
            stage_data[bill.current_status].append(hours)

        results = []
        for status_val, hours_list in stage_data.items():
            avg_hours = round(sum(hours_list) / len(hours_list), 1) if hours_list else 0.0
            results.append({
                "current_stage": status_val,
                "bills_count": len(hours_list),
                "avg_processing_time": avg_hours
            })
        return results

    @staticmethod
    def get_status_report(filters=None):
        base_qs = ReportService.get_report_data(filters)

        report = base_qs.values("current_status").annotate(
            value=models.Count("id")
        )

        status_labels = dict(BillStatus.choices)

        results = []
        for r in report:
            status_val = r["current_status"]
            results.append({
                "status": status_val,
                "label": status_labels.get(status_val, status_val),
                "value": r["value"]
            })
        return results

    @staticmethod
    def get_aging_report(filters=None):
        base_qs = ReportService.get_report_data(filters)

        cutoff = timezone.now() - timezone.timedelta(hours=48)
        aging_qs = base_qs.filter(created_at__lte=cutoff).exclude(current_status=BillStatus.ACCOUNTS_CLEARED)

        results = []
        for bill in aging_qs:
            pending_duration = timezone.now() - bill.created_at
            pending_hours = int(pending_duration.total_seconds() / 3600.0)

            results.append({
                "id": bill.id,
                "tracking_id": bill.tracking_id,
                "bill_number": bill.bill_number,
                "vendor_name": bill.vendor.name,
                "department_name": bill.department.name if bill.department else "Unassigned",
                "current_status": bill.current_status,
                "created_at": bill.created_at.isoformat(),
                "pending_hours": pending_hours,
            })
        return results

    @staticmethod
    def get_audit_report(filters=None):
        if filters is None:
            filters = {}

        queryset = WorkflowHistory.objects.select_related(
            "bill", "bill__vendor", "bill__department", "performed_by"
        ).all()

        department = filters.get("department")
        if department:
            queryset = queryset.filter(bill__department__name__iexact=department)

        vendor = filters.get("vendor")
        if vendor:
            queryset = queryset.filter(bill__vendor_id=vendor)

        status = filters.get("status")
        if status:
            queryset = queryset.filter(to_status=status)

        start_date = filters.get("startDate") or filters.get("start_date")
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)

        end_date = filters.get("endDate") or filters.get("end_date")
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        search = filters.get("search")
        if search:
            queryset = queryset.filter(
                models.Q(bill__tracking_id__icontains=search)
                | models.Q(bill__bill_number__icontains=search)
                | models.Q(bill__vendor__name__icontains=search)
            )

        return queryset.order_by("-created_at")

    @staticmethod
    def generate_csv_report(queryset):
        """
        Formats queryset records into a raw CSV string for spreadsheets.
        """
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(
            [
                "Tracking ID",
                "Bill Number",
                "Bill Date",
                "Amount (INR)",
                "Vendor Name",
                "Department Name",
                "Current Status",
                "Created By",
                "Created At",
            ]
        )

        for bill in queryset:
            writer.writerow(
                [
                    bill.tracking_id,
                    bill.bill_number,
                    bill.bill_date.strftime("%Y-%m-%d") if bill.bill_date else "",
                    float(bill.amount),
                    bill.vendor.name,
                    bill.department.name if bill.department else "Unassigned",
                    bill.get_current_status_display(),
                    bill.created_by.email,
                    bill.created_at.strftime("%Y-%m-%d %H:%M:%S") if bill.created_at else "",
                ]
            )

        return output.getvalue()

    @staticmethod
    def generate_html_report(queryset):
        """
        Generates a clean HTML structure used for browser printing to PDF.
        """
        rows_html = ""
        total_amount = 0

        for idx, bill in enumerate(queryset, 1):
            total_amount += bill.amount
            rows_html += f"""
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">{idx}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{bill.tracking_id}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{bill.bill_number}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{bill.bill_date}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{bill.vendor.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{bill.department.name if bill.department else 'Unassigned'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{bill.get_current_status_display()}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹{bill.amount:,.2f}</td>
            </tr>
            """

        html_content = f"""
        <html>
        <head>
            <title>AAK Hypermarket - Workflow Management Report</title>
            <style>
                body {{ font-family: 'Arial', sans-serif; margin: 30px; color: #333; }}
                table {{ border-collapse: collapse; width: 100%; margin-top: 20px; }}
                th {{ background-color: #2563eb; color: white; text-align: left; padding: 12px; }}
                h2 {{ color: #1e3a8a; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }}
                .summary-card {{ background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; width: fit-content; }}
            </style>
        </head>
        <body onload="window.print()">
            <h2>AAK Workflow System - Bill Tracking Report</h2>
            <div class="summary-card">
                <strong>Total Records:</strong> {len(queryset)}<br>
                <strong>Total Amount:</strong> ₹{total_amount:,.2f}
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 5%">#</th>
                        <th>Tracking ID</th>
                        <th>Bill Number</th>
                        <th>Bill Date</th>
                        <th>Vendor</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {rows_html}
                </tbody>
            </table>
        </body>
        </html>
        """
        return html_content
