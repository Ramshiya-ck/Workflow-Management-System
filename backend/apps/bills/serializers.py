from rest_framework import serializers
from apps.vendors.serializers import VendorSummarySerializer
from apps.departments.serializers import DepartmentSummarySerializer
from apps.users.serializers import UserSummarySerializer
from apps.vendors.models import Vendor
from apps.departments.models import Department
from .models import Bill


class BillSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing Bills.
    """

    vendor = VendorSummarySerializer(read_only=True)
    department = DepartmentSummarySerializer(read_only=True)

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
            "created_at",
        )
        read_only_fields = fields


class BillSerializer(serializers.ModelSerializer):
    """
    Serializer for detailed representation and write operations of Bill objects.
    """

    vendor = VendorSummarySerializer(read_only=True)
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.filter(is_active=True),
        source="vendor",
        write_only=True,
        help_text="The ID of the active vendor associated with this bill.",
    )

    department = DepartmentSummarySerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.filter(is_active=True),
        source="department",
        write_only=True,
        required=False,
        allow_null=True,
        help_text="The ID of the active department assigned to this bill.",
    )

    created_by = UserSummarySerializer(read_only=True)
    updated_by = UserSummarySerializer(read_only=True)

    class Meta:
        model = Bill
        fields = (
            "id",
            "bill_number",
            "bill_date",
            "amount",
            "vendor",
            "vendor_id",
            "department",
            "department_id",
            "tracking_id",
            "current_status",
            "rejection_reason",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "tracking_id",
            "current_status",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        )
        validators = []

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Bill amount must be greater than zero.")
        return value

    def validate(self, attrs):
        # Resolve vendor and bill_number for composite uniqueness check, handling updates
        vendor = attrs.get("vendor")
        if vendor is None and self.instance:
            vendor = self.instance.vendor

        bill_number = attrs.get("bill_number")
        if bill_number is None and self.instance:
            bill_number = self.instance.bill_number

        if vendor and bill_number:
            bill_number = bill_number.strip()
            queryset = Bill.objects.filter(vendor=vendor, bill_number__iexact=bill_number)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError(
                    {"bill_number": ["A bill with this number already exists for this vendor."]}
                )

        return attrs


class BillCreateSerializer(serializers.ModelSerializer):
    """
    Temporary backward-compatible serializer for existing views.
    """

    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.filter(is_active=True), source="vendor"
    )
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.filter(is_active=True),
        source="department",
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Bill
        fields = ("bill_number", "bill_date", "amount", "vendor_id", "department_id")
        validators = []

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Bill amount must be greater than zero.")
        return value
