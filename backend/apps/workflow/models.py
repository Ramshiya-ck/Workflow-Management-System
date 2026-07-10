from django.db import models
from django.conf import settings
from core.choices import BillStatus, WorkflowAction


class WorkflowHistory(models.Model):
    """
    Tracks state transitions of bills along with comments, actions and audit trail.
    """

    bill = models.ForeignKey(
        "bills.Bill",
        on_delete=models.CASCADE,
        related_name="history",
    )

    from_status = models.CharField(
        max_length=30,
        choices=BillStatus.choices,
        blank=True,
        null=True,
    )

    to_status = models.CharField(
        max_length=30,
        choices=BillStatus.choices,
    )

    action = models.CharField(
        max_length=20,
        choices=WorkflowAction.choices,
    )

    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="workflow_actions_performed",
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="workflow_reassignments",
        help_text="User to whom the bill was reassigned during this step (if applicable)",
    )

    comments = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    class Meta:
        db_table = "workflow_history"
        ordering = ["created_at"]
        verbose_name = "Workflow History"
        verbose_name_plural = "Workflow Histories"

    def __str__(self):
        return f"Bill {self.bill.bill_number}: {self.from_status} -> {self.to_status} ({self.action})"
