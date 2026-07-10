from rest_framework import status, views, permissions
from rest_framework.response import Response
from .serializers import (
    LoginSerializer,
    GoogleLoginSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
    MeSerializer,
)
from .services import AuthService


class LoginView(views.APIView):
    """
    Standard Email and Password login endpoint returning JWT tokens.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ip_address = request.META.get("REMOTE_ADDR")
        user_agent = request.META.get("HTTP_USER_AGENT", "")

        user = AuthService.authenticate_by_email(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            ip_address=ip_address,
            user_agent=user_agent,
        )

        tokens = AuthService.get_tokens_for_user(user)
        user_serializer = MeSerializer(user)

        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "data": {"tokens": tokens, "user": user_serializer.data},
            }
        )


class GoogleLoginView(views.APIView):
    """
    Google OAuth validation endpoint using credential token.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ip_address = request.META.get("REMOTE_ADDR")
        user_agent = request.META.get("HTTP_USER_AGENT", "")

        user = AuthService.authenticate_google_token(
            token_string=serializer.validated_data["token"],
            ip_address=ip_address,
            user_agent=user_agent,
        )

        tokens = AuthService.get_tokens_for_user(user)
        user_serializer = MeSerializer(user)

        return Response(
            {
                "success": True,
                "message": "Google Login successful.",
                "data": {"tokens": tokens, "user": user_serializer.data},
            }
        )


class LogoutView(views.APIView):
    """
    Client-side JWT tokens are blacklisted and session is closed.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {
                    "success": False,
                    "message": "Validation failed",
                    "errors": {"refresh": ["This field is required."]},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        AuthService.logout_user(refresh_token)

        return Response(
            {"success": True, "message": "Logged out successfully.", "data": None}
        )


class MeView(views.APIView):
    """
    Retrieves the currently authenticated user profile.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(
            {
                "success": True,
                "message": "User profile retrieved successfully.",
                "data": serializer.data,
            }
        )


class ChangePasswordView(views.APIView):
    """
    Allows active users to change their own password.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        AuthService.change_password(
            user=request.user,
            old_password=serializer.validated_data["old_password"],
            new_password=serializer.validated_data["new_password"],
        )

        return Response(
            {"success": True, "message": "Password changed successfully.", "data": None}
        )


class ForgotPasswordView(views.APIView):
    """
    Request password reset code via email.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        msg = AuthService.request_password_reset(
            email=serializer.validated_data["email"]
        )

        return Response({"success": True, "message": msg, "data": None})


class VerifyOTPView(views.APIView):
    """
    Validate password reset verification code.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        AuthService.verify_otp(
            email=serializer.validated_data["email"],
            code=serializer.validated_data["code"],
        )

        return Response(
            {"success": True, "message": "Code verified successfully.", "data": None}
        )


class ResetPasswordView(views.APIView):
    """
    Resets user password using email and verification code.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        AuthService.reset_password_with_otp(
            email=serializer.validated_data["email"],
            code=serializer.validated_data["code"],
            new_password=serializer.validated_data["new_password"],
        )

        return Response(
            {"success": True, "message": "Password reset successfully.", "data": None}
        )
