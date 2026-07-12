import re
from rest_framework import serializers
from apps.users.serializers import UserSummarySerializer
from .models import Department


class DepartmentSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ("id", "name", "code", "is_active")
        read_only_fields = fields


class DepartmentSerializer(serializers.ModelSerializer):
    created_by = UserSummarySerializer(read_only=True)
    updated_by = UserSummarySerializer(read_only=True)

    class Meta:
        model = Department
        fields = (
            "id",
            "name",
            "code",
            "is_active",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_by", "updated_by", "created_at", "updated_at")

    def validate_name(self, value):
        name = value.strip()
        # Case-insensitive uniqueness check
        qs = Department.objects.filter(name__iexact=name)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A department with this name already exists.")
        return name

    def validate_code(self, value):
        code = value.upper().strip()

        # 1. Regex validation (uppercase letters, length 2 to 10)
        if not re.match(r"^[A-Z]{2,10}$", code):
            raise serializers.ValidationError(
                "Department code must contain only 2 to 10 uppercase English letters."
            )

        # 2. Immutable code check on updates
        if self.instance and self.instance.code != code:
            raise serializers.ValidationError(
                "Department code is immutable and cannot be modified."
            )

        return code
