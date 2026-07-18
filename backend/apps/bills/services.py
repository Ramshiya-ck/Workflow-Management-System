import logging
from django.db import transaction
from django.utils import timezone
from django.http import Http404
from django.db.models import Q, ProtectedError
from rest_framework.exceptions import ValidationError

from apps.audit.services import AuditService
from apps.departments.models import Department
from .models import Bill

logger = logging.getLogger(__name__)


class BillService:
    """
    Business logic layer for managing Bills.
    """

    @staticmethod
    @transaction.atomic
    def create_bill(user, bill_number, bill_date, amount, vendor, department=None):
        """
        Registers a new Bill, generates a unique Tracking ID based on PK, and logs the action.
        """
        bill_number = bill_number.strip()

        # Composite uniqueness validation: vendor + bill_number
        if Bill.objects.filter(vendor=vendor, bill_number__iexact=bill_number).exists():
            raise ValidationError(
                {"bill_number": ["A bill with this number already exists for this vendor."]}
            )

        import uuid
        temp_tracking_id = f"TEMP-{uuid.uuid4().hex}"

        bill = Bill.objects.create(
            bill_number=bill_number,
            bill_date=bill_date,
            amount=amount,
            vendor=vendor,
            department=department,
            tracking_id=temp_tracking_id,
            current_status="RECEIVING",
            created_by=user,
        )

        # Generate tracking ID based on pk (zero-padded to 8 digits)
        bill.tracking_id = f"BILL-{bill.pk:08d}"
        bill.save(update_fields=["tracking_id"])

        AuditService.log_activity(
            user=user,
            action="CREATE",
            instance=bill,
            changes={
                "bill_number": bill.bill_number,
                "bill_date": str(bill.bill_date),
                "amount": str(bill.amount),
                "vendor_id": vendor.pk,
                "department_id": department.pk if department else None,
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
        """
        Updates an existing Bill, validates parameters, and logs changes.
        """
        try:
            bill = Bill.objects.select_for_update().get(pk=bill_id)
        except Bill.DoesNotExist:
            raise Http404("Bill not found.")

        old_data = {
            "bill_number": bill.bill_number,
            "bill_date": bill.bill_date,
            "amount": bill.amount,
            "vendor": bill.vendor,
            "department": bill.department,
        }
        changes = {}

        # Composite uniqueness check on update
        check_number = bill_number if bill_number is not None else bill.bill_number
        check_vendor = vendor if vendor is not None else bill.vendor

        if (bill_number is not None or vendor is not None) and Bill.objects.filter(
            vendor=check_vendor, bill_number__iexact=check_number.strip()
        ).exclude(pk=bill_id).exists():
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
            if amount <= 0:
                raise ValidationError({"amount": ["Bill amount must be greater than zero."]})
            bill.amount = amount
            changes["amount"] = [str(old_data["amount"]), str(bill.amount)]

        if vendor is not None:
            bill.vendor = vendor
            changes["vendor_id"] = [old_data["vendor"].pk, vendor.pk]

        if department is not None:
            bill.department = department
            changes["department_id"] = [
                old_data["department"].pk if old_data["department"] else None,
                department.pk,
            ]

        if changes:
            bill.updated_by = user
            bill.save()
            AuditService.log_activity(user=user, action="UPDATE", instance=bill, changes=changes)

        return bill

    @staticmethod
    @transaction.atomic
    def assign_department(user, bill_id, department_id):
        """
        Assigns a department division to a specific bill record.
        """
        try:
            bill = Bill.objects.select_for_update().get(pk=bill_id)
        except Bill.DoesNotExist:
            raise Http404("Bill not found.")

        try:
            department = Department.objects.get(pk=department_id)
        except Department.DoesNotExist:
            raise ValidationError({"department_id": ["Department not found."]})

        old_dept_id = bill.department.pk if bill.department else None

        if old_dept_id != department.pk:
            bill.department = department
            bill.updated_by = user
            bill.save()

            AuditService.log_activity(
                user=user,
                action="UPDATE",
                instance=bill,
                changes={"department_id": [old_dept_id, department.pk]},
            )

        return bill

    @staticmethod
    @transaction.atomic
    def delete_bill(user, bill_id):
        """
        Attempts deletion of a bill record. Catches ProtectedError if
        associated workflow histories prevent deletion.
        """
        try:
            bill = Bill.objects.select_for_update().get(pk=bill_id)
        except Bill.DoesNotExist:
            raise Http404("Bill not found.")

        bill_repr = str(bill)

        try:
            bill.delete()
        except ProtectedError:
            raise ValidationError(
                {"detail": "Cannot delete bill. Historical workflow steps are referenced under this bill."}
            )

        # Audit delete activity
        from django.contrib.contenttypes.models import ContentType
        from apps.audit.models import ActivityLog

        content_type = ContentType.objects.get_for_model(Bill)
        ActivityLog.objects.create(
            user=user,
            action="DELETE",
            content_type=content_type,
            object_id=str(bill_id),
            object_repr=bill_repr,
        )

    @staticmethod
    def get_bill(bill_id):
        """
        Retrieves a single bill record optimized with select_related.
        """
        try:
            return Bill.objects.select_related(
                "vendor", "department", "created_by", "updated_by"
            ).get(pk=bill_id)
        except Bill.DoesNotExist:
            raise Http404("Bill not found.")

    @staticmethod
    def list_bills(user, filters=None, search=None, ordering=None):
        """
        Lists all bills optimized with select_related. Supports filters, searches, and ordering.
        """
        queryset = Bill.objects.select_related(
            "vendor", "department", "created_by", "updated_by"
        ).all()

        if filters:
            queryset = queryset.filter(**filters)

        if search:
            queryset = queryset.filter(
                Q(bill_number__icontains=search)
                | Q(tracking_id__icontains=search)
                | Q(vendor__name__icontains=search)
            )

        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by("-created_at")

        return queryset
