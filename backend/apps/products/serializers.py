from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    supplier_name = serializers.CharField(source="supplier.company", read_only=True)

    class Meta:
        model = Product
        fields = (
            "id", "sku", "barcode", "name", "description", "brand",
            "category", "category_name", "unit",
            "cost_price", "selling_price", "wholesale_price", "retail_price",
            "quantity", "min_stock", "reorder_level",
            "supplier", "supplier_name",
            "vat_rate", "warranty_period", "image", "location", "status",
            "is_low_stock", "is_out_of_stock", "needs_reorder", "margin",
            "is_active", "created_at", "updated_at",
        )
        read_only_fields = (
            "id", "is_low_stock", "is_out_of_stock",
            "needs_reorder", "margin", "created_at", "updated_at",
        )

    def validate(self, data):
        if data.get("selling_price", 0) < data.get("cost_price", 0):
            raise serializers.ValidationError(
                {"selling_price": "Selling price cannot be less than cost price"}
            )
        if data.get("wholesale_price") and data["wholesale_price"] > data.get("selling_price", 0):
            raise serializers.ValidationError(
                {"wholesale_price": "Wholesale price cannot exceed selling price"}
            )
        return data


class ProductBulkImportSerializer(serializers.Serializer):
    products = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False,
    )

    def validate_products(self, value):
        errors = []
        for i, item in enumerate(value):
            item_errors = {}
            if not item.get("sku"):
                item_errors["sku"] = "SKU is required"
            if not item.get("name"):
                item_errors["name"] = "Name is required"
            if item.get("cost_price") is None:
                item_errors["cost_price"] = "Cost price is required"
            if item.get("selling_price") is None:
                item_errors["selling_price"] = "Selling price is required"
            if item_errors:
                errors.append({"row": i + 1, "errors": item_errors})
        if errors:
            raise serializers.ValidationError(errors)
        return value


class ProductExportSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", default="")
    supplier = serializers.CharField(source="supplier.company", default="")

    class Meta:
        model = Product
        fields = (
            "sku", "barcode", "name", "description", "brand",
            "category", "unit", "cost_price", "selling_price",
            "wholesale_price", "retail_price", "quantity",
            "min_stock", "reorder_level", "supplier",
            "vat_rate", "warranty_period", "location", "status",
        )
