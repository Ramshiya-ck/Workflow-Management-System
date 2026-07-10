from django.db import models
from django.conf import settings


class PasswordResetOTP(models.Model):
    """
    Dedicated Model to store hashed Password Reset OTPs and track their lifespans.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_reset_otps",
    )

    otp_hash = models.CharField(
        max_length=255,
        help_text="Secure salted PBKDF2/SHA256 hash of the 6-digit OTP.",
    )

    expires_at = models.DateTimeField(
        db_index=True, help_text="Expiration timestamp (10 minutes from creation)."
    )

    is_used = models.BooleanField(
        default=False,
        help_text="Flag indicating whether this OTP has already been verified.",
    )

    created_at = models.DateTimeField(
        auto_now_add=True, help_text="Timestamp of OTP generation."
    )

    class Meta:
        db_table = "password_reset_otps"
        ordering = ["-created_at"]
        verbose_name = "Password Reset OTP"
        verbose_name_plural = "Password Reset OTPs"
        indexes = [
            # Composite index to optimize verification queries
            models.Index(fields=["expires_at", "is_used"]),
        ]

    def __str__(self):
        return f"OTP for {self.user.email} (Expired: {self.expires_at})"
