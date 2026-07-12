import logging
from django.db import transaction
from django.db.models import ProtectedError, Q
from rest_framework.exceptions import ValidationError
from django.http import Http404

from apps.audit.services import AuditService
from .models import Vendor

logger = logging.getLogger(__name__)


class VendorService:
    """
    Business logic layer for managing Vendors.
    """

    @staticmethod
    @transaction.atomic
    def create_vendor(user, name, address, mobile_number, gst_number, credit_days, is_active=True):
        """
        Creates a new Vendor and writes an audit log.
        """
        name = name.strip()
        gst_number = gst_number.strip().upper()
        mobile_number = mobile_number.strip()

        # Service-layer uniqueness safety checks
        if Vendor.objects.filter(name__iexact=name).exists():
            raise ValidationError({"name": ["A vendor with this name already exists."]})
        if Vendor.objects.filter(gst_number=gst_number).exists():
            raise ValidationError({"gst_number": ["A vendor with this GST number already exists."]})

        vendor = Vendor.objects.create(
            name=name,
            address=address,
            mobile_number=mobile_number,
            gst_number=gst_number,
            credit_days=credit_days,
            is_active=is_active,
        )

        AuditService.log_activity(
            user=user,
            action="CREATE",
            instance=vendor,
            changes={
                "name": vendor.name,
                "address": vendor.address,
                "mobile_number": vendor.mobile_number,
                "gst_number": vendor.gst_number,
                "credit_days": vendor.credit_days,
                "is_active": vendor.is_active,
            },
        )
        return vendor

    @staticmethod
    @transaction.atomic
    def update_vendor(
        user,
        vendor_id,
        name=None,
        address=None,
        mobile_number=None,
        gst_number=None,
        credit_days=None,
        is_active=None,
    ):
        """
        Updates an existing vendor using select_for_update for concurrency safety.
        """
        try:
            vendor = Vendor.objects.select_for_update().get(pk=vendor_id)
        except Vendor.DoesNotExist:
            raise Http404("Vendor not found.")

        old_data = {
            "name": vendor.name,
            "address": vendor.address,
            "mobile_number": vendor.mobile_number,
            "gst_number": vendor.gst_number,
            "credit_days": vendor.credit_days,
            "is_active": vendor.is_active,
        }
        changes = {}

        if name is not None:
            name = name.strip()
            if Vendor.objects.filter(name__iexact=name).exclude(pk=vendor_id).exists():
                raise ValidationError({"name": ["A vendor with this name already exists."]})
            vendor.name = name
            changes["name"] = [old_data["name"], vendor.name]

        if address is not None:
            vendor.address = address
            changes["address"] = [old_data["address"], vendor.address]

        if mobile_number is not None:
            mobile_number = mobile_number.strip()
            vendor.mobile_number = mobile_number
            changes["mobile_number"] = [old_data["mobile_number"], vendor.mobile_number]

        if gst_number is not None:
            gst_number = gst_number.strip().upper()
            if Vendor.objects.filter(gst_number=gst_number).exclude(pk=vendor_id).exists():
                raise ValidationError({"gst_number": ["A vendor with this GST number already exists."]})
            vendor.gst_number = gst_number
            changes["gst_number"] = [old_data["gst_number"], vendor.gst_number]

        if credit_days is not None:
            if credit_days < 0:
                raise ValidationError({"credit_days": ["Credit days must be a non-negative integer."]})
            vendor.credit_days = credit_days
            changes["credit_days"] = [old_data["credit_days"], vendor.credit_days]

        if is_active is not None:
            vendor.is_active = is_active
            changes["is_active"] = [old_data["is_active"], vendor.is_active]

        if changes:
            vendor.save()
            AuditService.log_activity(user=user, action="UPDATE", instance=vendor, changes=changes)

        return vendor

    @staticmethod
    @transaction.atomic
    def activate_vendor(user, vendor_id):
        """
        Activates a vendor profile.
        """
        try:
            vendor = Vendor.objects.select_for_update().get(pk=vendor_id)
        except Vendor.DoesNotExist:
            raise Http404("Vendor not found.")

        if not vendor.is_active:
            vendor.is_active = True
            vendor.save()
            AuditService.log_activity(
                user=user,
                action="UPDATE",
                instance=vendor,
                changes={"is_active": [False, True]},
            )
        return vendor

    @staticmethod
    @transaction.atomic
    def deactivate_vendor(user, vendor_id):
        """
        Deactivates a vendor profile.
        """
        try:
            vendor = Vendor.objects.select_for_update().get(pk=vendor_id)
        except Vendor.DoesNotExist:
            raise Http404("Vendor not found.")

        if vendor.is_active:
            vendor.is_active = False
            vendor.save()
            AuditService.log_activity(
                user=user,
                action="UPDATE",
                instance=vendor,
                changes={"is_active": [True, False]},
            )
        return vendor

    @staticmethod
    @transaction.atomic
    def delete_vendor(user, vendor_id):
        """
        Deletes a vendor profile, verifying protection constraints.
        """
        try:
            vendor = Vendor.objects.select_for_update().get(pk=vendor_id)
        except Vendor.DoesNotExist:
            raise Http404("Vendor not found.")

        vendor_repr = str(vendor)

        try:
            vendor.delete()
        except ProtectedError:
            raise ValidationError(
                "Cannot delete vendor. It is referenced by one or more bills."
            )

        # Audit delete activity using ContentType and ActivityLog directly as object is removed from database
        from django.contrib.contenttypes.models import ContentType
        from apps.audit.models import ActivityLog

        content_type = ContentType.objects.get_for_model(Vendor)
        ActivityLog.objects.create(
            user=user,
            action="DELETE",
            content_type=content_type,
            object_id=str(vendor_id),
            object_repr=vendor_repr,
        )

    @staticmethod
    def get_vendor(vendor_id):
        """
        Retrieves a vendor by primary key.
        """
        try:
            return Vendor.objects.get(pk=vendor_id)
        except Vendor.DoesNotExist:
            raise Http404("Vendor not found.")

    @staticmethod
    def list_vendors(user, filters=None, search=None, ordering=None):
        """
        Retrieves list of vendors. Supports search, filtering, and custom ordering.
        """
        queryset = Vendor.objects.all()

        if filters:
            queryset = queryset.filter(**filters)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(gst_number__icontains=search)
                | Q(mobile_number__icontains=search)
            )

        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by("name")

        return queryset
