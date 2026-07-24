from rest_framework import serializers
from apps.workflow.models import WorkflowHistory

class ReportWorkflowHistorySerializer(serializers.ModelSerializer):
    tracking_id = serializers.CharField(source="bill.tracking_id", read_only=True)
    performed_by_name = serializers.CharField(source="performed_by.name", read_only=True)

    class Meta:
        model = WorkflowHistory
        fields = (
            "id",
            "tracking_id",
            "from_status",
            "to_status",
            "action",
            "performed_by_name",
            "comments",
            "created_at",
        )
