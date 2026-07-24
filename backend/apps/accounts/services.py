import logging
import secrets
import string
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from apps.audit.services import AuditService
from .models import PasswordResetOTP

User = get_user_model()
logger = logging.getLogger(__name__)


class AuthService:
    """
    Handles authentication, account locking, password resets, Simple JWT tokens,
    and Google OAuth verification.
    """

    @staticmethod
    def get_tokens_for_user(user):
        """
        Generates JWT tokens (access & refresh) with customized role claims.
        """
        refresh = RefreshToken.for_user(user)

        # Inject custom claims
        refresh["role"] = user.role
        refresh["email"] = user.email
        refresh["name"] = f"{user.first_name} {user.last_name}".strip()

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

    @staticmethod
    def authenticate_by_email(email, password, ip_address=None, user_agent=None):
        """
        Validates login credentials, locks account after 5 failures, and audits attempts.
        Separates check transaction from status update transaction to persist lockout states.
        """
        email = email.lower().strip()

        # Step 1: Check user locking and status atomically
        with transaction.atomic():
            try:
                user = User.objects.select_for_update().get(email=email)
            except User.DoesNotExist:
                AuditService.log_login_activity(
                    email=email,
                    status="FAILED",
                    ip_address=ip_address,
                    user_agent=user_agent,
                )
                raise AuthenticationFailed("Invalid email or password.")

            # Check if user is active
            if not user.is_active:
                AuditService.log_login_activity(
                    email=email,
                    status="FAILED_INACTIVE",
                    ip_address=ip_address,
                    user_agent=user_agent,
                    user=user,
                )
                raise AuthenticationFailed("User account is inactive.")

            # Check lockout
            if user.locked_until and timezone.now() < user.locked_until:
                AuditService.log_login_activity(
                    email=email,
                    status="LOCKED",
                    ip_address=ip_address,
                    user_agent=user_agent,
                    user=user,
                )
                remaining_mins = int((user.locked_until - timezone.now()).total_seconds() / 60) + 1
                raise AuthenticationFailed(
                    f"Account is temporarily locked. Try again in {remaining_mins} minutes."
                )

            # Check correct credentials (runs inside atomic block)
            password_correct = user.check_password(password)

        # Step 2: Handle update counters outside credentials check transaction to commit state
        if password_correct:
            with transaction.atomic():
                user = User.objects.select_for_update().get(pk=user.pk)
                user.failed_login_attempts = 0
                user.locked_until = None
                user.save()

            AuditService.log_login_activity(
                email=email,
                status="SUCCESS",
                ip_address=ip_address,
                user_agent=user_agent,
                user=user,
            )
            return user
        else:
            with transaction.atomic():
                user = User.objects.select_for_update().get(pk=user.pk)
                user.failed_login_attempts += 1
                is_locked = False
                if user.failed_login_attempts >= 5:
                    user.locked_until = timezone.now() + timezone.timedelta(minutes=15)
                    is_locked = True
                user.save()

            AuditService.log_login_activity(
                email=email,
                status="LOCKED" if is_locked else "FAILED",
                ip_address=ip_address,
                user_agent=user_agent,
                user=user,
            )

            if is_locked:
                raise AuthenticationFailed(
                    "Account is temporarily locked due to too many failed attempts. Try again in 15 minutes."
                )
            raise AuthenticationFailed("Invalid email or password.")

    @staticmethod
    def authenticate_google_token(token_string, ip_address=None, user_agent=None):
        """
        Verifies Google token using official Google library and performs same security checks.
        """
        try:
            # Verify ID Token using Google official library
            idinfo = id_token.verify_oauth2_token(
                token_string, google_requests.Request(), audience=None
            )
            email = idinfo.get("email")
        except Exception as e:
            logger.warning(f"Google token verification failed: {e}")
            AuditService.log_login_activity(
                email="google-oauth-client",
                status="FAILED_TOKEN",
                ip_address=ip_address,
                user_agent=user_agent,
            )
            raise AuthenticationFailed("Invalid or expired Google token.")

        if not email:
            raise AuthenticationFailed("Google account did not return a valid email address.")

        email = email.lower().strip()

        with transaction.atomic():
            try:
                user = User.objects.select_for_update().get(email=email)
            except User.DoesNotExist:
                AuditService.log_login_activity(
                    email=email,
                    status="FAILED_UNREG",
                    ip_address=ip_address,
                    user_agent=user_agent,
                )
                raise AuthenticationFailed("Google email address is not registered in this system.")

            # Check active status
            if not user.is_active:
                AuditService.log_login_activity(
                    email=email,
                    status="FAILED_INACTIVE",
                    ip_address=ip_address,
                    user_agent=user_agent,
                    user=user,
                )
                raise AuthenticationFailed("User account is inactive.")

            # Check lockout
            if user.locked_until and timezone.now() < user.locked_until:
                AuditService.log_login_activity(
                    email=email,
                    status="LOCKED",
                    ip_address=ip_address,
                    user_agent=user_agent,
                    user=user,
                )
                remaining_mins = int((user.locked_until - timezone.now()).total_seconds() / 60) + 1
                raise AuthenticationFailed(
                    f"Account is temporarily locked. Try again in {remaining_mins} minutes."
                )

        # Clear login lockouts
        with transaction.atomic():
            user = User.objects.select_for_update().get(pk=user.pk)
            user.failed_login_attempts = 0
            user.locked_until = None
            user.save()

        AuditService.log_login_activity(
            email=email,
            status="SUCCESS_GOOGLE",
            ip_address=ip_address,
            user_agent=user_agent,
            user=user,
        )
        return user

    @staticmethod
    def logout_user(refresh_token_str):
        """
        Blacklists the refresh token to close the session.
        """
        try:
            token = RefreshToken(refresh_token_str)
            token.blacklist()
        except Exception:
            raise ValidationError({"refresh": ["Invalid or expired refresh token."]})

    @staticmethod
    @transaction.atomic
    def change_password(user, old_password, new_password):
        """
        Verify old password and set new password securely.
        """
        locked_user = User.objects.select_for_update().get(pk=user.pk)

        if not locked_user.check_password(old_password):
            raise ValidationError({"old_password": ["Current password is incorrect."]})

        locked_user.set_password(new_password)
        locked_user.save()

        # Audit password change activity
        AuditService.log_activity(
            user=locked_user,
            action="UPDATE",
            instance=locked_user,
            changes={"password": ["******", "******"]},
        )
        return locked_user

    @staticmethod
    @transaction.atomic
    def request_password_reset(email):
        """
        Generate 6-digit OTP code, hash it, save to DB, and send it.
        Always returns same success message to prevent email harvesting.
        """
        email = email.lower().strip()
        try:
            user = User.objects.get(email=email)
            if user.is_active:
                # Generate random 6-digit OTP code
                otp = "".join(secrets.choice(string.digits) for _ in range(6))
                otp_hash = make_password(otp)

                # Save OTP with 10-minute lifetime expiry
                expires_at = timezone.now() + timezone.timedelta(minutes=10)
                PasswordResetOTP.objects.create(
                    user=user,
                    otp_hash=otp_hash,
                    expires_at=expires_at,
                )

                # Mock sending code in development environment
                logger.info(f"Password reset OTP for {user.email} is: {otp}")
                print(f"\n[MOCK EMAIL SEND] Password reset OTP for {user.email} is: {otp}\n")

                # Send actual email using Django's SMTP configurations
                from django.core.mail import send_mail
                from django.conf import settings
                try:
                    send_mail(
                        subject="Password Reset Verification Code - AAK Workflow",
                        message=f"Hello,\n\nYour password reset verification code is: {otp}\n\nThis code will expire in 10 minutes.\n\nSecure Access Gateway\nAAK Hypermarket",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[user.email],
                        fail_silently=False,
                    )
                except Exception as e:
                    logger.error(f"Failed to send SMTP email to {user.email}: {e}")
        except User.DoesNotExist:
            pass

        # Return generic message to prevent email harvesting
        return "If the email exists in our system, a verification code has been sent."

    @staticmethod
    def verify_otp(email, code):
        """
        Validate OTP verification request and return matching OTP record.
        """
        email = email.lower().strip()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise ValidationError({"code": ["Invalid or expired verification code."]})

        # Retrieve the latest active (unexpired and unused) OTP record
        otp_record = (
            PasswordResetOTP.objects.filter(
                user=user,
                is_used=False,
                expires_at__gt=timezone.now(),
            )
            .order_by("-created_at")
            .first()
        )

        if not otp_record:
            raise ValidationError({"code": ["Invalid or expired verification code."]})

        # Verify otp
        if not check_password(code, otp_record.otp_hash):
            raise ValidationError({"code": ["Invalid or expired verification code."]})

        return otp_record

    @staticmethod
    @transaction.atomic
    def reset_password_with_otp(email, code, new_password):
        """
        Resets user password after verifying OTP and releases any locking.
        """
        # 1. Verify OTP validity
        otp_record = AuthService.verify_otp(email, code)

        # Lock the OTP record to prevent double-use race conditions
        locked_otp = PasswordResetOTP.objects.select_for_update().get(pk=otp_record.pk)
        locked_otp.is_used = True
        locked_otp.save()

        # 2. Update user password and clear lockout counters
        user = User.objects.select_for_update().get(pk=locked_otp.user.pk)
        user.set_password(new_password)
        user.failed_login_attempts = 0
        user.locked_until = None
        user.save()

        # Audit password reset activity
        AuditService.log_activity(
            user=user,
            action="UPDATE",
            instance=user,
            changes={"password": ["******", "******"]},
        )
        return user
        return user
