from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # API Version 1 Namespace
    path(
        "api/v1/",
        include(
            [
                path("auth/", include("apps.accounts.urls")),
                path("users/", include("apps.users.urls")),
                path("departments/", include("apps.departments.urls")),
                path("vendors/", include("apps.vendors.urls")),
                path("bills/", include("apps.bills.urls")),
                path("workflow/", include("apps.workflow.urls")),
                path("dashboard/", include("apps.dashboard.urls")),
                path("reports/", include("apps.reports.urls")),
                path("notifications/", include("apps.notifications.urls")),
                path("audit/", include("apps.audit.urls")),
            ]
        ),
    ),
    # API Documentation (Spectacular)
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
