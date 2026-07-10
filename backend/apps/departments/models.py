from django.db import models


class Department(models.Model):
    """
    Enterprise Department Model
    """

    name = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
    )

    code = models.CharField(
        max_length=10,
        unique=True,
        db_index=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "departments"
        ordering = ["name"]
        verbose_name = "Department"
        verbose_name_plural = "Departments"

    def __str__(self):
        return f"{self.name} ({self.code})"
