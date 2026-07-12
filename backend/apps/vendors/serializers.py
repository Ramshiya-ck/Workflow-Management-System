from rest_framework import serializers
from .models import Vendor
import re


class VendorSerializer(serializers.ModelSerializer):
    """
    Serializer for input validation and output representation of Vendor objects.
    """

    is_active = serializers.BooleanField(default=True, required=False)

    class Meta:
        model = Vendor
        fields = (
            "id",
            "name",
            "address",
            "mobile_number",
            "gst_number",
            "credit_days",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_name(self, value):
        name = value.strip()
        queryset = Vendor.objects.filter(name__iexact=name)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("A vendor with this name already exists.")
        return name

    def validate_gst_number(self, value):
        gst_number = value.strip().upper()
        # 15-character Indian GSTIN alphanumeric format regex
        gst_regex = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$"
        if not re.match(gst_regex, gst_number):
            raise serializers.ValidationError(
                "Invalid GST Number format. Must be a valid 15-character GSTIN."
            )

        queryset = Vendor.objects.filter(gst_number=gst_number)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("A vendor with this GST number already exists.")
        return gst_number

    def validate_mobile_number(self, value):
        mobile_number = value.strip()
        # Validates standard E.164-like mobile formats (+ prefix optional, 9 to 15 digits)
        phone_regex = r"^\+?1?\d{9,15}$"
        if not re.match(phone_regex, mobile_number):
            raise serializers.ValidationError(
                "Mobile number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        return mobile_number

    def validate_credit_days(self, value):
        if value < 0:
            raise serializers.ValidationError("Credit days must be a non-negative integer.")
        return value


class VendorSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight summary serializer for Vendor objects.
    """

    class Meta:
        model = Vendor
        fields = ("id", "name", "gst_number", "is_active")
        read_only_fields = fields

