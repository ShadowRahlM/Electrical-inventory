from django.contrib import admin
from .models import PurchaseOrder, PurchaseItem, PurchaseReturn


class PurchaseItemInline(admin.TabularInline):
    model = PurchaseItem
    extra = 1


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number", "supplier", "order_date",
        "total_amount", "paid_amount", "status", "is_active",
    )
    list_filter = ("status", "order_date", "is_active")
    search_fields = ("order_number", "supplier__company")
    inlines = [PurchaseItemInline]


@admin.register(PurchaseReturn)
class PurchaseReturnAdmin(admin.ModelAdmin):
    list_display = ("purchase_order", "return_date", "total_amount", "is_active")
    list_filter = ("return_date",)
