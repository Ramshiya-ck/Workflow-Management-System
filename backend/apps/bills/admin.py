from django.contrib import admin
from .models import Bill

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ("id", "bill_number", "bill_date", "amount", "tracking_id", "vendor", "department", "current_status")
    search_fields = ("bill_number", "tracking_id", "vendor__name")
    list_filter = ("current_status", "vendor", "department")
