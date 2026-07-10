from django.contrib.auth import get_user_model
from apps.audit.services import AuditService
from core.choices import UserRole
from django.db import transaction

User = get_user_model()


class UserService:
    """
    Business logic layer for managing custom User accounts and Role assignments.
    """

    @staticmethod
    @transaction.atomic
    def create_user(
        admin_user, email, password, first_name, last_name="", phone_number="", role=None
    ):
        email = email.lower().strip()

        if User.objects.filter(email=email).exists():
            from rest_framework.exceptions import ValidationError

            raise ValidationError({"email": ["A user with this email address already exists."]})

        if not role:
            role = UserRole.DATA_ENTRY

        is_staff = role in [UserRole.SUPER_ADMIN]
        is_superuser = role == UserRole.SUPER_ADMIN

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name.strip(),
            last_name=last_name.strip() if last_name else "",
            phone_number=phone_number.strip() if phone_number else "",
            role=role,
            is_staff=is_staff,
            is_superuser=is_superuser,
        )

        AuditService.log_activity(
            user=admin_user,
            action="CREATE",
            instance=user,
            changes={
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone_number": user.phone_number,
                "role": user.role,
                "is_active": user.is_active,
            },
        )

        return user

    @staticmethod
    @transaction.atomic
    def update_user(
        admin_user,
        user_id,
        first_name=None,
        last_name=None,
        phone_number=None,
        role=None,
        is_active=None,
        password=None,
    ):
        user = User.objects.select_for_update().get(pk=user_id)
        old_data = {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone_number": user.phone_number,
            "role": user.role,
            "is_active": user.is_active,
        }
        changes = {}

        if first_name is not None:
            user.first_name = first_name.strip()
            changes["first_name"] = [old_data["first_name"], user.first_name]
        if last_name is not None:
            user.last_name = last_name.strip()
            changes["last_name"] = [old_data["last_name"], user.last_name]
        if phone_number is not None:
            user.phone_number = phone_number.strip()
            changes["phone_number"] = [old_data["phone_number"], user.phone_number]
        if role is not None:
            user.role = role
            user.is_staff = role in [UserRole.SUPER_ADMIN]
            user.is_superuser = role == UserRole.SUPER_ADMIN
            changes["role"] = [old_data["role"], user.role]
        if is_active is not None:
            user.is_active = is_active
            changes["is_active"] = [old_data["is_active"], user.is_active]

        if password:
            user.set_password(password)
            changes["password"] = ["******", "******"]

        if changes:
            user.save()
            AuditService.log_activity(
                user=admin_user, action="UPDATE", instance=user, changes=changes
            )

        return user

    @staticmethod
    @transaction.atomic
    def deactivate_user(admin_user, user_id):
        """
        Deactivates a user account (soft delete) instead of removing it physically from the database.
        """
        user = User.objects.select_for_update().get(pk=user_id)
        if user.is_active:
            user.is_active = False
            user.save()
            AuditService.log_activity(
                user=admin_user,
                action="UPDATE",
                instance=user,
                changes={"is_active": [True, False]},
            )
        return user

