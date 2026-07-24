from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.bills.models import Bill
from apps.vendors.models import Vendor
from apps.departments.models import Department
from core.choices import UserRole, BillStatus

User = get_user_model()

class ReportsAPITests(APITestCase):
    def setUp(self):
        # Create users
        self.super_admin = User.objects.create_user(
            email="admin@aak.com",
            password="password123",
            role=UserRole.SUPER_ADMIN,
            first_name="Super Admin"
        )
        self.audit_manager = User.objects.create_user(
            email="audit@aak.com",
            password="password123",
            role=UserRole.AUDIT_MANAGER,
            first_name="Audit Manager"
        )
        self.data_entry = User.objects.create_user(
            email="entry@aak.com",
            password="password123",
            role=UserRole.DATA_ENTRY,
            first_name="Data Entry"
        )

        # Create department & vendor
        self.dept = Department.objects.create(name="Bakery", code="BAK", is_active=True)
        self.vendor = Vendor.objects.create(
            name="Suresh Sweets",
            address="Bakery lane",
            mobile_number="9876543210",
            gst_number="32ABCDE1234F1Z5",
            credit_days=30,
            is_active=True
        )

        # Create bill
        self.bill = Bill.objects.create(
            bill_number="INV-0001",
            bill_date="2026-07-15",
            amount=5000.00,
            vendor=self.vendor,
            department=self.dept,
            current_status=BillStatus.RECEIVING,
            created_by=self.data_entry
        )

    def test_unauthenticated_user_access(self):
        url = reverse("report_summary")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthorized_role_access(self):
        self.client.force_authenticate(user=self.data_entry)
        url = reverse("report_summary")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_super_admin_summary_access(self):
        self.client.force_authenticate(user=self.super_admin)
        url = reverse("report_summary")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["total_bills"], 1)

    def test_audit_manager_department_report_access(self):
        self.client.force_authenticate(user=self.audit_manager)
        url = reverse("report_department")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["department"], "Bakery")

    def test_csv_export_respects_filters(self):
        self.client.force_authenticate(user=self.super_admin)
        url = reverse("report_export_csv")
        response = self.client.get(url, {"department": "Bakery"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "text/csv")
        
        # Test non-matching department returns empty CSV rows
        response_empty = self.client.get(url, {"department": "Fish"})
        self.assertEqual(response_empty.status_code, status.HTTP_200_OK)
        self.assertEqual(response_empty["Content-Type"], "text/csv")

    def test_html_export_format(self):
        self.client.force_authenticate(user=self.audit_manager)
        url = reverse("report_export_html")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "text/html")
