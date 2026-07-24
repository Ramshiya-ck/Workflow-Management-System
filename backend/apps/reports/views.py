from django.http import HttpResponse
from rest_framework import views, permissions, status
from rest_framework.response import Response
from apps.bills.serializers import BillSerializer
from core.pagination.standard import StandardResultsSetPagination
from core.choices import UserRole
from .services import ReportService
from .serializers import ReportWorkflowHistorySerializer

class IsReportAuditorOrAdmin(permissions.BasePermission):
    """
    Permission class checking if request user is SUPER_ADMIN or AUDIT_MANAGER.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_superuser or request.user.role in [UserRole.SUPER_ADMIN, UserRole.AUDIT_MANAGER]


class ReportView(views.APIView):
    """
    API for retrieving filtered bills list for reporting views.
    """
    permission_classes = [permissions.IsAuthenticated, IsReportAuditorOrAdmin]

    def get(self, request):
        filters = {
            "department": request.query_params.get("department"),
            "vendor": request.query_params.get("vendor"),
            "status": request.query_params.get("status"),
            "startDate": request.query_params.get("startDate"),
            "endDate": request.query_params.get("endDate"),
            "search": request.query_params.get("search"),
            "ordering": request.query_params.get("ordering"),
            "rejected": request.query_params.get("rejected"),
        }

        queryset = ReportService.get_report_data(filters)
        paginator = StandardResultsSetPagination()
        paginated_qs = paginator.paginate_queryset(queryset, request, view=self)
        serializer = BillSerializer(paginated_qs, many=True)

        return Response(
            {
                "success": True,
                "message": "Report dataset generated successfully.",
                "data": {
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "results": serializer.data,
                },
            }
        )


class DashboardSummaryReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsReportAuditorOrAdmin]

    def get(self, request):
        filters = {
            "department": request.query_params.get("department"),
            "vendor": request.query_params.get("vendor"),
            "status": request.query_params.get("status"),
            "startDate": request.query_params.get("startDate"),
            "endDate": request.query_params.get("endDate"),
            "search": request.query_params.get("search"),
            "rejected": request.query_params.get("rejected"),
        }
        data = ReportService.get_dashboard_summary(filters)
        return Response({"success": True, "data": data})


class DepartmentReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsReportAuditorOrAdmin]

    def get(self, request):
        filters = {
            "department": request.query_params.get("department"),
            "vendor": request.query_params.get("vendor"),
            "status": request.query_params.get("status"),
            "startDate": request.query_params.get("startDate"),
            "endDate": request.query_params.get("endDate"),
            "search": request.query_params.get("search"),
            "rejected": request.query_params.get("rejected"),
        }
        data = ReportService.get_department_report(filters)
        return Response({"success": True, "data": data})


class VendorReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsReportAuditorOrAdmin]

    def get(self, request):
        filters = {
            "department": request.query_params.get("department"),
            "vendor": request.query_params.get("vendor"),
            "status": request.query_params.get("status"),
            "startDate": request.query_params.get("startDate"),
            "endDate": request.query_params.get("endDate"),
            "search": request.query_params.get("search"),
            "rejected": request.query_params.get("rejected"),
        }
        data = ReportService.get_vendor_report(filters)
        return Response({"success": True, "data": data})


class WorkflowReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsReportAuditorOrAdmin]

    def get(self, request):
        filters = {
            "department": request.query_params.get("department"),
            "vendor": request.query_params.get("vendor"),
            "status": request.query_params.get("status"),
            "startDate": request.query_params.get("startDate"),
            "endDate": request.query_params.get("endDate"),
            "search": request.query_params.get("search"),
            "rejected": request.query_params.get("rejected"),
        }
        data = ReportService.get_workflow_report(filters)
        return Response({"success": True, "data": data})


class StatusReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsReportAuditorOrAdmin]

    def get(self, request):
        filters = {
            "department": request.query_params.get("department"),
            "vendor": request.query_params.get("vendor"),
            "status": request.query_params.get("status"),
            "startDate": request.query_params.get("startDate"),
            "endDate": request.query_params.get("endDate"),
            "search": request.query_params.get("search"),
            "rejected": request.query_params.get("rejected"),
        }
        data = ReportService.get_status_report(filters)
        return Response({"success": True, "data": data})


class AgingReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsReportAuditorOrAdmin]

    def get(self, request):
        filters = {
            "department": request.query_params.get("department"),
            "vendor": request.query_params.get("vendor"),
            "status": request.query_params.get("status"),
            "startDate": request.query_params.get("startDate"),
            "endDate": request.query_params.get("endDate"),
            "search": request.query_params.get("search"),
            "rejected": request.query_params.get("rejected"),
        }
        data = ReportService.get_aging_report(filters)
        return Response({"success": True, "data": data})


class AuditReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsReportAuditorOrAdmin]

    def get(self, request):
        filters = {
            "department": request.query_params.get("department"),
            "vendor": request.query_params.get("vendor"),
            "status": request.query_params.get("status"),
            "startDate": request.query_params.get("startDate"),
            "endDate": request.query_params.get("endDate"),
            "search": request.query_params.get("search"),
            "rejected": request.query_params.get("rejected"),
        }
        queryset = ReportService.get_audit_report(filters)
        paginator = StandardResultsSetPagination()
        paginated_qs = paginator.paginate_queryset(queryset, request, view=self)
        serializer = ReportWorkflowHistorySerializer(paginated_qs, many=True)

        return Response(
            {
                "success": True,
                "message": "Audit trail report retrieved successfully.",
                "data": {
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "results": serializer.data,
                },
            }
        )


class ExportCSVReportView(views.APIView):
    """
    Downloads the report dataset as a CSV spreadsheet.
    """
    permission_classes = [permissions.IsAuthenticated, IsReportAuditorOrAdmin]

    def get(self, request):
        filters = {
            "department": request.query_params.get("department"),
            "vendor": request.query_params.get("vendor"),
            "status": request.query_params.get("status"),
            "startDate": request.query_params.get("startDate"),
            "endDate": request.query_params.get("endDate"),
            "search": request.query_params.get("search"),
            "rejected": request.query_params.get("rejected"),
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
    permission_classes = [permissions.IsAuthenticated, IsReportAuditorOrAdmin]

    def get(self, request):
        filters = {
            "department": request.query_params.get("department"),
            "vendor": request.query_params.get("vendor"),
            "status": request.query_params.get("status"),
            "startDate": request.query_params.get("startDate"),
            "endDate": request.query_params.get("endDate"),
            "search": request.query_params.get("search"),
            "rejected": request.query_params.get("rejected"),
        }

        queryset = ReportService.get_report_data(filters)
        html_data = ReportService.generate_html_report(queryset)

        return HttpResponse(html_data, content_type="text/html")
