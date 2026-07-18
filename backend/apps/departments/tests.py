from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.departments.models import Department

User = get_user_model()


class DepartmentModuleTests(APITestCase):
    def setUp(self):
        # Create users
        self.super_admin = User.objects.create_superuser(
            email="admin@aak.com", password="securepassword123", first_name="Super"
        )
        self.normal_user = User.objects.create_user(
            email="user@aak.com", password="securepassword123", first_name="Normal"
        )

        # Login and get tokens
        self.login_url = reverse("auth_login")
        self.admin_token = self.get_jwt_token("admin@aak.com", "securepassword123")
        self.user_token = self.get_jwt_token("user@aak.com", "securepassword123")

        # URL Endpoints
        self.list_create_url = reverse("department_list_create")

    def get_jwt_token(self, email, password):
        response = self.client.post(self.login_url, {"email": email, "password": password})
        return response.data["data"]["tokens"]["access"]

    def set_admin_credentials(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

    def set_user_credentials(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.user_token}")

    def test_department_create_as_admin(self):
        self.set_admin_credentials()
        payload = {
            "name": "Human Resources",
            "code": "HR",
            "is_active": True,
        }
        response = self.client.post(self.list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["success"], True)
        self.assertEqual(response.data["data"]["name"], "Human Resources")
        self.assertEqual(response.data["data"]["code"], "HR")

        # Verify audit created_by/updated_by inside database
        dept = Department.objects.get(code="HR")
        self.assertEqual(dept.created_by, self.super_admin)
        self.assertEqual(dept.updated_by, self.super_admin)

    def test_department_create_as_non_admin_fails(self):
        self.set_user_credentials()
        payload = {
            "name": "Legal",
            "code": "LGL",
        }
        response = self.client.post(self.list_create_url, payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_department_update_as_admin(self):
        dept = Department.objects.create(
            name="Logistics",
            code="LOG",
            created_by=self.super_admin,
            updated_by=self.super_admin,
        )
        self.set_admin_credentials()
        detail_url = reverse("department_detail", args=[dept.id])
        payload = {
            "name": "Supply Chain & Logistics",
        }
        response = self.client.patch(detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        dept.refresh_from_db()
        self.assertEqual(dept.name, "Supply Chain & Logistics")
        self.assertEqual(dept.updated_by, self.super_admin)

    def test_department_code_immutability(self):
        dept = Department.objects.create(
            name="Operations",
            code="OPS",
            created_by=self.super_admin,
            updated_by=self.super_admin,
        )
        self.set_admin_credentials()
        detail_url = reverse("department_detail", args=[dept.id])
        payload = {
            "code": "NEWOPS",
        }
        response = self.client.patch(detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
