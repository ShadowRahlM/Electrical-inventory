from rest_framework import serializers
from .models import StockMovement
from apps.products.models import Product


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    performed_by_name = serializers.CharField(
        source="performed_by.username", read_only=True, default=""
    )

    class Meta:
        model = StockMovement
        fields = (
            "id", "product", "product_name", "product_sku",
            "movement_type", "quantity", "quantity_change",
            "balance_before", "balance_after",
            "reference", "notes", "performed_by", "performed_by_name",
            "created_at",
        )
        read_only_fields = (
            "id", "balance_before", "balance_after",
            "performed_by", "created_at", "quantity_change",
        )


class RecordMovementSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    movement_type = serializers.ChoiceField(
        choices=StockMovement.MovementType.choices
    )
    quantity = serializers.IntegerField(min_value=1)
    reference = serializers.CharField(required=False, allow_blank=True, max_length=200)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        try:
            product = Product.objects.get(id=data["product_id"], is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError(
                {"product_id": "Product not found"}
            )

        if data["movement_type"] in (
            StockMovement.MovementType.STOCK_OUT,
            StockMovement.MovementType.DAMAGE,
            StockMovement.MovementType.THEFT,
            StockMovement.MovementType.EXPIRED,
        ):
            if product.quantity < data["quantity"]:
                raise serializers.ValidationError(
                    f"Insufficient stock. Available: {product.quantity}, requested: {data['quantity']}"
                )

        data["product"] = product
        return data
