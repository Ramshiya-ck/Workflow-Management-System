from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from core.permissions.roles import IsSuperAdmin
from .models import Department
from .serializers import DepartmentSerializer
from .services import DepartmentService


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Departments.
    Only Super Admins can write/delete; others can read.
    """

    queryset = Department.objects.all().order_by("name")
    serializer_class = DepartmentSerializer
    search_fields = ["name", "code"]
    filterset_fields = ["is_active"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsSuperAdmin()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        department = DepartmentService.create_department(
            user=request.user,
            name=serializer.validated_data["name"],
            code=serializer.validated_data["code"],
            is_active=serializer.validated_data.get("is_active", True),
        )

        response_serializer = self.get_serializer(department)
        return Response(
            {
                "success": True,
                "message": "Department created successfully.",
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        department = DepartmentService.update_department(
            user=request.user,
            department_id=instance.pk,
            name=serializer.validated_data.get("name"),
            code=serializer.validated_data.get("code"),
            is_active=serializer.validated_data.get("is_active"),
        )

        response_serializer = self.get_serializer(department)
        return Response(
            {
                "success": True,
                "message": "Department updated successfully.",
                "data": response_serializer.data,
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        DepartmentService.delete_department(user=request.user, department_id=instance.pk)
        return Response(
            {"success": True, "message": "Department deleted successfully.", "data": None}
        )
