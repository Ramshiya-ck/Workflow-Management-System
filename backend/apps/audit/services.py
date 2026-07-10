from django.contrib.contenttypes.models import ContentType
from .models import ActivityLog, LoginActivity


class AuditService:
    """
    Enterprise Audit Service to write activity logs and authentication logs
    """

    @staticmethod
    def log_activity(user, action, instance, changes=None):
        if changes is None:
            changes = {}

        # ContentType is a built-in Django framework to link to any Model dynamically
        content_type = ContentType.objects.get_for_model(instance)

        return ActivityLog.objects.create(
            user=user if user and user.is_authenticated else None,
            action=action,
            content_type=content_type,
            object_id=str(instance.pk),
            object_repr=str(instance),
            changes=changes,
        )

    @staticmethod
    def log_login_activity(email, status, ip_address=None, user_agent=None, user=None):
        return LoginActivity.objects.create(
            user=user if user and user.is_authenticated else None,
            email=email,
            status=status,
            ip_address=ip_address,
            user_agent=user_agent,
        )
