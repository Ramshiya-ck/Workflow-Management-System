from rest_framework import status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from core.permissions.roles import IsSuperAdmin, CanManageVendors
from .serializers import VendorSerializer
from .services import VendorService
from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class VendorViewSet(viewsets.ViewSet):
    """
    ViewSet for managing Vendors.
    Only Super Admins and Receivers can write/delete; all authenticated users can view/list.
    """

    def get_permissions(self):
        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
            "activate",
            "deactivate",
        ]:
            return [CanManageVendors()]
        return [permissions.IsAuthenticated()]

    def list(self, request):
        search = request.query_params.get("search")
        ordering = request.query_params.get("ordering")

        filters = {}
        is_active_param = request.query_params.get("is_active")
        if is_active_param is not None:
            filters["is_active"] = is_active_param.lower() == "true"

        queryset = VendorService.list_vendors(
            user=request.user, filters=filters, search=search, ordering=ordering
        )

        paginator = StandardResultsSetPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request, view=self)

        serializer = VendorSerializer(paginated_queryset, many=True)

        return Response(
            {
                "success": True,
                "message": "Vendors retrieved successfully.",
                "data": {
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "results": serializer.data,
                },
            }
        )

    def create(self, request):
        serializer = VendorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vendor = VendorService.create_vendor(
            user=request.user,
            name=serializer.validated_data["name"],
            address=serializer.validated_data["address"],
            mobile_number=serializer.validated_data["mobile_number"],
            gst_number=serializer.validated_data["gst_number"],
            credit_days=serializer.validated_data["credit_days"],
            is_active=serializer.validated_data.get("is_active", True),
        )

        response_serializer = VendorSerializer(vendor)
        return Response(
            {
                "success": True,
                "message": "Vendor created successfully.",
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, pk=None):
        vendor = VendorService.get_vendor(pk)
        serializer = VendorSerializer(vendor)
        return Response(
            {
                "success": True,
                "message": "Vendor retrieved successfully.",
                "data": serializer.data,
            }
        )

    def update(self, request, pk=None):
        vendor = VendorService.get_vendor(pk)
        serializer = VendorSerializer(vendor, data=request.data)
        serializer.is_valid(raise_exception=True)

        updated_vendor = VendorService.update_vendor(
            user=request.user,
            vendor_id=pk,
            name=serializer.validated_data["name"],
            address=serializer.validated_data["address"],
            mobile_number=serializer.validated_data["mobile_number"],
            gst_number=serializer.validated_data["gst_number"],
            credit_days=serializer.validated_data["credit_days"],
            is_active=serializer.validated_data.get("is_active"),
        )

        response_serializer = VendorSerializer(updated_vendor)
        return Response(
            {
                "success": True,
                "message": "Vendor updated successfully.",
                "data": response_serializer.data,
            }
        )

    def partial_update(self, request, pk=None):
        vendor = VendorService.get_vendor(pk)
        serializer = VendorSerializer(vendor, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated_vendor = VendorService.update_vendor(
            user=request.user,
            vendor_id=pk,
            name=serializer.validated_data.get("name"),
            address=serializer.validated_data.get("address"),
            mobile_number=serializer.validated_data.get("mobile_number"),
            gst_number=serializer.validated_data.get("gst_number"),
            credit_days=serializer.validated_data.get("credit_days"),
            is_active=serializer.validated_data.get("is_active"),
        )

        response_serializer = VendorSerializer(updated_vendor)
        return Response(
            {
                "success": True,
                "message": "Vendor updated successfully.",
                "data": response_serializer.data,
            }
        )

    def destroy(self, request, pk=None):
        VendorService.delete_vendor(user=request.user, vendor_id=pk)
        return Response(
            {
                "success": True,
                "message": "Vendor deleted successfully.",
                "data": None,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        vendor = VendorService.activate_vendor(user=request.user, vendor_id=pk)
        return Response(
            {
                "success": True,
                "message": "Vendor activated successfully.",
                "data": {"id": vendor.id, "is_active": vendor.is_active},
            }
        )

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        vendor = VendorService.deactivate_vendor(user=request.user, vendor_id=pk)
        return Response(
            {
                "success": True,
                "message": "Vendor deactivated successfully.",
                "data": {"id": vendor.id, "is_active": vendor.is_active},
            }
        )
