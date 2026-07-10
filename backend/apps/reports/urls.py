from django.urls import path
from .views import ReportView, ExportCSVReportView, ExportHTMLReportView

urlpatterns = [
    path("", ReportView.as_view(), name="report_list"),
    path("csv/", ExportCSVReportView.as_view(), name="report_export_csv"),
    path("html/", ExportHTMLReportView.as_view(), name="report_export_html"),
]
