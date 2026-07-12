from rest_framework import status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from .serializers import BillSerializer
from .services import BillService
from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class BillViewSet(viewsets.ViewSet):
    """
    ViewSet for managing Bills (Data Entry phase).
    Thin layer delegating all business logic to BillService.
    """

    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")

        filters = {}
        for param in ["vendor", "department", "current_status"]:
            val = request.query_params.get(param)
            if val is not None:
                filters[param] = val

        queryset = BillService.list_bills(
            user=request.user, filters=filters, search=search, ordering=ordering
        )

        paginator = StandardResultsSetPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request, view=self)

        serializer = BillSerializer(paginated_queryset, many=True)

        return Response(
            {
                "success": True,
                "message": "Bills retrieved successfully.",
                "data": {
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "results": serializer.data,
                },
            }
        )

    def create(self, request):
        serializer = BillSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        bill = BillService.create_bill(
            user=request.user,
            bill_number=serializer.validated_data["bill_number"],
            bill_date=serializer.validated_data["bill_date"],
            amount=serializer.validated_data["amount"],
            vendor=serializer.validated_data["vendor"],
            department=serializer.validated_data.get("department"),
        )

        response_serializer = BillSerializer(bill)
        return Response(
            {
                "success": True,
                "message": "Bill registered successfully.",
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, pk=None):
        bill = BillService.get_bill(pk)
        serializer = BillSerializer(bill)
        return Response(
            {
                "success": True,
                "message": "Bill retrieved successfully.",
                "data": serializer.data,
            }
        )

    def partial_update(self, request, pk=None):
        bill_obj = BillService.get_bill(pk)

        serializer = BillSerializer(bill_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated_bill = BillService.update_bill(
            user=request.user,
            bill_id=pk,
            bill_number=serializer.validated_data.get("bill_number"),
            bill_date=serializer.validated_data.get("bill_date"),
            amount=serializer.validated_data.get("amount"),
            vendor=serializer.validated_data.get("vendor"),
            department=serializer.validated_data.get("department"),
        )

        response_serializer = BillSerializer(updated_bill)
        return Response(
            {
                "success": True,
                "message": "Bill updated successfully.",
                "data": response_serializer.data,
            }
        )

    @action(detail=True, methods=["post"], url_path="assign-department")
    def assign_department(self, request, pk=None):
        department_id = request.data.get("department_id")
        if not department_id:
            raise ValidationError({"department_id": ["This field is required."]})

        bill = BillService.assign_department(
            user=request.user, bill_id=pk, department_id=department_id
        )

        response_serializer = BillSerializer(bill)
        return Response(
            {
                "success": True,
                "message": "Department assigned successfully.",
                "data": response_serializer.data,
            }
        )
