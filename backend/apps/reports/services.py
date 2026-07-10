import csv
import io
from apps.bills.models import Bill


class ReportService:
    """
    Service Layer for generating enterprise reports and files (CSV/HTML).
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

        # Dynamic filter applications
        department_id = filters.get("department_id")
        if department_id:
            queryset = queryset.filter(department_id=department_id)

        vendor_id = filters.get("vendor_id")
        if vendor_id:
            queryset = queryset.filter(vendor_id=vendor_id)

        status = filters.get("status")
        if status:
            queryset = queryset.filter(current_status=status)

        start_date = filters.get("start_date")
        if start_date:
            queryset = queryset.filter(bill_date__gte=start_date)

        end_date = filters.get("end_date")
        if end_date:
            queryset = queryset.filter(bill_date__lte=end_date)

        return queryset

    @staticmethod
    def generate_csv_report(queryset):
        """
        Formats queryset records into a raw CSV string for spreadsheets.
        """
        output = io.StringIO()
        writer = csv.writer(output)

        # Header Row
        writer.writerow(
            [
                "Tracking ID",
                "Bill Number",
                "Bill Date",
                "Amount (INR)",
                "Vendor Name",
                "Department Name",
                "Department Code",
                "Current Status",
                "Created By",
                "Created At",
            ]
        )

        # Content Rows
        for bill in queryset:
            writer.writerow(
                [
                    bill.tracking_id,
                    bill.bill_number,
                    bill.bill_date.strftime("%Y-%m-%d") if bill.bill_date else "",
                    float(bill.amount),
                    bill.vendor.name,
                    bill.department.name,
                    bill.department.code,
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
                <td style="border: 1px solid #ddd; padding: 8px;">{bill.department.name}</td>
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
