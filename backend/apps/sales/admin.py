from django.contrib import admin
from .models import Sale, SaleItem, Quotation, QuotationItem


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ("product", "quantity", "unit_price", "discount", "subtotal")


class QuotationItemInline(admin.TabularInline):
    model = QuotationItem
    extra = 1


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = (
        "invoice_number", "customer", "sale_date",
        "total", "paid_amount", "status", "created_by",
    )
    list_filter = ("status", "sale_date")
    search_fields = ("invoice_number", "customer__name")
    date_hierarchy = "sale_date"
    inlines = [SaleItemInline]
    readonly_fields = (
        "invoice_number", "subtotal", "discount", "tax",
        "total", "paid_amount", "created_by",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = (
        "quote_number", "customer", "quote_date",
        "valid_until", "total", "status", "created_by",
    )
    list_filter = ("status", "quote_date", "valid_until")
    search_fields = ("quote_number", "customer__name")
    date_hierarchy = "quote_date"
    inlines = [QuotationItemInline]
