from rest_framework import serializers
from apps.departments.serializers import DepartmentSerializer
from apps.vendors.serializers import VendorSerializer
from apps.users.serializers import CustomUserSerializer
from apps.departments.models import Department
from apps.vendors.models import Vendor
from .models import Bill


class BillSerializer(serializers.ModelSerializer):
    vendor = VendorSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    created_by = CustomUserSerializer(read_only=True)
    assigned_to = CustomUserSerializer(read_only=True)

    class Meta:
        model = Bill
        fields = (
            "id",
            "bill_number",
            "bill_date",
            "amount",
            "vendor",
            "department",
            "tracking_id",
            "current_status",
            "created_by",
            "assigned_to",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "tracking_id", "current_status", "created_at", "updated_at")


class BillCreateSerializer(serializers.ModelSerializer):
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.filter(is_active=True), source="vendor"
    )
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.filter(is_active=True), source="department"
    )

    class Meta:
        model = Bill
        fields = ("bill_number", "bill_date", "amount", "vendor_id", "department_id")

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Bill amount must be greater than zero.")
        return value
