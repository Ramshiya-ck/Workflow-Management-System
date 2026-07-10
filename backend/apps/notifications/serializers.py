from rest_framework import serializers
from apps.bills.serializers import BillSerializer
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    bill = BillSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ("id", "bill", "title", "message", "notification_type", "is_read", "created_at")
        read_only_fields = (
            "id",
            "bill",
            "title",
            "message",
            "notification_type",
            "is_read",
            "created_at",
        )
