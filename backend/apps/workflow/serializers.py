from rest_framework import serializers
from apps.users.serializers import UserSummarySerializer
from .models import WorkflowHistory
from core.choices import WorkflowRejectReason


class WorkflowHistorySerializer(serializers.ModelSerializer):
    """
    Serializer to represent the step history of a Bill in a workflow.
    """

    performed_by = UserSummarySerializer(read_only=True)
    assigned_to = UserSummarySerializer(read_only=True)

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
            "reason_code",
            "reason_note",
            "created_at",
        )
        read_only_fields = fields


class WorkflowApproveSerializer(serializers.Serializer):
    """
    Validates payload to approve a bill.
    """

    comments = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        help_text="Optional remarks for approval.",
    )


class WorkflowRejectSerializer(serializers.Serializer):
    """
    Validates payload to reject a bill.
    """

    reason_code = serializers.ChoiceField(
        choices=WorkflowRejectReason.choices,
        help_text="Predefined rejection reason code.",
    )
    reason_note = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        help_text="Detailed note. Required if reason code is 'Other'.",
    )

    def validate(self, attrs):
        reason_code = attrs.get("reason_code")
        reason_note = attrs.get("reason_note", "").strip()

        if reason_code == WorkflowRejectReason.OTHER and not reason_note:
            raise serializers.ValidationError(
                {"reason_note": ["Custom reason notes are required when 'Other' is selected."]}
            )

        return attrs
