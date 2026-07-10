from apps.audit.services import AuditService
from .models import Department


class DepartmentService:
    """
    Business logic layer for managing Departments.
    """

    @staticmethod
    def create_department(user, name, code, is_active=True):
        code = code.upper().strip()
        department = Department.objects.create(
            name=name.strip(),
            code=code,
            is_active=is_active,
        )
        AuditService.log_activity(
            user=user,
            action="CREATE",
            instance=department,
            changes={"name": name, "code": code, "is_active": is_active},
        )
        return department

    @staticmethod
    def update_department(user, department_id, name=None, code=None, is_active=None):
        department = Department.objects.get(pk=department_id)
        old_data = {
            "name": department.name,
            "code": department.code,
            "is_active": department.is_active,
        }
        changes = {}

        if name is not None:
            department.name = name.strip()
            changes["name"] = [old_data["name"], department.name]
        if code is not None:
            department.code = code.upper().strip()
            changes["code"] = [old_data["code"], department.code]
        if is_active is not None:
            department.is_active = is_active
            changes["is_active"] = [old_data["is_active"], department.is_active]

        if changes:
            department.save()
            AuditService.log_activity(
                user=user, action="UPDATE", instance=department, changes=changes
            )

        return department

    @staticmethod
    def delete_department(user, department_id):
        department = Department.objects.get(pk=department_id)
        department_repr = str(department)
        department.delete()

        # Custom logging since the object is removed from database
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
        return True
