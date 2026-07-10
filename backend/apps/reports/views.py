from django.http import HttpResponse
from rest_framework import views, permissions, status
from rest_framework.response import Response
from apps.bills.serializers import BillSerializer
from .services import ReportService


class ReportView(views.APIView):
    """
    API for retrieving filtered bills list for reporting views.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Gather search and filter parameters from request query params
        filters = {
            "department_id": request.query_params.get("department_id"),
            "vendor_id": request.query_params.get("vendor_id"),
            "status": request.query_params.get("status"),
            "start_date": request.query_params.get("start_date"),
            "end_date": request.query_params.get("end_date"),
        }

        queryset = ReportService.get_report_data(filters)
        serializer = BillSerializer(queryset, many=True)

        return Response(
            {
                "success": True,
                "message": "Report dataset generated successfully.",
                "data": serializer.data,
            }
        )


class ExportCSVReportView(views.APIView):
    """
    Downloads the report dataset as a CSV spreadsheet.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filters = {
            "department_id": request.query_params.get("department_id"),
            "vendor_id": request.query_params.get("vendor_id"),
            "status": request.query_params.get("status"),
            "start_date": request.query_params.get("start_date"),
            "end_date": request.query_params.get("end_date"),
        }

        queryset = ReportService.get_report_data(filters)
        csv_data = ReportService.generate_csv_report(queryset)

        response = HttpResponse(csv_data, content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="aak_wms_report.csv"'
        return response


class ExportHTMLReportView(views.APIView):
    """
    Renders printable report page that opens standard print dialog.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filters = {
            "department_id": request.query_params.get("department_id"),
            "vendor_id": request.query_params.get("vendor_id"),
            "status": request.query_params.get("status"),
            "start_date": request.query_params.get("start_date"),
            "end_date": request.query_params.get("end_date"),
        }

        queryset = ReportService.get_report_data(filters)
        html_data = ReportService.generate_html_report(queryset)

        return HttpResponse(html_data, content_type="text/html")
