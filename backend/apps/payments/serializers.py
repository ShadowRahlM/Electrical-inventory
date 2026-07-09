from rest_framework import serializers
from .models import Payment, PaymentMethod, PaymentDirection
from apps.customers.models import Customer
from apps.suppliers.models import Supplier
from apps.sales.models import Sale
from apps.purchases.models import PurchaseOrder


class PaymentSerializer(serializers.ModelSerializer):
    method_display = serializers.CharField(
        source="get_method_display", read_only=True
    )
    direction_display = serializers.CharField(
        source="get_direction_display", read_only=True
    )
    recorded_by_name = serializers.CharField(
        source="recorded_by.username", read_only=True, default=""
    )
    sale_invoice = serializers.CharField(
        source="sale.invoice_number", read_only=True, default=""
    )
    purchase_order_number = serializers.CharField(
        source="purchase_order.order_number", read_only=True, default=""
    )
    customer_name = serializers.CharField(
        source="customer.name", read_only=True, default=""
    )
    supplier_name = serializers.CharField(
        source="supplier.company", read_only=True, default=""
    )

    class Meta:
        model = Payment
        fields = (
            "id", "sale", "sale_invoice",
            "purchase_order", "purchase_order_number",
            "customer", "customer_name",
            "supplier", "supplier_name",
            "direction", "direction_display",
            "method", "method_display",
            "amount", "reference", "notes",
            "payment_date", "recorded_by", "recorded_by_name",
            "is_active", "created_at", "updated_at",
        )
        read_only_fields = (
            "id", "payment_date", "recorded_by",
            "created_at", "updated_at",
        )


class PaymentCreateSerializer(serializers.Serializer):
    sale = serializers.UUIDField(required=False, allow_null=True)
    purchase_order = serializers.UUIDField(required=False, allow_null=True)
    customer = serializers.UUIDField(required=False, allow_null=True)
    supplier = serializers.UUIDField(required=False, allow_null=True)
    direction = serializers.ChoiceField(choices=PaymentDirection.choices)
    method = serializers.ChoiceField(choices=PaymentMethod.choices)
    amount = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=0.01)
    reference = serializers.CharField(required=False, allow_blank=True, max_length=200)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if not any([data.get("sale"), data.get("purchase_order"),
                    data.get("customer"), data.get("supplier")]):
            raise serializers.ValidationError(
                "Must link payment to a sale, purchase order, customer, or supplier"
            )
        return data

    def create(self, validated_data):
        sale_id = validated_data.pop("sale", None)
        po_id = validated_data.pop("purchase_order", None)
        customer_id = validated_data.pop("customer", None)
        supplier_id = validated_data.pop("supplier", None)
        if sale_id:
            validated_data["sale"] = Sale.objects.get(id=sale_id)
        if po_id:
            validated_data["purchase_order"] = PurchaseOrder.objects.get(id=po_id)
        if customer_id:
            validated_data["customer"] = Customer.objects.get(id=customer_id)
        if supplier_id:
            validated_data["supplier"] = Supplier.objects.get(id=supplier_id)
        return Payment.objects.create(**validated_data)
