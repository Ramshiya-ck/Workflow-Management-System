import logging
import requests
from django.contrib.auth import get_user_model
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from apps.audit.services import AuditService

User = get_user_model()
logger = logging.getLogger(__name__)


class AuthService:
    """
    Handles authentication, password resets, Simple JWT token generation,
    and Google OAuth verification.
    """

    @staticmethod
    def get_tokens_for_user(user):
        """
        Generates JWT tokens (access & refresh) with customized role claims.
        """
        refresh = RefreshToken.for_user(user)

        # Inject custom claims useful for the client application
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
        Validates login credentials, logs authentication status, and updates audit records.
        """
        email = email.lower().strip()
        try:
            user = User.objects.get(email=email)
            if not user.is_active:
                AuditService.log_login_activity(
                    email=email,
                    status="FAILED_INACTIVE",
                    ip_address=ip_address,
                    user_agent=user_agent,
                )
                raise AuthenticationFailed("User account is inactive.")

            if user.check_password(password):
                AuditService.log_login_activity(
                    email=email,
                    status="SUCCESS",
                    ip_address=ip_address,
                    user_agent=user_agent,
                    user=user,
                )
                return user
        except User.DoesNotExist:
            pass

        AuditService.log_login_activity(
            email=email,
            status="FAILED_CREDENTIALS",
            ip_address=ip_address,
            user_agent=user_agent,
        )
        raise AuthenticationFailed("Invalid email or password.")

    @staticmethod
    def authenticate_google_token(token_string, ip_address=None, user_agent=None):
        """
        Verifies Google token string using Google endpoints.
        Attempts check as Access Token, falls back to ID Token.
        """
        # Try as Google OAuth2 Access Token first
        response = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            params={"access_token": token_string},
        )

        if not response.ok:
            # Fall back to verifying as an ID Token
            response = requests.get(
                "https://oauth2.googleapis.com/tokeninfo", params={"id_token": token_string}
            )

        if not response.ok:
            AuditService.log_login_activity(
                email="google-oauth-client",
                status="FAILED_GOOGLE_TOKEN",
                ip_address=ip_address,
                user_agent=user_agent,
            )
            raise AuthenticationFailed("Invalid or expired Google token.")

        google_data = response.json()
        email = google_data.get("email")

        if not email:
            raise AuthenticationFailed("Google account did not return a valid email address.")

        email = email.lower().strip()
        try:
            user = User.objects.get(email=email)
            if not user.is_active:
                AuditService.log_login_activity(
                    email=email,
                    status="FAILED_GOOGLE_INACTIVE",
                    ip_address=ip_address,
                    user_agent=user_agent,
                )
                raise AuthenticationFailed("User account associated with Google account is inactive.")

            AuditService.log_login_activity(
                email=email,
                status="SUCCESS_GOOGLE",
                ip_address=ip_address,
                user_agent=user_agent,
                user=user,
            )
            return user
        except User.DoesNotExist:
            AuditService.log_login_activity(
                email=email,
                status="FAILED_GOOGLE_UNREGISTERED",
                ip_address=ip_address,
                user_agent=user_agent,
            )
            raise AuthenticationFailed("Google email address is not registered in this system.")
