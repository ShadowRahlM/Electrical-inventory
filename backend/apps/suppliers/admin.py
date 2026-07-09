from django.contrib import admin
from .models import Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("company", "contact_person", "phone", "email", "balance", "is_active")
    list_filter = ("is_active",)
    search_fields = ("company", "contact_person", "phone", "email")
