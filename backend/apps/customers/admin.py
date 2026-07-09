from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
        "name", "phone", "email", "credit_limit",
        "outstanding_balance", "loyalty_points", "is_active",
    )
    list_filter = ("is_active",)
    search_fields = ("name", "phone", "email")
