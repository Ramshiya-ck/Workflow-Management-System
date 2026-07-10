from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from .services import NotificationService


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet to list and update in-app notifications.
    """

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users only see notifications belonging to them
        return Notification.objects.filter(recipient=self.request.user).order_by("-created_at")

    @action(detail=True, methods=["post"], url_path="read")
    def read(self, request, pk=None):
        """
        Marks a specific notification as read.
        """
        notification = NotificationService.mark_as_read(notification_id=pk, user=request.user)
        if not notification:
            return Response(
                {"success": False, "message": "Notification not found.", "data": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(notification)
        return Response(
            {
                "success": True,
                "message": "Notification marked as read.",
                "data": serializer.data,
            }
        )

    @action(detail=False, methods=["post"], url_path="read-all")
    def read_all(self, request):
        """
        Marks all unread notifications of the user as read.
        """
        NotificationService.mark_all_as_read(user=request.user)
        return Response(
            {"success": True, "message": "All notifications marked as read.", "data": None}
        )

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        """
        Returns count of unread notifications for currently logged in user.
        """
        count = self.get_queryset().filter(is_read=False).count()
        return Response(
            {
                "success": True,
                "message": "Unread count retrieved successfully.",
                "data": {"count": count},
            }
        )
