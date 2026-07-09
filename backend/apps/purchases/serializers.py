from rest_framework import serializers
from .models import PurchaseOrder, PurchaseItem, PurchaseReturn
from apps.products.models import Product


class PurchaseItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = PurchaseItem
        fields = (
            "id", "product", "product_name", "product_sku",
            "quantity_ordered", "quantity_received", "quantity_pending",
            "unit_cost", "subtotal",
        )
        read_only_fields = ("id", "subtotal")


class PurchaseOrderListSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.company", read_only=True)
    created_by_name = serializers.CharField(
        source="created_by.username", read_only=True, default=""
    )
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = (
            "id", "order_number", "supplier", "supplier_name",
            "order_date", "expected_date", "status",
            "total_amount", "paid_amount", "balance_due",
            "is_fully_paid", "item_count",
            "created_by_name", "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def get_item_count(self, obj):
        return obj.items.count()


class PurchaseOrderDetailSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.company", read_only=True)
    created_by_name = serializers.CharField(
        source="created_by.username", read_only=True, default=""
    )
    items = PurchaseItemSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = (
            "id", "order_number", "supplier", "supplier_name",
            "order_date", "expected_date", "status",
            "notes", "total_amount", "paid_amount", "balance_due",
            "is_fully_paid", "items",
            "created_by", "created_by_name",
            "is_active", "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class PurchaseItemCreateSerializer(serializers.Serializer):
    product = serializers.UUIDField()
    quantity_ordered = serializers.IntegerField(min_value=1)
    unit_cost = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)

    def validate_product(self, value):
        try:
            return Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found")


class PurchaseOrderCreateSerializer(serializers.ModelSerializer):
    items = PurchaseItemCreateSerializer(many=True, min_length=1)

    class Meta:
        model = PurchaseOrder
        fields = (
            "order_number", "supplier", "order_date",
            "expected_date", "notes", "items",
        )

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        purchase = PurchaseOrder.objects.create(**validated_data)
        total = 0
        for item_data in items_data:
            product = item_data.pop("product")
            subtotal = item_data["quantity_ordered"] * item_data["unit_cost"]
            PurchaseItem.objects.create(
                purchase_order=purchase,
                product=product,
                subtotal=subtotal,
                **item_data,
            )
            total += subtotal
        purchase.total_amount = total
        purchase.save()
        return purchase


class ReceiveItemsSerializer(serializers.Serializer):
    items = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False,
    )

    def validate_items(self, value):
        for i, item in enumerate(value):
            if "id" not in item:
                raise serializers.ValidationError(
                    f"Item {i + 1}: id is required"
                )
            if "quantity_received" not in item:
                raise serializers.ValidationError(
                    f"Item {i + 1}: quantity_received is required"
                )
        return value


class PurchaseReturnSerializer(serializers.ModelSerializer):
    purchase_order_number = serializers.CharField(
        source="purchase_order.order_number", read_only=True
    )
    supplier_name = serializers.CharField(
        source="purchase_order.supplier.company", read_only=True
    )
    created_by_name = serializers.CharField(
        source="created_by.username", read_only=True, default=""
    )

    class Meta:
        model = PurchaseReturn
        fields = (
            "id", "purchase_order", "purchase_order_number",
            "supplier_name", "return_date", "reason",
            "total_amount", "created_by", "created_by_name",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
