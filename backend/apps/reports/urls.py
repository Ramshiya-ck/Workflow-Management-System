from django.urls import path
from .views import (
    ReportView,
    DashboardSummaryReportView,
    DepartmentReportView,
    VendorReportView,
    WorkflowReportView,
    StatusReportView,
    AgingReportView,
    AuditReportView,
    ExportCSVReportView,
    ExportHTMLReportView,
)

urlpatterns = [
    path("", ReportView.as_view(), name="report_list"),
    path("summary/", DashboardSummaryReportView.as_view(), name="report_summary"),
    path("department/", DepartmentReportView.as_view(), name="report_department"),
    path("vendor/", VendorReportView.as_view(), name="report_vendor"),
    path("workflow/", WorkflowReportView.as_view(), name="report_workflow"),
    path("status/", StatusReportView.as_view(), name="report_status"),
    path("aging/", AgingReportView.as_view(), name="report_aging"),
    path("audit/", AuditReportView.as_view(), name="report_audit"),
    path("csv/", ExportCSVReportView.as_view(), name="report_export_csv"),
    path("html/", ExportHTMLReportView.as_view(), name="report_export_html"),
]
