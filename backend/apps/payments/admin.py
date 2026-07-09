from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "method", "amount", "direction", "sale",
        "purchase_order", "payment_date", "recorded_by",
    )
    list_filter = ("method", "direction", "payment_date")
    search_fields = ("reference", "notes", "sale__invoice_number")
    date_hierarchy = "payment_date"
    readonly_fields = ("payment_date",)

    def has_change_permission(self, request, obj=None):
        return False
