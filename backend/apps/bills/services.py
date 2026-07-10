import logging
from django.db import transaction
from django.utils import timezone
from apps.audit.services import AuditService
from .models import Bill

logger = logging.getLogger(__name__)


class BillService:
    """
    Business logic layer for managing Bills.
    """

    @staticmethod
    def generate_tracking_id():
        """
        Generates a unique production-ready tracking ID: BILL-YYYYMMDD-XXXX
        """
        today = timezone.localdate()
        date_str = today.strftime("%Y%m%d")

        # Count how many bills created today to get the increment index
        count = Bill.all_objects.filter(created_at__date=today).count()

        # Iterate until we find a unique key (safety check against race conditions)
        for i in range(1, 10000):
            potential_id = f"BILL-{date_str}-{count + i:04d}"
            if not Bill.all_objects.filter(tracking_id=potential_id).exists():
                return potential_id

        # Fallback to random identifier in extreme cases
        import uuid

        return f"BILL-{date_str}-{uuid.uuid4().hex[:4].upper()}"

    @staticmethod
    @transaction.atomic
    def create_bill(user, bill_number, bill_date, amount, vendor, department):
        # Enforce unique vendor + bill number constraint
        if Bill.objects.filter(vendor=vendor, bill_number=bill_number).exists():
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                {"bill_number": ["A bill with this number already exists for this vendor."]}
            )

        tracking_id = BillService.generate_tracking_id()

        bill = Bill.objects.create(
            bill_number=bill_number.strip(),
            bill_date=bill_date,
            amount=amount,
            vendor=vendor,
            department=department,
            tracking_id=tracking_id,
            current_status="RECEIVING",  # Start status
            created_by=user,
        )

        # Log to audit history
        AuditService.log_activity(
            user=user,
            action="CREATE",
            instance=bill,
            changes={
                "bill_number": bill.bill_number,
                "bill_date": str(bill.bill_date),
                "amount": str(bill.amount),
                "vendor_id": vendor.pk,
                "department_id": department.pk,
                "tracking_id": bill.tracking_id,
                "current_status": bill.current_status,
            },
        )

        return bill

    @staticmethod
    @transaction.atomic
    def update_bill(
        user,
        bill_id,
        bill_number=None,
        bill_date=None,
        amount=None,
        vendor=None,
        department=None,
    ):
        bill = Bill.objects.select_for_update().get(pk=bill_id)

        old_data = {
            "bill_number": bill.bill_number,
            "bill_date": bill.bill_date,
            "amount": bill.amount,
            "vendor": bill.vendor,
            "department": bill.department,
        }
        changes = {}

        # Validation for uniqueness if number or vendor changes
        check_number = bill_number if bill_number is not None else bill.bill_number
        check_vendor = vendor if vendor is not None else bill.vendor
        if (bill_number is not None or vendor is not None) and Bill.objects.filter(
            vendor=check_vendor, bill_number=check_number
        ).exclude(pk=bill.pk).exists():
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                {"bill_number": ["A bill with this number already exists for this vendor."]}
            )

        if bill_number is not None:
            bill.bill_number = bill_number.strip()
            changes["bill_number"] = [old_data["bill_number"], bill.bill_number]
        if bill_date is not None:
            bill.bill_date = bill_date
            changes["bill_date"] = [str(old_data["bill_date"]), str(bill.bill_date)]
        if amount is not None:
            bill.amount = amount
            changes["amount"] = [str(old_data["amount"]), str(bill.amount)]
        if vendor is not None:
            bill.vendor = vendor
            changes["vendor_id"] = [old_data["vendor"].pk, vendor.pk]
        if department is not None:
            bill.department = department
            changes["department_id"] = [old_data["department"].pk, department.pk]

        if changes:
            bill.save()
            AuditService.log_activity(user=user, action="UPDATE", instance=bill, changes=changes)

        return bill

    @staticmethod
    @transaction.atomic
    def soft_delete_bill(user, bill_id):
        bill = Bill.objects.select_for_update().get(pk=bill_id)
        bill.soft_delete()

        AuditService.log_activity(
            user=user,
            action="DELETE",
            instance=bill,
            changes={"is_deleted": [False, True]},
        )
        return True
