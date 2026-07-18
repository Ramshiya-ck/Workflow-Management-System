from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.vendors.models import Vendor
from apps.departments.models import Department
from apps.bills.models import Bill
from core.choices import UserRole, BillStatus

User = get_user_model()


class DashboardModuleTests(APITestCase):
    def setUp(self):
        # Create users for each role
        self.super_admin = User.objects.create_superuser(
            email="admin@aak.com", password="securepassword123", first_name="Admin"
        )
        self.data_entry = User.objects.create_user(
            email="entry@aak.com",
            password="securepassword123",
            first_name="Entry",
            role=UserRole.DATA_ENTRY,
        )
        self.supervisor = User.objects.create_user(
            email="supervisor@aak.com",
            password="securepassword123",
            first_name="Supervisor",
            role=UserRole.SUPERVISOR,
        )
        self.manager = User.objects.create_user(
            email="manager@aak.com",
            password="securepassword123",
            first_name="Manager",
            role=UserRole.MANAGER,
        )
        self.accounts = User.objects.create_user(
            email="accounts@aak.com",
            password="securepassword123",
            first_name="Accounts",
            role=UserRole.ACCOUNTS,
        )

        # Create base vendor and department
        self.department = Department.objects.create(
            name="IT Department", code="ITD", is_active=True, created_by=self.super_admin
        )
        self.vendor = Vendor.objects.create(
            name="Dell India",
            address="Industrial Zone",
            mobile_number="+919876543210",
            gst_number="27AAAAA1111A1Z1",
            credit_days=30,
            is_active=True,
        )

        # Create bills in various states
        self.bill_receiving = Bill.objects.create(
            bill_number="BILL-REC-01",
            bill_date="2026-07-12",
            amount=15000.00,
            vendor=self.vendor,
            department=self.department,
            tracking_id="BILL-00000001",
            current_status=BillStatus.RECEIVING,
            created_by=self.data_entry,
        )
        self.bill_entry = Bill.objects.create(
            bill_number="BILL-ENT-02",
            bill_date="2026-07-12",
            amount=25000.00,
            vendor=self.vendor,
            department=self.department,
            tracking_id="BILL-00000002",
            current_status=BillStatus.DATA_ENTRY,
            created_by=self.data_entry,
        )

        self.dashboard_url = reverse("dashboard_stats")
        self.login_url = reverse("auth_login")

    def get_jwt_token(self, email, password="securepassword123"):
        response = self.client.post(self.login_url, {"email": email, "password": password})
        return response.data["data"]["tokens"]["access"]

    def set_auth_credentials(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_dashboard_requires_authentication(self):
        # Request without credentials -> expect 401
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_super_admin_dashboard(self):
        token = self.get_jwt_token("admin@aak.com")
        self.set_auth_credentials(token)

        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["success"], True)

        data = response.data["data"]
        self.assertEqual(data["role"], UserRole.SUPER_ADMIN)
        self.assertIn("cards", data)
        self.assertIn("department_wise", data)
        self.assertIn("vendor_wise", data)
        self.assertIn("monthly_trends", data)

        # Check total bills count (2)
        total_bills_card = next(c for c in data["cards"] if c["title"] == "Total Bills")
        self.assertEqual(total_bills_card["value"], "2")

    def test_data_entry_dashboard(self):
        token = self.get_jwt_token("entry@aak.com")
        self.set_auth_credentials(token)

        # 1. Test data entry dashboard view
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]
        self.assertEqual(data["role"], UserRole.DATA_ENTRY)
        
        pending_entry_card = next(c for c in data["cards"] if c["title"] == "Pending Entry")
        self.assertEqual(pending_entry_card["value"], "1") # BILL-ENT-02 is in DATA_ENTRY status

        # 2. Test receiving dashboard view
        response = self.client.get(f"{self.dashboard_url}?view=receiving")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]
        self.assertEqual(data["role"], "RECEIVING")

        pending_rec_card = next(c for c in data["cards"] if c["title"] == "Pending Bills")
        self.assertEqual(pending_rec_card["value"], "1") # BILL-REC-01 is in RECEIVING status

    def test_supervisor_dashboard(self):
        token = self.get_jwt_token("supervisor@aak.com")
        self.set_auth_credentials(token)

        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]
        self.assertEqual(data["role"], UserRole.SUPERVISOR)
        self.assertNotIn("monthly_trends", data) # Standard users should not see trends
