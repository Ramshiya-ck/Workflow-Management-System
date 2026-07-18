from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError

from core.permissions.roles import IsSuperAdmin
from .serializers import CustomUserSerializer, UserCreateSerializer
from .services import UserService
from django.contrib.auth import get_user_model

User = get_user_model()


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class CustomUserViewSet(viewsets.ModelViewSet):
    """
    Super Admin only endpoint for managing system users, roles, and password resets.
    """

    queryset = User.objects.all().order_by("-created_at")
    permission_classes = [IsSuperAdmin]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return CustomUserSerializer

    def list(self, request):
        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")

        filters = {}
        role_param = request.query_params.get("role")
        if role_param:
            filters["role"] = role_param

        dept_param = request.query_params.get("department")
        if dept_param:
            filters["department_id"] = dept_param

        active_param = request.query_params.get("is_active")
        if active_param is not None:
            filters["is_active"] = active_param.lower() == "true"

        queryset = UserService.list_users(filters=filters, search=search, ordering=ordering)

        paginator = StandardResultsSetPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request, view=self)

        serializer = CustomUserSerializer(paginated_queryset, many=True)

        return Response(
            {
                "success": True,
                "message": "Users retrieved successfully.",
                "data": {
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "results": serializer.data,
                },
            }
        )

    def retrieve(self, request, pk=None):
        user = User.objects.select_related("department", "created_by", "updated_by").get(pk=pk)
        serializer = CustomUserSerializer(user)
        return Response(
            {
                "success": True,
                "message": "User retrieved successfully.",
                "data": serializer.data,
            }
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = UserService.create_user(
            admin_user=request.user,
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            first_name=serializer.validated_data["first_name"],
            last_name=serializer.validated_data.get("last_name", ""),
            phone_number=serializer.validated_data.get("phone_number", ""),
            role=serializer.validated_data.get("role"),
            department=serializer.validated_data.get("department"),
        )

        response_serializer = CustomUserSerializer(user)
        return Response(
            {
                "success": True,
                "message": "User created successfully.",
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        serializer = CustomUserSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        user = UserService.update_user(
            admin_user=request.user,
            user_id=instance.pk,
            email=serializer.validated_data.get("email"),
            first_name=serializer.validated_data.get("first_name"),
            last_name=serializer.validated_data.get("last_name"),
            phone_number=serializer.validated_data.get("phone_number"),
            role=serializer.validated_data.get("role"),
            is_active=serializer.validated_data.get("is_active"),
            department=serializer.validated_data.get("department"),
            password=request.data.get("password"),
        )

        response_serializer = CustomUserSerializer(user)
        return Response(
            {
                "success": True,
                "message": "User updated successfully.",
                "data": response_serializer.data,
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        UserService.deactivate_user(admin_user=request.user, user_id=instance.pk)
        return Response(
            {"success": True, "message": "User deactivated successfully.", "data": None}
        )

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        user = UserService.activate_user(admin_user=request.user, user_id=pk)
        serializer = CustomUserSerializer(user)
        return Response(
            {
                "success": True,
                "message": "User activated successfully.",
                "data": serializer.data,
            }
        )

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        user = UserService.deactivate_user(admin_user=request.user, user_id=pk)
        serializer = CustomUserSerializer(user)
        return Response(
            {
                "success": True,
                "message": "User deactivated successfully.",
                "data": serializer.data,
            }
        )

    @action(detail=True, methods=["post"], url_path="reset-password")
    def reset_password(self, request, pk=None):
        password = request.data.get("password")
        if not password:
            raise ValidationError({"password": ["This field is required."]})
        if len(password) < 8:
            raise ValidationError({"password": ["Password must be at least 8 characters long."]})
        import re
        if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
            raise ValidationError({"password": ["Password must contain at least one letter and one number."]})

        user = UserService.reset_password(admin_user=request.user, user_id=pk, password=password)
        serializer = CustomUserSerializer(user)
        return Response(
            {
                "success": True,
                "message": "Password reset successfully.",
                "data": serializer.data,
            }
        )

    @action(detail=False, methods=["get"])
    def roles(self, request):
        from core.choices import UserRole
        roles_data = [{"value": choice[0], "label": choice[1]} for choice in UserRole.choices]
        return Response(
            {
                "success": True,
                "message": "Roles retrieved successfully.",
                "data": roles_data,
            }
        )

    def get_permissions(self):
        if self.action == "system_settings" and self.request.method == "GET":
            return [permissions.IsAuthenticated()]
        return [IsSuperAdmin()]

    @action(detail=False, methods=["GET", "POST"], url_path="system-settings")
    def system_settings(self, request):
        from .models import SystemSetting
        if request.method == "GET":
            settings_obj, _ = SystemSetting.objects.get_or_create(
                key="system_config",
                defaults={
                    "value": {
                        "permissions": {
                            "create_bills": { "name": "Create & Edit Bills", "DATA_ENTRY": False, "SUPERVISOR": False, "MANAGER": False, "ACCOUNTS": False },
                            "assign_depts": { "name": "Assign Store Departments", "DATA_ENTRY": True, "SUPERVISOR": True, "MANAGER": False, "ACCOUNTS": False },
                            "approve_transition": { "name": "Authorize Step Transitions", "DATA_ENTRY": True, "SUPERVISOR": True, "MANAGER": True, "ACCOUNTS": True },
                            "reject_bills": { "name": "Execute Step Rejections", "DATA_ENTRY": True, "SUPERVISOR": True, "MANAGER": True, "ACCOUNTS": True },
                            "view_audit": { "name": "View System Audit Trails", "DATA_ENTRY": True, "SUPERVISOR": True, "MANAGER": True, "ACCOUNTS": True },
                            "export_reports": { "name": "Export Financial Reports", "DATA_ENTRY": False, "SUPERVISOR": False, "MANAGER": True, "ACCOUNTS": True },
                        },
                        "security": {
                            "enforceMfa": True,
                            "passExpiry": "90",
                            "maxAttempts": "5",
                            "sessionTimeout": "30",
                        },
                        "privacy": {
                            "maskPii": True,
                            "dataRetention": "3",
                            "encryptBackups": True,
                        }
                    }
                }
            )
            return Response({"success": True, "data": settings_obj.value})
        
        elif request.method == "POST":
            # Only super admin can change settings
            if not (request.user.is_superuser or request.user.role == "SUPER_ADMIN"):
                return Response({"success": False, "message": "Only Super Admins can configure settings."}, status=403)
            
            settings_obj, _ = SystemSetting.objects.get_or_create(key="system_config")
            settings_obj.value = request.data
            settings_obj.save()
            return Response({"success": True, "message": "Settings saved successfully.", "data": settings_obj.value})


