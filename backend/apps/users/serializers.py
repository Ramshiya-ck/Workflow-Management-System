from rest_framework import serializers
from django.contrib.auth import get_user_model
import re

from core.choices import UserRole
from apps.departments.models import Department

User = get_user_model()


class SimpleDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ("id", "name", "code", "is_active")
        read_only_fields = fields


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
        )
        read_only_fields = fields


class CustomUserSerializer(serializers.ModelSerializer):
    department = SimpleDepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source="department",
        write_only=True,
        required=False,
        allow_null=True,
    )
    created_by = UserSummarySerializer(read_only=True)
    updated_by = UserSummarySerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "is_active",
            "department",
            "department_id",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        )

    def validate_phone_number(self, value):
        if value:
            value_str = value.strip()
            if not re.match(r"^\+?1?\d{9,15}$", value_str):
                raise serializers.ValidationError(
                    "Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
                )
            return value_str
        return value


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source="department",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = (
            "email",
            "password",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "is_active",
            "department_id",
        )

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return email

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Za-z]", value) or not re.search(r"\d", value):
            raise serializers.ValidationError("Password must contain at least one letter and one number.")
        return value

    def validate_phone_number(self, value):
        if value:
            value_str = value.strip()
            if not re.match(r"^\+?1?\d{9,15}$", value_str):
                raise serializers.ValidationError(
                    "Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
                )
            return value_str
        return value


