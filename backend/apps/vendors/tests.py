from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.db.models import ProtectedError

from apps.vendors.models import Vendor
from apps.departments.models import Department
from apps.bills.models import Bill
from apps.audit.models import ActivityLog

User = get_user_model()


class VendorModuleTests(APITestCase):
    def setUp(self):
        # Create users with different roles
        self.super_admin = User.objects.create_superuser(
            email="admin@aak.com", password="securepassword123", first_name="Super"
        )
        self.normal_user = User.objects.create_user(
            email="user@aak.com", password="securepassword123", first_name="Normal"
        )

        # Department needed for Bill creation
        self.department = Department.objects.create(
            name="Finance",
            code="FIN",
            is_active=True,
            created_by=self.super_admin,
        )

        # Login URLs
        self.login_url = reverse("auth_login")

        # Get JWT tokens
        self.admin_token = self.get_jwt_token("admin@aak.com", "securepassword123")
        self.user_token = self.get_jwt_token("user@aak.com", "securepassword123")

        # URL Endpoints
        self.list_create_url = reverse("vendors-list")

    def get_jwt_token(self, email, password):
        response = self.client.post(self.login_url, {"email": email, "password": password})
        return response.data["data"]["tokens"]["access"]

    def set_admin_credentials(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")

    def set_user_credentials(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.user_token}")

    def test_vendor_crud_as_admin(self):
        self.set_admin_credentials()

        # Create
        data = {
            "name": "Reliance Retail",
            "address": "Mumbai, Maharashtra",
            "mobile_number": "+919876543210",
            "gst_number": "27AAAAA1111A1Z1",
            "credit_days": 30,
        }
        response = self.client.post(self.list_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        vendor_id = response.data["data"]["id"]

        # Retrieve
        detail_url = reverse("vendors-detail", args=[vendor_id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["name"], "Reliance Retail")

        # Update
        update_data = {
            "name": "Reliance Retail Private Limited",
            "address": "Navi Mumbai, MH",
            "mobile_number": "+919876543219",
            "gst_number": "27AAAAA1111A1Z1",
            "credit_days": 45,
        }
        response = self.client.put(detail_url, update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["name"], "Reliance Retail Private Limited")

        # Delete
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify deletion
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_vendor_permissions(self):
        # Authenticated non-admin can read but not write/delete
        self.set_user_credentials()

        # Try Create
        data = {
            "name": "Hindustan Unilever",
            "address": "Mumbai",
            "mobile_number": "+919000000000",
            "gst_number": "27BBBBB2222B2Z2",
            "credit_days": 15,
        }
        response = self.client.post(self.list_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Create vendor using admin first
        self.set_admin_credentials()
        create_res = self.client.post(self.list_create_url, data)
        vendor_id = create_res.data["data"]["id"]

        # Switch back to user
        self.set_user_credentials()
        detail_url = reverse("vendors-detail", args=[vendor_id])

        # Try Update
        response = self.client.put(detail_url, {"name": "HUL Ltd"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Try Activate/Deactivate
        response = self.client.post(reverse("vendors-activate", args=[vendor_id]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Try Delete
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_vendor_input_validation(self):
        self.set_admin_credentials()

        # Create a base vendor for uniqueness collisions
        self.client.post(
            self.list_create_url,
            {
                "name": "Tata Motors",
                "address": "Pune",
                "mobile_number": "+919999999999",
                "gst_number": "27CCCCC3333C3Z3",
                "credit_days": 30,
            },
        )

        # Case-insensitive Name uniqueness validation
        response = self.client.post(
            self.list_create_url,
            {
                "name": "TATA MOTORS",
                "address": "Pune",
                "mobile_number": "+918888888888",
                "gst_number": "27DDDDD4444D4Z4",
                "credit_days": 30,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data["errors"])

        # GST Number format validation
        response = self.client.post(
            self.list_create_url,
            {
                "name": "Tata Elxsi",
                "address": "Bangalore",
                "mobile_number": "+918888888888",
                "gst_number": "INVALID_GST",
                "credit_days": 30,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("gst_number", response.data["errors"])

        # GST Number uniqueness validation
        response = self.client.post(
            self.list_create_url,
            {
                "name": "Tata Communications",
                "address": "Pune",
                "mobile_number": "+918888888888",
                "gst_number": "27CCCCC3333C3Z3",
                "credit_days": 30,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("gst_number", response.data["errors"])

        # Mobile number validation format
        response = self.client.post(
            self.list_create_url,
            {
                "name": "Tata Steel",
                "address": "Jamshedpur",
                "mobile_number": "123-abc-phone",
                "gst_number": "27DDDDD4444D4Z4",
                "credit_days": 30,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("mobile_number", response.data["errors"])

        # Credit days positive integer validation
        response = self.client.post(
            self.list_create_url,
            {
                "name": "Tata Power",
                "address": "Mumbai",
                "mobile_number": "+918888888888",
                "gst_number": "27DDDDD4444D4Z4",
                "credit_days": -5,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("credit_days", response.data["errors"])

    def test_vendor_search_and_filter(self):
        self.set_admin_credentials()

        # Add 3 vendors
        self.client.post(
            self.list_create_url,
            {
                "name": "Adani Power",
                "address": "Gujarat",
                "mobile_number": "+919111111111",
                "gst_number": "24AAAAA1234A1Z1",
                "credit_days": 10,
                "is_active": True,
            },
        )
        self.client.post(
            self.list_create_url,
            {
                "name": "Adani Green",
                "address": "Gujarat",
                "mobile_number": "+919222222222",
                "gst_number": "24BBBBB5678B1Z2",
                "credit_days": 20,
                "is_active": False,
            },
        )

        self.set_user_credentials()

        # Search for 'Power'
        response = self.client.get(f"{self.list_create_url}?search=Power")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["data"]["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "Adani Power")

        # Search by GST Number
        response = self.client.get(f"{self.list_create_url}?search=5678B1Z2")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["data"]["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "Adani Green")

        # Filter by is_active=True
        response = self.client.get(f"{self.list_create_url}?is_active=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["data"]["results"]
        self.assertTrue(all(item["is_active"] is True for item in results))

        # Filter by is_active=False
        response = self.client.get(f"{self.list_create_url}?is_active=false")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["data"]["results"]
        self.assertTrue(all(item["is_active"] is False for item in results))

    def test_vendor_delete_protection(self):
        self.set_admin_credentials()

        # Create vendor
        create_res = self.client.post(
            self.list_create_url,
            {
                "name": "L&T Construction",
                "address": "Chennai",
                "mobile_number": "+919333333333",
                "gst_number": "33EEEEE5555E5Z5",
                "credit_days": 60,
            },
        )
        vendor_id = create_res.data["data"]["id"]
        vendor_obj = Vendor.objects.get(pk=vendor_id)

        # Create a bill referencing this vendor
        Bill.objects.create(
            bill_number="BILL-001",
            bill_date="2026-07-12",
            amount=50000.00,
            vendor=vendor_obj,
            department=self.department,
            tracking_id="TRK100021",
            created_by=self.super_admin,
        )

        # Try to delete the vendor
        detail_url = reverse("vendors-detail", args=[vendor_id])
        response = self.client.delete(detail_url)

        # Should return validation error with user-friendly message
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["success"], False)
        
        errors = response.data.get("errors", {})
        found = False
        if isinstance(errors, dict):
            for field, messages in errors.items():
                for msg in messages:
                    if "referenced by one or more bills" in str(msg):
                        found = True
        elif isinstance(errors, list):
            for msg in errors:
                if "referenced by one or more bills" in str(msg):
                    found = True
        self.assertTrue(found, f"Expected message not found in errors: {errors}")

        # Check that vendor is still in the database
        self.assertTrue(Vendor.objects.filter(pk=vendor_id).exists())

    def test_vendor_audit_logging(self):
        self.set_admin_credentials()

        # Clear existing logs for simplicity
        ActivityLog.objects.all().delete()

        # Create
        create_res = self.client.post(
            self.list_create_url,
            {
                "name": "Wipro Technologies",
                "address": "Bangalore",
                "mobile_number": "+919444444444",
                "gst_number": "29FFFFF6666F6Z6",
                "credit_days": 30,
            },
        )
        vendor_id = create_res.data["data"]["id"]

        # Assert CREATE log was registered
        create_log = ActivityLog.objects.filter(action="CREATE", object_id=str(vendor_id)).first()
        self.assertIsNotNone(create_log)
        self.assertEqual(create_log.changes["name"], "Wipro Technologies")

        # Deactivate
        self.client.post(reverse("vendors-deactivate", args=[vendor_id]))
        deactivate_log = ActivityLog.objects.filter(action="UPDATE", object_id=str(vendor_id)).first()
        self.assertIsNotNone(deactivate_log)
        self.assertEqual(deactivate_log.changes["is_active"], [True, False])

        # Delete
        detail_url = reverse("vendors-detail", args=[vendor_id])
        self.client.delete(detail_url)
        delete_log = ActivityLog.objects.filter(action="DELETE", object_id=str(vendor_id)).first()
        self.assertIsNotNone(delete_log)
