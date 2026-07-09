from django.contrib import admin
from .models import StockMovement


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = (
        "product", "movement_type", "quantity", "quantity_change",
        "balance_after", "performed_by", "created_at",
    )
    list_filter = ("movement_type", "created_at")
    search_fields = ("product__name", "product__sku", "reference")
    date_hierarchy = "created_at"
    readonly_fields = (
        "product", "movement_type", "quantity", "quantity_change",
        "balance_before", "balance_after", "performed_by", "created_at",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
