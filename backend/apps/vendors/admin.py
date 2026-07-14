from django.contrib import admin
from .models import Vendor

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "gst_number", "mobile_number", "credit_days", "is_active", "created_at")
    search_fields = ("name", "gst_number", "mobile_number")
    list_filter = ("is_active",)
