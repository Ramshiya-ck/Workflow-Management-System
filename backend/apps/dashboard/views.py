from rest_framework import views, permissions
from rest_framework.response import Response
from .services import DashboardService


class DashboardView(views.APIView):
    """
    Dashboard API returning KPIs, vendor/department distributions and trends.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        metrics = DashboardService.get_metrics(request.user)
        return Response(
            {
                "success": True,
                "message": "Dashboard statistics retrieved successfully.",
                "data": metrics,
            }
        )
