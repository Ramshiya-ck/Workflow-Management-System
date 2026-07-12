from rest_framework import views, permissions
from rest_framework.response import Response

from core.choices import UserRole
from .services import DashboardService
from .serializers import DashboardMetricsSerializer


class DashboardView(views.APIView):
    """
    Dashboard API returning KPIs, vendor/department distributions and trends.
    Thin view delegating to role-based dashboard service aggregates.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Dispatch to the appropriate role-based dashboard service
        if user.is_superuser or user.role == UserRole.SUPER_ADMIN:
            metrics = DashboardService.get_super_admin_dashboard(user)
        elif user.role == UserRole.DATA_ENTRY:
            # Accommodates both receiving and data entry dashboard queues for the data entry role
            view_param = request.query_params.get("view")
            if view_param == "receiving":
                metrics = DashboardService.get_receiving_dashboard(user)
            else:
                metrics = DashboardService.get_data_entry_dashboard(user)
        elif user.role == UserRole.SUPERVISOR:
            metrics = DashboardService.get_supervisor_dashboard(user)
        elif user.role == UserRole.DEPARTMENT_MANAGER:
            metrics = DashboardService.get_manager_dashboard(user)
        elif user.role == UserRole.ACCOUNTS:
            metrics = DashboardService.get_accounts_dashboard(user)
        else:
            # Fallback
            metrics = DashboardService.get_data_entry_dashboard(user)

        serializer = DashboardMetricsSerializer(metrics)
        return Response(
            {
                "success": True,
                "message": "Dashboard statistics retrieved successfully.",
                "data": serializer.data,
            }
        )
