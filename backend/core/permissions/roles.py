from rest_framework.permissions import BasePermission


class HasRole(BasePermission):
    """
    Allows access only to users with specific roles.
    """

    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Super Admin bypasses all checks
        if request.user.is_superuser or request.user.role == "SUPER_ADMIN":
            return True

        return request.user.role in self.allowed_roles


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "SUPER_ADMIN" or request.user.is_superuser)
        )


class CanManageVendors(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role in ["SUPER_ADMIN", "RECEIVING"] or request.user.is_superuser)
        )


class IsDataEntry(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "DATA_ENTRY" or request.user.is_superuser)
        )


class IsSupervisor(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "SUPERVISOR" or request.user.is_superuser)
        )


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "MANAGER" or request.user.is_superuser)
        )


class IsAccounts(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "ACCOUNTS" or request.user.is_superuser)
        )


class HasPrivilege(BasePermission):
    """
    Enforces dynamic privileges configured by the Super Admin.
    """
    def __init__(self, privilege_key):
        self.privilege_key = privilege_key

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Super Admin bypasses all checks
        if request.user.is_superuser or request.user.role == "SUPER_ADMIN":
            return True

        # Receiving role is always allowed to create/edit bills, view audit logs, and approve transitions (submitting)
        if request.user.role == "RECEIVING":
            if self.privilege_key in ["create_bills", "view_audit", "approve_transition"]:
                return True

        # Look up settings
        try:
            from apps.users.models import SystemSetting
            setting = SystemSetting.objects.filter(key="system_config").first()
            if setting:
                permissions = setting.value.get("permissions", {})
                privilege = permissions.get(self.privilege_key, {})
                return privilege.get(request.user.role, False)
        except Exception:
            pass

        # Fallback to defaults
        DEFAULTS = {
            "create_bills": ["RECEIVING"],
            "assign_depts": ["DATA_ENTRY", "RECEIVING", "SUPERVISOR"],
            "approve_transition": ["DATA_ENTRY", "RECEIVING", "SUPERVISOR", "MANAGER", "ACCOUNTS"],
            "reject_bills": ["DATA_ENTRY", "RECEIVING", "SUPERVISOR", "MANAGER", "ACCOUNTS"],
            "view_audit": ["DATA_ENTRY", "RECEIVING", "SUPERVISOR", "MANAGER", "ACCOUNTS"],
            "export_reports": ["MANAGER", "ACCOUNTS"],
        }
        allowed = DEFAULTS.get(self.privilege_key, [])
        return request.user.role in allowed
