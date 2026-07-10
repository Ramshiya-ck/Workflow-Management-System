from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

from apps.accounts.models import PasswordResetOTP
from apps.accounts.services import AuthService

User = get_user_model()


class AuthenticationModuleTests(APITestCase):
    def setUp(self):
        # Create standard active user meeting password requirements
        self.user_password = "StrongPass123!"
        self.user = User.objects.create_user(
            email="user@aak.com",
            password=self.user_password,
            first_name="Active",
            last_name="User",
            role="DATA_ENTRY",
            is_active=True,
        )

        # Create inactive user
        self.inactive_user = User.objects.create_user(
            email="inactive@aak.com",
            password=self.user_password,
            first_name="Inactive",
            last_name="User",
            role="DATA_ENTRY",
            is_active=False,
        )

        self.login_url = reverse("auth_login")
        self.google_url = reverse("auth_google")
        self.logout_url = reverse("auth_logout")
        self.me_url = reverse("auth_me")
        self.change_password_url = reverse("change_password")
        self.forgot_password_url = reverse("forgot_password")
        self.verify_otp_url = reverse("verify_otp")
        self.reset_password_url = reverse("reset_password")
        self.refresh_url = reverse("token_refresh")

    def test_successful_login(self):
        response = self.client.post(
            self.login_url, {"email": "user@aak.com", "password": self.user_password}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("tokens", response.data["data"])
        self.assertIn("access", response.data["data"]["tokens"])
        self.assertEqual(response.data["data"]["user"]["email"], "user@aak.com")

        # Verify failed_login_attempts is reset
        self.user.refresh_from_db()
        self.assertEqual(self.user.failed_login_attempts, 0)

    def test_invalid_login_credentials(self):
        response = self.client.post(
            self.login_url, {"email": "user@aak.com", "password": "WrongPassword!"}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data["success"])

        # Check counter incremented
        self.user.refresh_from_db()
        self.assertEqual(self.user.failed_login_attempts, 1)

    def test_account_locking_flow(self):
        # 5 consecutive failed logins
        for i in range(4):
            response = self.client.post(
                self.login_url, {"email": "user@aak.com", "password": "WrongPassword!"}
            )
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # 5th attempt locks the account
        response = self.client.post(
            self.login_url, {"email": "user@aak.com", "password": "WrongPassword!"}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("temporarily locked", response.data["message"])

        self.user.refresh_from_db()
        self.assertEqual(self.user.failed_login_attempts, 5)
        self.assertIsNotNone(self.user.locked_until)

        # Attempt login with correct password while locked
        response = self.client.post(
            self.login_url, {"email": "user@aak.com", "password": self.user_password}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_lock_expiration(self):
        # Trigger lockout
        self.user.failed_login_attempts = 5
        self.user.locked_until = timezone.now() - timezone.timedelta(minutes=1)
        self.user.save()

        # Login should succeed after lock expires
        response = self.client.post(
            self.login_url, {"email": "user@aak.com", "password": self.user_password}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertEqual(self.user.failed_login_attempts, 0)
        self.assertIsNone(self.user.locked_until)

    def test_disabled_user_login(self):
        response = self.client.post(
            self.login_url, {"email": "inactive@aak.com", "password": self.user_password}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("inactive", response.data["message"])

    @patch("google.oauth2.id_token.verify_oauth2_token")
    def test_google_oauth_login_success(self, mock_verify):
        # Mock Google verifying valid email
        mock_verify.return_value = {"email": "user@aak.com"}

        response = self.client.post(self.google_url, {"token": "fake-google-token"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", response.data["data"])

    @patch("google.oauth2.id_token.verify_oauth2_token")
    def test_google_oauth_unregistered(self, mock_verify):
        mock_verify.return_value = {"email": "notregistered@aak.com"}

        response = self.client.post(self.google_url, {"token": "fake-google-token"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("not registered", response.data["message"])

    def test_forgot_password_privacy_harvesting(self):
        # Registered email
        response1 = self.client.post(self.forgot_password_url, {"email": "user@aak.com"})
        self.assertEqual(response1.status_code, status.HTTP_200_OK)

        # Unregistered email
        response2 = self.client.post(
            self.forgot_password_url, {"email": "notexists@aak.com"}
        )
        self.assertEqual(response2.status_code, status.HTTP_200_OK)

        # Confirm identical responses
        self.assertEqual(response1.data["message"], response2.data["message"])

        # Check DB
        self.assertTrue(PasswordResetOTP.objects.filter(user=self.user).exists())

    def test_otp_verification_flow(self):
        # Request OTP
        AuthService.request_password_reset("user@aak.com")
        otp_record = PasswordResetOTP.objects.filter(user=self.user).first()
        self.assertIsNotNone(otp_record)

        # Verify correct OTP code
        # In test mode we extract mock OTP from printed console/services log, or since we have the hash,
        # we can override or check via check_password.
        # But wait! AuthService request generates a random code, let's patch verify_otp or check how to pass it.
        # For testing we can mock secrets.choice to return '123456' so code is always '123456'!
        # Let's verify OTP code '123456' by mocking secrets.choice
        with patch("secrets.choice", return_value="1"):
            AuthService.request_password_reset("user@aak.com")
            otp_record = PasswordResetOTP.objects.filter(user=self.user).first()

            # verify correct OTP
            response = self.client.post(
                self.verify_otp_url, {"email": "user@aak.com", "code": "111111"}
            )
            self.assertEqual(response.status_code, status.HTTP_200_OK)

            # verify incorrect OTP
            response = self.client.post(
                self.verify_otp_url, {"email": "user@aak.com", "code": "999999"}
            )
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_otp_expiration(self):
        with patch("secrets.choice", return_value="1"):
            AuthService.request_password_reset("user@aak.com")
            otp_record = PasswordResetOTP.objects.filter(user=self.user).first()

            # Mock expiration in DB
            otp_record.expires_at = timezone.now() - timezone.timedelta(seconds=1)
            otp_record.save()

            response = self.client.post(
                self.verify_otp_url, {"email": "user@aak.com", "code": "111111"}
            )
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_and_otp_reuse_prevention(self):
        with patch("secrets.choice", return_value="1"):
            AuthService.request_password_reset("user@aak.com")

            # 1. Reset Password successfully
            response = self.client.post(
                self.reset_password_url,
                {
                    "email": "user@aak.com",
                    "code": "111111",
                    "new_password": "NewStrongPass123!",
                },
            )
            self.assertEqual(response.status_code, status.HTTP_200_OK)

            # Check DB values
            self.user.refresh_from_db()
            self.assertTrue(self.user.check_password("NewStrongPass123!"))

            # 2. Attempt to reuse same OTP
            response = self.client.post(
                self.reset_password_url,
                {
                    "email": "user@aak.com",
                    "code": "111111",
                    "new_password": "AnotherNewPass99!",
                },
            )
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("expired", response.data["errors"]["code"][0])

    def test_password_change_success(self):
        # Authorize client
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.change_password_url,
            {"old_password": self.user_password, "new_password": "NewSuperStrong88!"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewSuperStrong88!"))

    def test_invalid_current_password_change(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.change_password_url,
            {"old_password": "IncorrectPassword!", "new_password": "NewSuperStrong88!"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Check unchanged
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.user_password))

    def test_me_endpoint_unauthorized_and_authorized(self):
        # 1. Unauthorized
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # 2. Authorized
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["email"], "user@aak.com")

    def test_password_complexity_validator(self):
        self.client.force_authenticate(user=self.user)

        # Weak password (numeric only)
        response = self.client.post(
            self.change_password_url,
            {"old_password": self.user_password, "new_password": "1234567890"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Short password (less than 10)
        response = self.client.post(
            self.change_password_url,
            {"old_password": self.user_password, "new_password": "Short1!"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_session_blacklist(self):
        # Generate tokens
        tokens = AuthService.get_tokens_for_user(self.user)
        self.client.force_authenticate(user=self.user)

        # Logout by blacklisting refresh
        response = self.client.post(
            self.logout_url, {"refresh": tokens["refresh"]}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Attempt to refresh should now fail
        response = self.client.post(self.refresh_url, {"refresh": tokens["refresh"]})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
