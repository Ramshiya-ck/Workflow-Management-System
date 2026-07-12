from django.db import models
from django.db.models.functions import Lower
from django.db.models.constraints import UniqueConstraint, CheckConstraint


class Vendor(models.Model):
    """
    Enterprise Vendor Model representing external suppliers.
    """

    name = models.CharField(
        max_length=150,
        db_index=True,
        help_text="Unique trade name of the vendor (case-insensitive).",
    )

    address = models.TextField(
        help_text="Physical or billing address of the vendor.",
    )

    mobile_number = models.CharField(
        max_length=20,
        help_text="Primary contact mobile number of the vendor.",
    )

    gst_number = models.CharField(
        max_length=15,
        unique=True,
        db_index=True,
        help_text="Unique 15-character Goods and Services Tax Identification Number (GSTIN).",
    )

    credit_days = models.PositiveIntegerField(
        help_text="Allowed credit payment window in days (must be greater than zero).",
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Designates whether this vendor is active and selectable.",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "vendors"
        ordering = ["name"]
        verbose_name = "Vendor"
        verbose_name_plural = "Vendors"
        constraints = [
            # Case-insensitive uniqueness check for Vendor Name
            UniqueConstraint(
                Lower("name"), name="unique_vendor_name_case_insensitive"
            ),
            # Check constraint to enforce credit_days >= 0 at database level
            CheckConstraint(
                condition=models.Q(credit_days__gte=0),
                name="credit_days_must_be_non_negative"
            )
        ]

    def __str__(self):
        return self.name
