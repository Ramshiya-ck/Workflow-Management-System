from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.http import Http404

from core.permissions.roles import IsSuperAdmin
from .serializers import DepartmentSerializer, DepartmentSummarySerializer
from .services import DepartmentService
from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class DepartmentListCreateView(views.APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsSuperAdmin()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")

        # Extract filters
        filters = {}
        is_active_param = request.query_params.get("is_active")
        if is_active_param is not None:
            # Only allow filtering by is_active if user is Super Admin
            if request.user.is_superuser or request.user.role == "SUPER_ADMIN":
                filters["is_active"] = is_active_param.lower() == "true"

        queryset = DepartmentService.list_departments(
            user=request.user, filters=filters, search=search, ordering=ordering
        )

        paginator = StandardResultsSetPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request, view=self)

        serializer = DepartmentSummarySerializer(paginated_queryset, many=True)

        return Response(
            {
                "success": True,
                "message": "Departments retrieved successfully.",
                "data": {
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "results": serializer.data,
                },
            }
        )

    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        department = DepartmentService.create_department(
            user=request.user,
            name=serializer.validated_data["name"],
            code=serializer.validated_data["code"],
            is_active=serializer.validated_data.get("is_active", True),
        )

        # Return lightweight department details (excluding ownership details)
        data = {
            "id": department.id,
            "name": department.name,
            "code": department.code,
            "is_active": department.is_active,
            "created_at": department.created_at,
            "updated_at": department.updated_at,
        }

        return Response(
            {
                "success": True,
                "message": "Department created successfully.",
                "data": data,
            },
            status=status.HTTP_201_CREATED,
        )


class DepartmentDetailView(views.APIView):
    def get_permissions(self):
        if self.request.method in ["PATCH", "DELETE"]:
            return [IsSuperAdmin()]
        return [permissions.IsAuthenticated()]

    def get(self, request, pk):
        department = DepartmentService.get_department(pk)
        serializer = DepartmentSerializer(department)
        return Response(
            {
                "success": True,
                "message": "Department retrieved successfully.",
                "data": serializer.data,
            }
        )

    def patch(self, request, pk):
        department = DepartmentService.get_department(pk)

        serializer = DepartmentSerializer(department, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated_dept = DepartmentService.update_department(
            user=request.user, department_id=pk, name=serializer.validated_data.get("name")
        )

        response_serializer = DepartmentSerializer(updated_dept)
        return Response(
            {
                "success": True,
                "message": "Department updated successfully.",
                "data": response_serializer.data,
            }
        )

    def delete(self, request, pk):
        DepartmentService.delete_department(user=request.user, department_id=pk)
        return Response(status=status.HTTP_204_NO_CONTENT)


class DepartmentActivateView(views.APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request, pk):
        department = DepartmentService.activate_department(user=request.user, department_id=pk)
        return Response(
            {
                "success": True,
                "message": "Department activated successfully.",
                "data": {"id": department.id, "is_active": department.is_active},
            }
        )


class DepartmentDeactivateView(views.APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request, pk):
        department = DepartmentService.deactivate_department(user=request.user, department_id=pk)
        return Response(
            {
                "success": True,
                "message": "Department deactivated successfully.",
                "data": {"id": department.id, "is_active": department.is_active},
            }
        )
