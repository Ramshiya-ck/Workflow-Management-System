from rest_framework import viewsets, permissions
from core.permissions.roles import IsSuperAdmin
from .models import LoginActivity, ActivityLog
from .serializers import LoginActivitySerializer, ActivityLogSerializer


class LoginActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Super Admin endpoint to audit authentication histories.
    """

    queryset = LoginActivity.objects.all().order_by("-created_at")
    serializer_class = LoginActivitySerializer
    permission_classes = [IsSuperAdmin]
    search_fields = ["email", "status", "ip_address"]


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Super Admin endpoint to audit database records changes logs.
    """

    queryset = ActivityLog.objects.all().order_by("-created_at")
    serializer_class = ActivityLogSerializer
    permission_classes = [IsSuperAdmin]
    search_fields = ["action", "object_repr", "user__email"]
