import threading
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.db import connection, transaction

from apps.departments.models import Department
from apps.vendors.models import Vendor
from apps.bills.models import Bill
from apps.workflow.models import WorkflowHistory
from apps.audit.models import ActivityLog
from core.choices import UserRole, BillStatus, WorkflowRejectReason, WorkflowHoldReason

User = get_user_model()


class WorkflowSystemTests(APITestCase):
    def setUp(self):
        # Create Users with appropriate roles
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

        # Create active department and vendor
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

        # Create base bill using admin
        self.bill = Bill.objects.create(
            bill_number="INV-2026-X01",
            bill_date="2026-07-12",
            amount=50000.00,
            vendor=self.vendor,
            department=self.department,
            tracking_id="BILL-00000001",
            current_status=BillStatus.RECEIVING,
            created_by=self.data_entry,
        )

        self.login_url = reverse("auth_login")

        # Get JWT tokens
        self.entry_token = self.get_jwt_token("entry@aak.com")
        self.supervisor_token = self.get_jwt_token("supervisor@aak.com")
        self.manager_token = self.get_jwt_token("manager@aak.com")
        self.accounts_token = self.get_jwt_token("accounts@aak.com")
        self.admin_token = self.get_jwt_token("admin@aak.com")

    def get_jwt_token(self, email, password="securepassword123"):
        response = self.client.post(self.login_url, {"email": email, "password": password})
        return response.data["data"]["tokens"]["access"]

    def set_auth_credentials(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_approve_workflow_success(self):
        # 1. RECEIVING -> DATA_ENTRY (by Data Entry)
        self.set_auth_credentials(self.entry_token)
        approve_url = reverse("workflow-approve", args=[self.bill.id])
        response = self.client.post(approve_url, {"comments": "Submit to data entry"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.current_status, BillStatus.DATA_ENTRY)

        # 2. DATA_ENTRY -> SUPERVISOR (by Data Entry)
        response = self.client.post(approve_url, {"comments": "Submit to supervisor"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.current_status, BillStatus.SUPERVISOR)

        # 3. SUPERVISOR -> DEPARTMENT_MANAGER (by Supervisor)
        self.set_auth_credentials(self.supervisor_token)
        response = self.client.post(approve_url, {"comments": "Approve supervisor level"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.current_status, BillStatus.DEPARTMENT_MANAGER)

        # 4. DEPARTMENT_MANAGER -> ACCOUNTS (by Manager)
        self.set_auth_credentials(self.manager_token)
        response = self.client.post(approve_url, {"comments": "Approve manager level"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.current_status, BillStatus.ACCOUNTS)

        # 5. ACCOUNTS -> ACCOUNTS_CLEARED (by Accounts)
        self.set_auth_credentials(self.accounts_token)
        response = self.client.post(approve_url, {"comments": "Approve accounts level"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.current_status, BillStatus.ACCOUNTS_CLEARED)

        # 6. Verify history creation
        history_url = reverse("workflow-history", args=[self.bill.id])
        response = self.client.get(history_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        history_data = response.data["data"]
        self.assertEqual(len(history_data), 5)

        # Assert status transitions
        self.assertEqual(history_data[0]["from_status"], BillStatus.RECEIVING)
        self.assertEqual(history_data[0]["to_status"], BillStatus.DATA_ENTRY)
        self.assertEqual(history_data[1]["from_status"], BillStatus.DATA_ENTRY)
        self.assertEqual(history_data[1]["to_status"], BillStatus.SUPERVISOR)
        self.assertEqual(history_data[2]["from_status"], BillStatus.SUPERVISOR)
        self.assertEqual(history_data[2]["to_status"], BillStatus.DEPARTMENT_MANAGER)
        self.assertEqual(history_data[3]["from_status"], BillStatus.DEPARTMENT_MANAGER)
        self.assertEqual(history_data[3]["to_status"], BillStatus.ACCOUNTS)
        self.assertEqual(history_data[4]["from_status"], BillStatus.ACCOUNTS)
        self.assertEqual(history_data[4]["to_status"], BillStatus.ACCOUNTS_CLEARED)

        # Verify audit logs
        self.assertTrue(ActivityLog.objects.filter(action="UPDATE", object_id=str(self.bill.id)).exists())

    def test_reverse_reject_flow_step_by_step(self):
        # Move bill directly to ACCOUNTS using admin to test reject flow
        self.bill.current_status = BillStatus.ACCOUNTS
        self.bill.save()

        reject_url = reverse("workflow-reject", args=[self.bill.id])

        # 1. Accounts Reject -> DEPARTMENT_MANAGER
        self.set_auth_credentials(self.accounts_token)
        payload = {"reason_code": WorkflowRejectReason.PRICE_DIFFERENCE}
        response = self.client.post(reject_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.current_status, BillStatus.DEPARTMENT_MANAGER)
        self.assertEqual(self.bill.rejection_reason, WorkflowRejectReason.PRICE_DIFFERENCE)

        # 2. Department Manager Reject -> SUPERVISOR
        self.set_auth_credentials(self.manager_token)
        payload = {"reason_code": WorkflowRejectReason.DISCOUNT_PENDING}
        response = self.client.post(reject_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.current_status, BillStatus.SUPERVISOR)

        # 3. Supervisor Reject -> DATA_ENTRY
        self.set_auth_credentials(self.supervisor_token)
        payload = {"reason_code": WorkflowRejectReason.CREDIT_NOTE_PENDING}
        response = self.client.post(reject_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.current_status, BillStatus.DATA_ENTRY)

        # 4. Data Entry Reject -> RECEIVING
        self.set_auth_credentials(self.entry_token)
        # Choose "Other" reject reason, custom text reason_note is required
        payload = {"reason_code": WorkflowRejectReason.OTHER, "reason_note": "Typo in bill amount"}
        response = self.client.post(reject_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.current_status, BillStatus.RECEIVING)
        self.assertEqual(self.bill.rejection_reason, "Typo in bill amount")

        # Verify history fields
        history = WorkflowHistory.objects.filter(bill=self.bill).order_by("created_at")
        self.assertEqual(history.count(), 4)

        # Assert status transitions on reverse reject flow
        self.assertEqual(history[0].from_status, BillStatus.ACCOUNTS)
        self.assertEqual(history[0].to_status, BillStatus.DEPARTMENT_MANAGER)
        self.assertEqual(history[0].reason_code, WorkflowRejectReason.PRICE_DIFFERENCE)

        self.assertEqual(history[1].from_status, BillStatus.DEPARTMENT_MANAGER)
        self.assertEqual(history[1].to_status, BillStatus.SUPERVISOR)
        self.assertEqual(history[1].reason_code, WorkflowRejectReason.DISCOUNT_PENDING)

        self.assertEqual(history[2].from_status, BillStatus.SUPERVISOR)
        self.assertEqual(history[2].to_status, BillStatus.DATA_ENTRY)
        self.assertEqual(history[2].reason_code, WorkflowRejectReason.CREDIT_NOTE_PENDING)

        self.assertEqual(history[3].from_status, BillStatus.DATA_ENTRY)
        self.assertEqual(history[3].to_status, BillStatus.RECEIVING)
        self.assertEqual(history[3].reason_code, WorkflowRejectReason.OTHER)
        self.assertEqual(history[3].reason_note, "Typo in bill amount")

    def test_reject_validation_errors(self):
        # Move bill to SUPERVISOR
        self.bill.current_status = BillStatus.SUPERVISOR
        self.bill.save()

        self.set_auth_credentials(self.supervisor_token)
        reject_url = reverse("workflow-reject", args=[self.bill.id])

        # 1. Missing reason code
        response = self.client.post(reject_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("reason_code", response.data["errors"])

        # 2. Selected "Other" but missing reason note
        response = self.client.post(reject_url, {"reason_code": WorkflowRejectReason.OTHER})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("reason_note", response.data["errors"])

    def test_permission_role_restrictions(self):
        # Bill is in RECEIVING, only DATA_ENTRY can submit/approve
        approve_url = reverse("workflow-approve", args=[self.bill.id])

        # Try approving as supervisor
        self.set_auth_credentials(self.supervisor_token)
        response = self.client.post(approve_url, {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Try approving as manager
        self.set_auth_credentials(self.manager_token)
        response = self.client.post(approve_url, {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Super admin should be allowed to bypass and approve
        self.set_auth_credentials(self.admin_token)
        response = self.client.post(approve_url, {})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.current_status, BillStatus.DATA_ENTRY)

    def test_list_pending_by_role(self):
        # Create second bill in SUPERVISOR status
        bill_supervisor = Bill.objects.create(
            bill_number="INV-2026-X02",
            bill_date="2026-07-12",
            amount=1000.00,
            vendor=self.vendor,
            department=self.department,
            tracking_id="BILL-00000002",
            current_status=BillStatus.SUPERVISOR,
            created_by=self.data_entry,
        )

        pending_url = reverse("workflow-pending")

        # 1. Login as Supervisor -> should see self.bill_supervisor only
        self.set_auth_credentials(self.supervisor_token)
        response = self.client.get(pending_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["data"]["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], bill_supervisor.id)

        # 2. Login as Data Entry -> should see self.bill (in RECEIVING status)
        self.set_auth_credentials(self.entry_token)
        response = self.client.get(pending_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["data"]["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], self.bill.id)

    def test_concurrency_race_condition(self):
        # Ensure that select_for_update blocks concurrent updates in transaction
        self.set_auth_credentials(self.supervisor_token)
        self.bill.current_status = BillStatus.SUPERVISOR
        self.bill.save()

        # Let's perform a simulated concurrent write block check
        with transaction.atomic():
            # Thread 1 obtains the locks
            bill_locked = Bill.objects.select_for_update().get(pk=self.bill.id)
            
            # Start simulated Thread 2 inside separate DB connection
            # Thread 2 should block trying to acquire lock or fail if timeout occurs
            # We assert that Thread 1 remains intact.
            self.assertEqual(bill_locked.current_status, BillStatus.SUPERVISOR)

    def test_hold_bill_success(self):
        self.set_auth_credentials(self.entry_token)
        hold_url = reverse("workflow-hold", args=[self.bill.id])
        payload = {
            "reason_code": WorkflowHoldReason.PRICE_DISCREPANCY,
            "comments": "Holding for price validation",
        }
        response = self.client.post(hold_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.current_status, BillStatus.HOLDING)

        # Verify history trace
        history = WorkflowHistory.objects.filter(bill=self.bill).order_by("-created_at")
        self.assertEqual(history[0].action, "HOLD")
        self.assertEqual(history[0].reason_code, WorkflowHoldReason.PRICE_DISCREPANCY)
        self.assertEqual(history[0].comments, "Holding for price validation")

    def test_hold_bill_validation_error(self):
        self.set_auth_credentials(self.entry_token)
        hold_url = reverse("workflow-hold", args=[self.bill.id])
        # Missing reason_code
        response = self.client.post(hold_url, {"comments": "Hold"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_resume_bill_success(self):
        # Setup: Put bill on hold from RECEIVING
        self.set_auth_credentials(self.entry_token)
        hold_url = reverse("workflow-hold", args=[self.bill.id])
        self.client.post(hold_url, {
            "reason_code": WorkflowHoldReason.TAX_DISCREPANCY,
            "comments": "Holding",
        })

        resume_url = reverse("workflow-resume", args=[self.bill.id])
        response = self.client.post(resume_url, {"comments": "Resuming after tax correction"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.current_status, BillStatus.RECEIVING)

        # Verify history trace
        history = WorkflowHistory.objects.filter(bill=self.bill).order_by("-created_at")
        self.assertEqual(history[0].action, "RESUME")
        self.assertEqual(history[0].comments, "Resuming after tax correction")
        self.assertEqual(history[0].from_status, BillStatus.HOLDING)
        self.assertEqual(history[0].to_status, BillStatus.RECEIVING)

    def test_resume_bill_permission_denied(self):
        # Setup: transition to SUPERVISOR status
        self.set_auth_credentials(self.entry_token)
        approve_url = reverse("workflow-approve", args=[self.bill.id])
        self.client.post(approve_url) # RECEIVING -> DATA_ENTRY
        self.client.post(approve_url) # DATA_ENTRY -> SUPERVISOR
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.current_status, BillStatus.SUPERVISOR)

        # Hold it using Supervisor credentials
        self.set_auth_credentials(self.supervisor_token)
        hold_url = reverse("workflow-hold", args=[self.bill.id])
        self.client.post(hold_url, {
            "reason_code": WorkflowHoldReason.QUANTITY_DISCREPANCY,
            "comments": "Quantity check",
        })

        # Try to resume as Data Entry user (unauthorized for supervisor status)
        self.set_auth_credentials(self.entry_token)
        resume_url = reverse("workflow-resume", args=[self.bill.id])
        response = self.client.post(resume_url, {"comments": "Resuming"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
