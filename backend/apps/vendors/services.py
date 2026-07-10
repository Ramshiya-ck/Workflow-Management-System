from apps.audit.services import AuditService
from .models import Vendor


class VendorService:
    """
    Business logic layer for managing Vendors.
    """

    @staticmethod
    def create_vendor(user, name, contact_person="", email="", phone="", is_active=True):
        vendor = Vendor.objects.create(
            name=name.strip(),
            contact_person=contact_person.strip(),
            email=email.strip(),
            phone=phone.strip(),
            is_active=is_active,
        )
        AuditService.log_activity(
            user=user,
            action="CREATE",
            instance=vendor,
            changes={
                "name": vendor.name,
                "contact_person": vendor.contact_person,
                "email": vendor.email,
                "phone": vendor.phone,
                "is_active": vendor.is_active,
            },
        )
        return vendor

    @staticmethod
    def update_vendor(
        user,
        vendor_id,
        name=None,
        contact_person=None,
        email=None,
        phone=None,
        is_active=None,
    ):
        vendor = Vendor.objects.get(pk=vendor_id)
        old_data = {
            "name": vendor.name,
            "contact_person": vendor.contact_person,
            "email": vendor.email,
            "phone": vendor.phone,
            "is_active": vendor.is_active,
        }
        changes = {}

        if name is not None:
            vendor.name = name.strip()
            changes["name"] = [old_data["name"], vendor.name]
        if contact_person is not None:
            vendor.contact_person = contact_person.strip()
            changes["contact_person"] = [old_data["contact_person"], vendor.contact_person]
        if email is not None:
            vendor.email = email.strip()
            changes["email"] = [old_data["email"], vendor.email]
        if phone is not None:
            vendor.phone = phone.strip()
            changes["phone"] = [old_data["phone"], vendor.phone]
        if is_active is not None:
            vendor.is_active = is_active
            changes["is_active"] = [old_data["is_active"], vendor.is_active]

        if changes:
            vendor.save()
            AuditService.log_activity(user=user, action="UPDATE", instance=vendor, changes=changes)

        return vendor

    @staticmethod
    def delete_vendor(user, vendor_id):
        vendor = Vendor.objects.get(pk=vendor_id)
        vendor_repr = str(vendor)
        vendor.delete()

        # Custom logging since the object is removed from database
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
        return True
