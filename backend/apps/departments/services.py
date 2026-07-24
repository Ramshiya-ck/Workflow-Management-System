import logging
from django.db import transaction
from django.db.models import ProtectedError
from rest_framework.exceptions import ValidationError
from django.http import Http404

from apps.audit.services import AuditService
from .models import Department

logger = logging.getLogger(__name__)


class DepartmentService:
    """
    Business logic layer for managing Departments.
    """

    @staticmethod
    @transaction.atomic
    def create_department(user, name, code, is_active=True):
        """
        Creates a new department, sets created_by, and logs the activity.
        """
        name = name.strip()
        code = code.upper().strip()

        # Duplicate checks (handled in serializer but re-verified for safety)
        if Department.objects.filter(name__iexact=name).exists():
            raise ValidationError({"name": ["A department with this name already exists."]})
        if Department.objects.filter(code=code).exists():
            raise ValidationError({"code": ["A department with this code already exists."]})

        department = Department.objects.create(
            name=name,
            code=code,
            is_active=is_active,
            created_by=user,
            updated_by=user,
        )

        AuditService.log_activity(
            user=user,
            action="CREATE",
            instance=department,
            changes={
                "name": department.name,
                "code": department.code,
                "is_active": department.is_active,
            },
        )
        return department

    @staticmethod
    @transaction.atomic
    def update_department(user, department_id, name=None):
        """
        Updates department name, maintains updated_by, and logs updates.
        Locks the row using select_for_update to prevent concurrency race conditions.
        """
        try:
            department = Department.objects.select_for_update().get(pk=department_id)
        except Department.DoesNotExist:
            raise Http404("Department not found.")

        old_data = {"name": department.name}
        changes = {}

        if name is not None:
            name = name.strip()
            # Uniqueness check
            if (
                Department.objects.filter(name__iexact=name)
                .exclude(pk=department_id)
                .exists()
            ):
                raise ValidationError({"name": ["A department with this name already exists."]})
            department.name = name
            changes["name"] = [old_data["name"], department.name]

        if changes:
            department.updated_by = user
            department.save()
            AuditService.log_activity(
                user=user, action="UPDATE", instance=department, changes=changes
            )

        return department

    @staticmethod
    @transaction.atomic
    def activate_department(user, department_id):
        """
        Activates a store department and writes to audit logs.
        """
        try:
            department = Department.objects.select_for_update().get(pk=department_id)
        except Department.DoesNotExist:
            raise Http404("Department not found.")

        if not department.is_active:
            department.is_active = True
            department.updated_by = user
            department.save()

            AuditService.log_activity(
                user=user,
                action="UPDATE",
                instance=department,
                changes={"is_active": [False, True]},
            )

        return department

    @staticmethod
    @transaction.atomic
    def deactivate_department(user, department_id):
        """
        Deactivates store department after validating active bills constraints.
        """
        try:
            department = Department.objects.select_for_update().get(pk=department_id)
        except Department.DoesNotExist:
            raise Http404("Department not found.")

        if department.is_active:
            # Prevent deactivation if active bills are linked
            from apps.bills.models import Bill

            has_pending_bills = (
                Bill.objects.filter(department_id=department_id)
                .exclude(current_status="ACCOUNTS_CLEARED")
                .exists()
            )

            if has_pending_bills:
                raise ValidationError(
                    "Cannot deactivate department. There are active workflow bills associated with it."
                )

            department.is_active = False
            department.updated_by = user
            department.save()

            AuditService.log_activity(
                user=user,
                action="UPDATE",
                instance=department,
                changes={"is_active": [True, False]},
            )

        return department

    @staticmethod
    @transaction.atomic
    def delete_department(user, department_id):
        """
        Attempts deletion, relying on DB referential integrity, catches ProtectedError
        and formats into a clean business-friendly ValidationError.
        """
        try:
            department = Department.objects.select_for_update().get(pk=department_id)
        except Department.DoesNotExist:
            raise Http404("Department not found.")

        department_repr = str(department)

        try:
            department.delete()
        except ProtectedError:
            raise ValidationError(
                "Cannot delete department. Historical bills are referenced under this department."
            )

        # Audit delete activity
        from django.contrib.contenttypes.models import ContentType
        from apps.audit.models import ActivityLog

        content_type = ContentType.objects.get_for_model(Department)
        ActivityLog.objects.create(
            user=user,
            action="DELETE",
            content_type=content_type,
            object_id=str(department_id),
            object_repr=department_repr,
        )

    @staticmethod
    def get_department(department_id):
        """
        Fetches department optimized with select_related.
        """
        try:
            return Department.objects.select_related("created_by", "updated_by").get(
                pk=department_id
            )
        except Department.DoesNotExist:
            raise Http404("Department not found.")

    @staticmethod
    def list_departments(user, filters=None, search=None, ordering=None):
        """
        Retrieves departments pre-fetched to avoid N+1 queries.
        Supports filtering, searching, and ordering dynamically.
        Enforces role-based visibility rules at the Service Layer.
        """
        queryset = Department.objects.select_related("created_by", "updated_by").all()

        # Enforce role-based access: non-SuperAdmins & non-Receivers only see active departments
        if not (user.is_superuser or user.role in ["SUPER_ADMIN", "RECEIVING"]):
            queryset = queryset.filter(is_active=True)

        if filters:
            queryset = queryset.filter(**filters)

        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(
                code__icontains=search
            )

        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by("name")

        return queryset
