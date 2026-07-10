from .models import Notification


class NotificationService:
    """
    Handles generation of in-app notifications for workflow status updates.
    """

    @staticmethod
    def create_notification(recipient, title, message, notification_type, bill=None):
        return Notification.objects.create(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=notification_type,
            bill=bill,
        )

    @staticmethod
    def mark_as_read(notification_id, user):
        try:
            notification = Notification.objects.get(pk=notification_id, recipient=user)
            notification.is_read = True
            notification.save()
            return notification
        except Notification.DoesNotExist:
            return None

    @staticmethod
    def mark_all_as_read(user):
        Notification.objects.filter(recipient=user, is_read=False).update(is_read=True)
        return True
