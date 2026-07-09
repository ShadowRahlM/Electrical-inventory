from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "sku", "name", "brand", "category", "selling_price",
        "quantity", "min_stock", "status", "is_active",
    )
    list_filter = ("status", "is_active", "brand", "category")
    search_fields = ("sku", "barcode", "name", "brand")
    list_editable = ("quantity", "selling_price")
