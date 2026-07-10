from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginActivityViewSet, ActivityLogViewSet

router = DefaultRouter()
router.register(r"logins", LoginActivityViewSet, basename="audit_logins")
router.register(r"activities", ActivityLogViewSet, basename="audit_activities")

urlpatterns = [
    path("", include(router.urls)),
]
