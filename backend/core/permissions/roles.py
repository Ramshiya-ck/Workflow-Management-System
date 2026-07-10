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


class IsDepartmentManager(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "DEPARTMENT_MANAGER" or request.user.is_superuser)
        )


class IsAccounts(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "ACCOUNTS" or request.user.is_superuser)
        )
