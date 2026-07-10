from rest_framework import serializers
from apps.users.serializers import CustomUserSerializer
from .models import WorkflowHistory
from core.choices import WorkflowAction


class WorkflowHistorySerializer(serializers.ModelSerializer):
    performed_by = CustomUserSerializer(read_only=True)
    assigned_to = CustomUserSerializer(read_only=True)

    class Meta:
        model = WorkflowHistory
        fields = (
            "id",
            "from_status",
            "to_status",
            "action",
            "performed_by",
            "assigned_to",
            "comments",
            "created_at",
        )


class WorkflowTransitionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=WorkflowAction.choices)
    target_user_id = serializers.IntegerField(required=False, allow_null=True)
    comments = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        action = attrs.get("action")
        comments = attrs.get("comments", "").strip()
        target_user_id = attrs.get("target_user_id")

        if action in [WorkflowAction.REJECT] and not comments:
            raise serializers.ValidationError(
                {"comments": ["Comments are required when rejecting a bill."]}
            )

        if action == WorkflowAction.REASSIGN:
            if not target_user_id:
                raise serializers.ValidationError(
                    {"target_user_id": ["Target user is required for reassignment."]}
                )
            if not comments:
                raise serializers.ValidationError(
                    {"comments": ["Comments/reasons are required for reassignment."]}
                )

        return attrs
