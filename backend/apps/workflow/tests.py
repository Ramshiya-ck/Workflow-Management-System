from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.departments.models import Department
from apps.vendors.models import Vendor
from apps.bills.models import Bill
from apps.workflow.models import WorkflowHistory
from core.choices import UserRole, BillStatus

User = get_user_model()


class WorkflowSystemTests(APITestCase):
    def setUp(self):
        # Create Users
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
            role=UserRole.DEPARTMENT_MANAGER,
        )
        self.accounts = User.objects.create_user(
            email="accounts@aak.com",
            password="securepassword123",
            first_name="Accounts",
            role=UserRole.ACCOUNTS,
        )

        # Create Department and Vendor
        self.department = Department.objects.create(name="IT Department", code="IT")
        self.vendor = Vendor.objects.create(name="Dell India")

        # URLs
        self.login_url = reverse("auth_login")
        self.bill_list_url = reverse("bills-list")

    def get_jwt_header(self, email, password="securepassword123"):
        response = self.client.post(self.login_url, {"email": email, "password": password})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        access_token = response.data["data"]["tokens"]["access"]
        return f"Bearer {access_token}"

    def test_end_to_end_workflow(self):
        # 1. Login as Data Entry and Create Bill
        auth_header = self.get_jwt_header(self.data_entry.email)
        self.client.credentials(HTTP_AUTHORIZATION=auth_header)

        payload = {
            "bill_number": "DELL-2026-001",
            "bill_date": "2026-07-10",
            "amount": "45000.00",
            "vendor_id": self.vendor.pk,
            "department_id": self.department.pk,
        }
        response = self.client.post(self.bill_list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        bill_id = response.data["data"]["id"]
        bill = Bill.objects.get(pk=bill_id)
        self.assertEqual(bill.current_status, BillStatus.RECEIVING)
        self.assertTrue(bill.tracking_id.startswith("BILL-"))

        # 2. Try to submit the bill
        transition_url = reverse("bills-transition", args=[bill_id])
        response = self.client.post(transition_url, {"action": "SUBMIT", "comments": "Submitting"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        bill.refresh_from_db()
        self.assertEqual(bill.current_status, BillStatus.SUPERVISOR)

        # 3. Try to approve as Data Entry (Should be PermissionDenied)
        response = self.client.post(transition_url, {"action": "APPROVE", "comments": "Approve"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # 4. Login as Supervisor and Approve
        auth_header = self.get_jwt_header(self.supervisor.email)
        self.client.credentials(HTTP_AUTHORIZATION=auth_header)

        response = self.client.post(
            transition_url, {"action": "APPROVE", "comments": "Approved by supervisor"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        bill.refresh_from_db()
        self.assertEqual(bill.current_status, BillStatus.DEPARTMENT_MANAGER)

        # 5. Login as Department Manager and Reject back to Supervisor
        auth_header = self.get_jwt_header(self.manager.email)
        self.client.credentials(HTTP_AUTHORIZATION=auth_header)

        response = self.client.post(
            transition_url, {"action": "REJECT", "comments": "Need clarification"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        bill.refresh_from_db()
        self.assertEqual(bill.current_status, BillStatus.SUPERVISOR)

        # 6. Login as Supervisor, reassign to self, then Approve again
        auth_header = self.get_jwt_header(self.supervisor.email)
        self.client.credentials(HTTP_AUTHORIZATION=auth_header)

        response = self.client.post(
            transition_url,
            {
                "action": "REASSIGN",
                "target_user_id": self.supervisor.pk,
                "comments": "Claiming this bill",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        bill.refresh_from_db()
        self.assertEqual(bill.assigned_to, self.supervisor)

        response = self.client.post(
            transition_url, {"action": "APPROVE", "comments": "Approved again"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        bill.refresh_from_db()
        self.assertEqual(bill.current_status, BillStatus.DEPARTMENT_MANAGER)

        # 7. Login as Department Manager and Approve
        auth_header = self.get_jwt_header(self.manager.email)
        self.client.credentials(HTTP_AUTHORIZATION=auth_header)
        response = self.client.post(
            transition_url, {"action": "APPROVE", "comments": "Manager Approved"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        bill.refresh_from_db()
        self.assertEqual(bill.current_status, BillStatus.ACCOUNTS)

        # 8. Login as Accounts and Clear Bill
        auth_header = self.get_jwt_header(self.accounts.email)
        self.client.credentials(HTTP_AUTHORIZATION=auth_header)
        response = self.client.post(
            transition_url, {"action": "APPROVE", "comments": "Cleared payment"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        bill.refresh_from_db()
        self.assertEqual(bill.current_status, BillStatus.ACCOUNTS_CLEARED)

        # 9. Verify History count
        self.assertEqual(WorkflowHistory.objects.filter(bill=bill).count(), 7)
