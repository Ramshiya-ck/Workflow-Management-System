from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType


class LoginActivity(models.Model):
    """
    Tracks all successful and failed authentication attempts
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="login_activities",
    )

    email = models.EmailField(
        help_text="Email address entered during login (especially useful for failed logins)",
    )

    status = models.CharField(
        max_length=20,  # SUCCESS / FAILED
        db_index=True,
    )

    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
    )

    user_agent = models.TextField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    class Meta:
        db_table = "login_activities"
        ordering = ["-created_at"]
        verbose_name = "Login Activity"
        verbose_name_plural = "Login Activities"

    def __str__(self):
        return f"{self.email} - {self.status} at {self.created_at}"


class ActivityLog(models.Model):
    """
    Tracks detailed operations (CREATE, UPDATE, DELETE) on enterprise resources
    """

    class ActionChoices(models.TextChoices):
        CREATE = "CREATE", "Create"
        UPDATE = "UPDATE", "Update"
        DELETE = "DELETE", "Delete"
        OTHER = "OTHER", "Other"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_logs",
    )

    action = models.CharField(
        max_length=20,
        choices=ActionChoices.choices,
        db_index=True,
    )

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
    )

    object_id = models.CharField(
        max_length=255,
    )

    object_repr = models.CharField(
        max_length=255,
    )

    changes = models.JSONField(
        default=dict,
        blank=True,
        help_text="JSON tracking changed fields: { 'field_name': [old_value, new_value] }",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    class Meta:
        db_table = "activity_logs"
        ordering = ["-created_at"]
        verbose_name = "Activity Log"
        verbose_name_plural = "Activity Logs"

    def __str__(self):
        username = self.user.email if self.user else "System"
        return f"{username} performed {self.action} on {self.object_repr}"
