from rest_framework import viewsets, status
from rest_framework.response import Response
from core.permissions.roles import IsSuperAdmin
from .serializers import CustomUserSerializer, UserCreateSerializer
from .services import UserService
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomUserViewSet(viewsets.ModelViewSet):
    """
    Super Admin only endpoint for managing system users and roles.
    """

    queryset = User.objects.all().order_by("-created_at")
    permission_classes = [IsSuperAdmin]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return CustomUserSerializer

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

        # Custom users serializer for update validations
        serializer = CustomUserSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        password = request.data.get("password")

        user = UserService.update_user(
            admin_user=request.user,
            user_id=instance.pk,
            first_name=serializer.validated_data.get("first_name"),
            last_name=serializer.validated_data.get("last_name"),
            phone_number=serializer.validated_data.get("phone_number"),
            role=serializer.validated_data.get("role"),
            is_active=serializer.validated_data.get("is_active"),
            password=password,
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

