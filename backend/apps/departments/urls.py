from django.urls import path
from .views import (
    DepartmentListCreateView,
    DepartmentDetailView,
    DepartmentActivateView,
    DepartmentDeactivateView,
)

urlpatterns = [
    path("", DepartmentListCreateView.as_view(), name="department_list_create"),
    path("<int:pk>/", DepartmentDetailView.as_view(), name="department_detail"),
    path("<int:pk>/activate/", DepartmentActivateView.as_view(), name="department_activate"),
    path("<int:pk>/deactivate/", DepartmentDeactivateView.as_view(), name="department_deactivate"),
]
