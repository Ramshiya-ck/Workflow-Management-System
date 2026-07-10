from rest_framework import serializers
from apps.users.serializers import CustomUserSerializer
from .models import LoginActivity, ActivityLog


class LoginActivitySerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = LoginActivity
        fields = ("id", "user", "email", "status", "ip_address", "user_agent", "created_at")


class ActivityLogSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    content_type_name = serializers.CharField(source="content_type.model", read_only=True)

    class Meta:
        model = ActivityLog
        fields = (
            "id",
            "user",
            "action",
            "content_type_name",
            "object_id",
            "object_repr",
            "changes",
            "created_at",
        )
