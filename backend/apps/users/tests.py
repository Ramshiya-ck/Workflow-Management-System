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

    def test_create_user_success(self):
        # Create department
        from apps.departments.models import Department
        dept = Department.objects.create(name="HR Department", code="HRD", is_active=True)

        payload = {
            "email": "newuser@aak.com",
            "password": "Password123",
            "first_name": "New",
            "last_name": "User",
            "phone_number": "+919999888877",
            "role": "DATA_ENTRY",
            "department_id": dept.id,
            "is_active": True,
        }
        response = self.client.post(self.users_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="newuser@aak.com").exists())
        user = User.objects.get(email="newuser@aak.com")
        self.assertEqual(user.department, dept)
        self.assertEqual(user.role, "DATA_ENTRY")
        self.assertEqual(user.created_by, self.super_admin)

    def test_update_user_fields(self):
        from apps.departments.models import Department
        dept = Department.objects.create(name="Finance Dept", code="FIN", is_active=True)

        detail_url = reverse("users-detail", args=[self.normal_user.pk])
        payload = {
            "first_name": "UpdatedNormal",
            "department_id": dept.id,
            "role": "MANAGER",
        }
        response = self.client.patch(detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.normal_user.refresh_from_db()
        self.assertEqual(self.normal_user.first_name, "UpdatedNormal")
        self.assertEqual(self.normal_user.department, dept)
        self.assertEqual(self.normal_user.role, "MANAGER")
        self.assertEqual(self.normal_user.updated_by, self.super_admin)

    def test_activate_deactivate_actions(self):
        # Deactivate
        deactivate_url = reverse("users-deactivate", args=[self.normal_user.pk])
        response = self.client.post(deactivate_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.normal_user.refresh_from_db()
        self.assertFalse(self.normal_user.is_active)

        # Activate
        activate_url = reverse("users-activate", args=[self.normal_user.pk])
        response = self.client.post(activate_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.normal_user.refresh_from_db()
        self.assertTrue(self.normal_user.is_active)

    def test_reset_password(self):
        reset_url = reverse("users-reset-password", args=[self.normal_user.pk])
        # Try weak password
        response = self.client.post(reset_url, {"password": "weak"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Try strong password
        response = self.client.post(reset_url, {"password": "NewStrongPassword123"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_roles_choices(self):
        roles_url = reverse("users-roles")
        response = self.client.get(roles_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        roles = response.data["data"]
        roles_values = [r["value"] for r in roles]
        self.assertIn("SUPER_ADMIN", roles_values)
        self.assertIn("MANAGER", roles_values)

    def test_role_restrictions_403(self):
        # Logout super admin, login normal user
        response = self.client.post(
            self.login_url, {"email": "user@aak.com", "password": "securepassword123"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user_token = response.data["data"]["tokens"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {user_token}")

        # Attempt to list users
        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

