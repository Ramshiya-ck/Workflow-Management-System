from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.http import Http404
from rest_framework.exceptions import ValidationError

from apps.audit.services import AuditService
from core.choices import UserRole

User = get_user_model()


class UserService:
    """
    Business logic layer for managing custom User accounts and Role assignments.
    """

    @staticmethod
    @transaction.atomic
    def create_user(
        admin_user,
        email,
        password,
        first_name,
        last_name="",
        phone_number="",
        role=None,
        department=None,
    ):
        email = email.lower().strip()

        if User.objects.filter(email=email).exists():
            raise ValidationError({"email": ["A user with this email address already exists."]})

        if not role:
            role = UserRole.DATA_ENTRY

        is_staff = role in [UserRole.SUPER_ADMIN]
        is_superuser = role == UserRole.SUPER_ADMIN

        # Create user
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name.strip(),
            last_name=last_name.strip() if last_name else "",
            phone_number=phone_number.strip() if phone_number else "",
            role=role,
            is_staff=is_staff,
            is_superuser=is_superuser,
            department=department,
            created_by=admin_user,
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
                "department_id": department.id if department else None,
            },
        )

        return user

    @staticmethod
    @transaction.atomic
    def update_user(
        admin_user,
        user_id,
        email=None,
        first_name=None,
        last_name=None,
        phone_number=None,
        role=None,
        is_active=None,
        department=None,
        password=None,
    ):
        try:
            user = User.objects.select_for_update().get(pk=user_id)
        except User.DoesNotExist:
            raise Http404("User not found.")

        old_data = {
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone_number": user.phone_number,
            "role": user.role,
            "is_active": user.is_active,
            "department_id": user.department.id if user.department else None,
        }
        changes = {}

        if email is not None:
            email = email.lower().strip()
            if email != old_data["email"]:
                if User.objects.filter(email=email).exists():
                    raise ValidationError({"email": ["A user with this email address already exists."]})
                user.email = email
                changes["email"] = [old_data["email"], user.email]

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
        if department is not None or "department" in changes: # Wait, support setting department to None
            user.department = department
            changes["department_id"] = [old_data["department_id"], department.id if department else None]
        # Also support resetting department explicitly if department passed is None (optional check)
        elif department is None and old_data["department_id"] is not None:
            user.department = None
            changes["department_id"] = [old_data["department_id"], None]

        if password:
            user.set_password(password)
            changes["password"] = ["******", "******"]

        if changes:
            user.updated_by = admin_user
            user.save()
            AuditService.log_activity(
                user=admin_user, action="UPDATE", instance=user, changes=changes
            )

        return user

    @staticmethod
    @transaction.atomic
    def activate_user(admin_user, user_id):
        """
        Activates a user account and logs activity.
        """
        try:
            user = User.objects.select_for_update().get(pk=user_id)
        except User.DoesNotExist:
            raise Http404("User not found.")

        if not user.is_active:
            user.is_active = True
            user.updated_by = admin_user
            user.save()
            AuditService.log_activity(
                user=admin_user,
                action="UPDATE",
                instance=user,
                changes={"is_active": [False, True]},
            )
        return user

    @staticmethod
    @transaction.atomic
    def deactivate_user(admin_user, user_id):
        """
        Deactivates a user account (soft delete) instead of removing it physically from the database.
        """
        try:
            user = User.objects.select_for_update().get(pk=user_id)
        except User.DoesNotExist:
            raise Http404("User not found.")

        if user.is_active:
            user.is_active = False
            user.updated_by = admin_user
            user.save()
            AuditService.log_activity(
                user=admin_user,
                action="UPDATE",
                instance=user,
                changes={"is_active": [True, False]},
            )
        return user

    @staticmethod
    @transaction.atomic
    def reset_password(admin_user, user_id, password):
        """
        Resets user's password securely.
        """
        try:
            user = User.objects.select_for_update().get(pk=user_id)
        except User.DoesNotExist:
            raise Http404("User not found.")

        user.set_password(password)
        user.updated_by = admin_user
        user.save()

        AuditService.log_activity(
            user=admin_user,
            action="UPDATE",
            instance=user,
            changes={"password": ["******", "******"]},
        )
        return user

    @staticmethod
    def list_users(filters=None, search=None, ordering=None):
        """
        Lists all custom user records optimized with select_related.
        Supports filtering, searching, and ordering dynamically.
        """
        queryset = User.objects.select_related("department", "created_by", "updated_by").all()

        if filters:
            queryset = queryset.filter(**filters)

        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
                | Q(phone_number__icontains=search)
            )

        if ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by("-created_at")

        return queryset


