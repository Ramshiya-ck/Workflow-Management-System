from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.vendors.models import Vendor
from apps.departments.models import Department
from apps.bills.models import Bill
from apps.audit.models import ActivityLog

User = get_user_model()


class BillModuleTests(APITestCase):
    def setUp(self):
        # Create users
        self.super_admin = User.objects.create_superuser(
            email="admin@aak.com", password="securepassword123", first_name="Super"
        )
        self.normal_user = User.objects.create_user(
            email="user@aak.com", password="securepassword123", first_name="Normal"
        )

        # Create active vendors
        self.vendor_a = Vendor.objects.create(
            name="Vendor A",
            address="Address A",
            mobile_number="+919876543210",
            gst_number="27AAAAA1111A1Z1",
            credit_days=30,
            is_active=True,
        )
        self.vendor_b = Vendor.objects.create(
            name="Vendor B",
            address="Address B",
            mobile_number="+919876543211",
            gst_number="27BBBBB2222B2Z2",
            credit_days=0,  # Cash Vendor
            is_active=True,
        )
        self.inactive_vendor = Vendor.objects.create(
            name="Inactive Vendor",
            address="Address C",
            mobile_number="+919876543212",
            gst_number="27CCCCC3333C3Z3",
            credit_days=15,
            is_active=False,
        )

        # Create departments
        self.dept_finance = Department.objects.create(
            name="Finance",
            code="FIN",
            is_active=True,
            created_by=self.super_admin,
        )
        self.dept_hr = Department.objects.create(
            name="HR",
            code="HRD",
            is_active=True,
            created_by=self.super_admin,
        )

        # URLs
        self.login_url = reverse("auth_login")
        self.list_create_url = reverse("bills-list")

        # Get JWT tokens
        self.admin_token = self.get_jwt_token("admin@aak.com", "securepassword123")
        self.user_token = self.get_jwt_token("user@aak.com", "securepassword123")

    def get_jwt_token(self, email, password):
        response = self.client.post(self.login_url, {"email": email, "password": password})
        return response.data["data"]["tokens"]["access"]

    def set_auth_credentials(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_create_bill_success(self):
        self.set_auth_credentials(self.user_token)

        data = {
            "bill_number": "INV-2026-001",
            "bill_date": "2026-07-12",
            "amount": 25000.50,
            "vendor_id": self.vendor_a.id,
            # department is optional initially
        }
        response = self.client.post(self.list_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["success"], True)

        bill_id = response.data["data"]["id"]
        bill_obj = Bill.objects.get(pk=bill_id)

        # Verify tracking ID was generated in correct format based on primary key
        expected_tracking_id = f"BILL-{bill_id:08d}"
        self.assertEqual(bill_obj.tracking_id, expected_tracking_id)
        self.assertEqual(response.data["data"]["tracking_id"], expected_tracking_id)
        self.assertEqual(bill_obj.created_by, self.normal_user)

        # Verify audit log was recorded
        create_log = ActivityLog.objects.filter(action="CREATE", object_id=str(bill_id)).first()
        self.assertIsNotNone(create_log)
        self.assertEqual(create_log.changes["bill_number"], "INV-2026-001")

    def test_create_bill_validation_errors(self):
        self.set_auth_credentials(self.user_token)

        # 1. Zero/Negative amount
        data = {
            "bill_number": "INV-2026-001",
            "bill_date": "2026-07-12",
            "amount": -100.00,
            "vendor_id": self.vendor_a.id,
        }
        response = self.client.post(self.list_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("amount", response.data["errors"])

        # 2. Inactive Vendor
        data = {
            "bill_number": "INV-2026-001",
            "bill_date": "2026-07-12",
            "amount": 1000.00,
            "vendor_id": self.inactive_vendor.id,
        }
        response = self.client.post(self.list_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("vendor_id", response.data["errors"])

        # Create a base bill to check uniqueness
        self.client.post(
            self.list_create_url,
            {
                "bill_number": "UNIQUE-123",
                "bill_date": "2026-07-12",
                "amount": 500.00,
                "vendor_id": self.vendor_a.id,
            },
        )

        # 3. Duplicate vendor + bill_number
        data = {
            "bill_number": "UNIQUE-123",
            "bill_date": "2026-07-12",
            "amount": 1500.00,
            "vendor_id": self.vendor_a.id,
        }
        response = self.client.post(self.list_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("bill_number", response.data["errors"])

        # 4. Duplicate bill_number for DIFFERENT vendor (Should pass!)
        data = {
            "bill_number": "UNIQUE-123",
            "bill_date": "2026-07-12",
            "amount": 1500.00,
            "vendor_id": self.vendor_b.id,
        }
        response = self.client.post(self.list_create_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_update_bill_success(self):
        self.set_auth_credentials(self.user_token)

        # Create bill first
        create_res = self.client.post(
            self.list_create_url,
            {
                "bill_number": "INV-ORIGINAL",
                "bill_date": "2026-07-12",
                "amount": 10000.00,
                "vendor_id": self.vendor_a.id,
            },
        )
        bill_id = create_res.data["data"]["id"]

        # Clear logs to check update logging
        ActivityLog.objects.all().delete()

        # Update via PATCH
        detail_url = reverse("bills-detail", args=[bill_id])
        update_data = {
            "bill_number": "INV-MODIFIED",
            "amount": 12500.00,
        }
        response = self.client.patch(detail_url, update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        bill_obj = Bill.objects.get(pk=bill_id)
        self.assertEqual(bill_obj.bill_number, "INV-MODIFIED")
        self.assertEqual(float(bill_obj.amount), 12500.00)
        self.assertEqual(bill_obj.updated_by, self.normal_user)

        # Verify UPDATE log was written
        update_log = ActivityLog.objects.filter(action="UPDATE", object_id=str(bill_id)).first()
        self.assertIsNotNone(update_log)
        self.assertEqual(update_log.changes["amount"], ["10000.00", "12500.00"])

    def test_assign_department(self):
        self.set_auth_credentials(self.user_token)

        # Create bill with null department
        create_res = self.client.post(
            self.list_create_url,
            {
                "bill_number": "INV-DEPT-TEST",
                "bill_date": "2026-07-12",
                "amount": 3500.00,
                "vendor_id": self.vendor_a.id,
            },
        )
        bill_id = create_res.data["data"]["id"]
        bill_obj = Bill.objects.get(pk=bill_id)
        self.assertIsNone(bill_obj.department)

        # Assign Department
        assign_url = reverse("bills-assign-department", args=[bill_id])
        response = self.client.post(assign_url, {"department_id": self.dept_finance.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        bill_obj.refresh_from_db()
        self.assertEqual(bill_obj.department, self.dept_finance)
        self.assertEqual(bill_obj.updated_by, self.normal_user)

        # Verify audit log
        dept_log = ActivityLog.objects.filter(action="UPDATE", object_id=str(bill_id)).first()
        self.assertIsNotNone(dept_log)
        self.assertEqual(dept_log.changes["department_id"], [None, self.dept_finance.id])

    def test_retrieve_bill(self):
        self.set_auth_credentials(self.user_token)

        # Create
        create_res = self.client.post(
            self.list_create_url,
            {
                "bill_number": "RETRIEVE-999",
                "bill_date": "2026-07-12",
                "amount": 900.00,
                "vendor_id": self.vendor_a.id,
                "department_id": self.dept_finance.id,
            },
        )
        bill_id = create_res.data["data"]["id"]

        # Retrieve
        detail_url = reverse("bills-detail", args=[bill_id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]
        self.assertEqual(data["bill_number"], "RETRIEVE-999")
        self.assertEqual(data["vendor"]["name"], "Vendor A")
        self.assertEqual(data["department"]["name"], "Finance")

    def test_list_search_and_filter(self):
        self.set_auth_credentials(self.user_token)

        # Register 2 bills
        self.client.post(
            self.list_create_url,
            {
                "bill_number": "SEARCH-POWER",
                "bill_date": "2026-07-10",
                "amount": 200.00,
                "vendor_id": self.vendor_a.id,
            },
        )
        self.client.post(
            self.list_create_url,
            {
                "bill_number": "SEARCH-GREEN",
                "bill_date": "2026-07-11",
                "amount": 400.00,
                "vendor_id": self.vendor_b.id,
                "department_id": self.dept_hr.id,
            },
        )

        # Search by bill number
        response = self.client.get(f"{self.list_create_url}?search=POWER")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["data"]["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["bill_number"], "SEARCH-POWER")

        # Search by vendor name
        response = self.client.get(f"{self.list_create_url}?search=Vendor B")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["data"]["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["bill_number"], "SEARCH-GREEN")

        # Filter by department
        response = self.client.get(f"{self.list_create_url}?department={self.dept_hr.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["data"]["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["bill_number"], "SEARCH-GREEN")

    def test_anonymous_permissions(self):
        # Clear auth credentials to test anonymous blocks
        self.client.credentials()

        # Try GET List
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Try POST Create
        response = self.client.post(self.list_create_url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
