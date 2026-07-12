from django.db import models
from django.conf import settings
from django.db.models.functions import Lower
from django.db.models.constraints import UniqueConstraint


class Department(models.Model):
    """
    Model representing internal store/hypermarket departments.
    """

    name = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Unique name of the department (case-insensitive).",
    )

    code = models.CharField(
        max_length=10,
        unique=True,
        help_text="Unique uppercase immutable code (2-10 characters).",
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Designates whether this department is active and selectable.",
    )

    # Ownership Tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_departments",
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_departments",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "departments"
        ordering = ["name"]
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        constraints = [
            # Case-insensitive uniqueness check for name
            UniqueConstraint(
                Lower("name"), name="unique_department_name_case_insensitive"
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"
