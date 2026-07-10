from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from core.permissions.roles import IsSuperAdmin
from .models import Vendor
from .serializers import VendorSerializer
from .services import VendorService


class VendorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Vendors.
    Only Super Admins can write/delete; others can read.
    """

    queryset = Vendor.objects.all().order_by("name")
    serializer_class = VendorSerializer
    search_fields = ["name", "contact_person", "email"]
    filterset_fields = ["is_active"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsSuperAdmin()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vendor = VendorService.create_vendor(
            user=request.user,
            name=serializer.validated_data["name"],
            contact_person=serializer.validated_data.get("contact_person", ""),
            email=serializer.validated_data.get("email", ""),
            phone=serializer.validated_data.get("phone", ""),
            is_active=serializer.validated_data.get("is_active", True),
        )

        response_serializer = self.get_serializer(vendor)
        return Response(
            {
                "success": True,
                "message": "Vendor created successfully.",
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        vendor = VendorService.update_vendor(
            user=request.user,
            vendor_id=instance.pk,
            name=serializer.validated_data.get("name"),
            contact_person=serializer.validated_data.get("contact_person"),
            email=serializer.validated_data.get("email"),
            phone=serializer.validated_data.get("phone"),
            is_active=serializer.validated_data.get("is_active"),
        )

        response_serializer = self.get_serializer(vendor)
        return Response(
            {
                "success": True,
                "message": "Vendor updated successfully.",
                "data": response_serializer.data,
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        VendorService.delete_vendor(user=request.user, vendor_id=instance.pk)
        return Response({"success": True, "message": "Vendor deleted successfully.", "data": None})
