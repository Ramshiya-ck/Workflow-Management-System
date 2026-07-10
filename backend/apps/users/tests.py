from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class UserModuleTests(APITestCase):
    def setUp(self):
        # Create Super Admin
        self.super_admin = User.objects.create_superuser(
            email="admin@aak.com", password="securepassword123", first_name="Super"
        )
        self.normal_user = User.objects.create_user(
            email="user@aak.com", password="securepassword123", first_name="Normal"
        )

        # Login and get token
        self.login_url = reverse("auth_login")
        response = self.client.post(
            self.login_url, {"email": "admin@aak.com", "password": "securepassword123"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.token = response.data["data"]["tokens"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

        self.users_url = reverse("users-list")

    def test_phone_number_validation(self):
        # Test Valid Phone Number
        user = User(
            email="validphone@aak.com",
            first_name="Valid",
            phone_number="+919876543210",
        )
        user.clean_fields(exclude=["password", "last_login", "date_joined"])  # should not raise validation error

        # Test Invalid Phone Number
        invalid_user = User(
            email="invalidphone@aak.com",
            first_name="Invalid",
            phone_number="abc-123-phone",
        )
        with self.assertRaises(ValidationError):
            invalid_user.clean_fields(exclude=["password", "last_login", "date_joined"])

    def test_user_soft_delete(self):
        # User is active initially
        self.assertTrue(self.normal_user.is_active)

        # Delete (Deactivate) via API
        delete_url = reverse("users-detail", args=[self.normal_user.pk])
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Assert user is deactivated in database
        self.normal_user.refresh_from_db()
        self.assertFalse(self.normal_user.is_active)
