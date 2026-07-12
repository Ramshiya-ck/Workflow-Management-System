from django.db import models
from django.conf import settings
from core.choices import BillStatus, WorkflowAction, WorkflowRejectReason



class WorkflowHistory(models.Model):
    """
    Tracks state transitions of bills along with comments, actions and audit trail.
    """

    bill = models.ForeignKey(
        "bills.Bill",
        on_delete=models.PROTECT,
        related_name="history",
        help_text="The associated bill tracked in this step.",
    )

    from_status = models.CharField(
        max_length=30,
        choices=BillStatus.choices,
        blank=True,
        null=True,
        help_text="The previous status of the bill.",
    )

    to_status = models.CharField(
        max_length=30,
        choices=BillStatus.choices,
        db_index=True,
        help_text="The target status of the bill after this step.",
    )

    action = models.CharField(
        max_length=20,
        choices=WorkflowAction.choices,
        db_index=True,
        help_text="The action taken in this workflow step.",
    )

    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="workflow_actions_performed",
        help_text="The user who performed the transition action.",
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="workflow_reassignments",
        help_text="User to whom the bill was reassigned during this step (if applicable).",
    )

    comments = models.TextField(
        blank=True,
        null=True,
        help_text="Remarks or reasons provided during this step.",
    )

    reason_code = models.CharField(
        max_length=50,
        choices=WorkflowRejectReason.choices,
        blank=True,
        null=True,
        help_text="Standard rejection reason code.",
    )

    reason_note = models.TextField(
        blank=True,
        null=True,
        help_text="Custom rejection remarks or details.",
    )


    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Timestamp of when the workflow action occurred.",
    )

    class Meta:
        db_table = "workflow_history"
        ordering = ["created_at"]
        verbose_name = "Workflow History"
        verbose_name_plural = "Workflow Histories"

    def __str__(self):
        return f"Bill {self.bill.bill_number}: {self.from_status} -> {self.to_status} ({self.action})"
