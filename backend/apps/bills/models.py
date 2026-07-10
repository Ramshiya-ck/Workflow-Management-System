from django.db import models
from django.conf import settings
from core.choices import BillStatus


class BillManager(models.Manager):
    """
    Manager to exclude soft-deleted bills by default
    """

    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class Bill(models.Model):
    """
    Enterprise Bill Model
    """

    bill_number = models.CharField(
        max_length=50,
        db_index=True,
    )

    bill_date = models.DateField()

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    vendor = models.ForeignKey(
        "vendors.Vendor",
        on_delete=models.PROTECT,
        related_name="bills",
    )

    department = models.ForeignKey(
        "departments.Department",
        on_delete=models.PROTECT,
        related_name="bills",
    )

    tracking_id = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
    )

    current_status = models.CharField(
        max_length=30,
        choices=BillStatus.choices,
        default=BillStatus.RECEIVING,
        db_index=True,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_bills",
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_bills",
    )

    is_deleted = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # Active objects manager
    objects = BillManager()
    # All objects manager (including deleted)
    all_objects = models.Manager()

    class Meta:
        db_table = "bills"
        ordering = ["-created_at"]
        verbose_name = "Bill"
        verbose_name_plural = "Bills"
        # Unique Vendor + Bill Number validation constraint
        unique_together = ("vendor", "bill_number")

    def soft_delete(self):
        self.is_deleted = True
        self.save()

    def __str__(self):
        return f"Bill {self.bill_number} - {self.vendor.name} ({self.current_status})"
