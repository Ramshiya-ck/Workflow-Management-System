from django.db import models
from django.conf import settings
from core.choices import BillStatus


class Bill(models.Model):
    """
    Enterprise Bill Model representing invoices registered for tracking.
    """

    bill_number = models.CharField(
        max_length=50,
        db_index=True,
        help_text="Invoice identifier (unique per vendor).",
    )

    bill_date = models.DateField(
        help_text="The date when the invoice was issued.",
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="The total amount payable on the invoice.",
    )

    tracking_id = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text="Auto-generated unique status tracking ID assigned by the Service Layer.",
    )

    vendor = models.ForeignKey(
        "vendors.Vendor",
        on_delete=models.PROTECT,
        related_name="bills",
        help_text="Associated vendor registering the invoice.",
    )

    department = models.ForeignKey(
        "departments.Department",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="bills",
        help_text="Internal store department assigned to this bill (nullable initially).",
    )

    current_status = models.CharField(
        max_length=30,
        choices=BillStatus.choices,
        default=BillStatus.RECEIVING,
        db_index=True,
        help_text="Current workflow state of the bill.",
    )

    rejection_reason = models.TextField(
        null=True,
        blank=True,
        help_text="Reason for bill rejection (reserved for workflow module).",
    )

    # Auditing / Ownership tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_bills",
        help_text="User who initially registered the bill.",
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_bills",
        help_text="User who last updated the bill details.",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="Timestamp when the bill was registered.",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the bill was last modified.",
    )

    class Meta:
        db_table = "bills"
        ordering = ["-created_at"]
        verbose_name = "Bill"
        verbose_name_plural = "Bills"
        constraints = [
            # Enforce positive invoice amount at database level
            models.CheckConstraint(
                condition=models.Q(amount__gt=0.00),
                name="bill_amount_must_be_positive"
            ),
            # Enforce composite uniqueness of vendor + bill_number
            models.UniqueConstraint(
                fields=["vendor", "bill_number"],
                name="unique_vendor_bill_number"
            )
        ]

    def __str__(self):
        return f"Bill {self.bill_number} - {self.vendor.name} ({self.current_status})"
