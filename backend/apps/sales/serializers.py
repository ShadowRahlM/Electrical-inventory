from decimal import Decimal
from rest_framework import serializers
from .models import Sale, SaleItem, Quotation, QuotationItem
from apps.products.models import Product
from apps.customers.models import Customer


class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = SaleItem
        fields = (
            "id", "product", "product_name", "product_sku",
            "quantity", "unit_price", "discount", "subtotal",
        )
        read_only_fields = ("id", "subtotal")


class SaleListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source="customer.name", read_only=True, default="Walk-in"
    )
    created_by_name = serializers.CharField(
        source="created_by.username", read_only=True, default=""
    )
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = (
            "id", "invoice_number", "customer", "customer_name",
            "sale_date", "status", "subtotal", "discount",
            "tax", "total", "paid_amount", "balance_due",
            "is_fully_paid", "item_count",
            "created_by_name", "created_at",
        )
        read_only_fields = ("id", "sale_date", "created_at")

    def get_item_count(self, obj):
        return obj.items.count()


class SaleDetailSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source="customer.name", read_only=True, default="Walk-in"
    )
    created_by_name = serializers.CharField(
        source="created_by.username", read_only=True, default=""
    )
    items = SaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = (
            "id", "invoice_number", "customer", "customer_name",
            "sale_date", "status", "subtotal", "discount",
            "discount_type", "tax", "total", "paid_amount",
            "balance_due", "is_fully_paid", "notes",
            "items", "created_by", "created_by_name",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "sale_date", "created_at", "updated_at")


class SaleItemCreateSerializer(serializers.Serializer):
    product = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0
    )
    discount = serializers.DecimalField(
        max_digits=12, decimal_places=2, default=0, min_value=0
    )

    def validate_product(self, value):
        try:
            product = Product.objects.get(id=value, is_active=True)
            if product.status != "active":
                raise serializers.ValidationError("Product is not active")
            if product.quantity < 1:
                raise serializers.ValidationError(
                    f"{product.name} is out of stock"
                )
            return product
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found")


class SaleCreateSerializer(serializers.ModelSerializer):
    items = SaleItemCreateSerializer(many=True, min_length=1)
    payment_method = serializers.CharField(default="cash")
    paid = serializers.DecimalField(
        max_digits=14, decimal_places=2, default=0, min_value=0
    )

    class Meta:
        model = Sale
        fields = (
            "invoice_number", "customer", "discount",
            "discount_type", "notes", "items", "payment_method", "paid",
        )

    def validate_items(self, value):
        for item in value:
            product = item["product"]
            if product.quantity < item["quantity"]:
                raise serializers.ValidationError(
                    f"Insufficient stock for {product.name}. "
                    f"Available: {product.quantity}, requested: {item['quantity']}"
                )
        return value

    def validate(self, data):
        customer = data.get("customer")
        paid = data.get("paid", Decimal("0"))

        if customer and customer.credit_limit > 0:
            if isinstance(customer, Customer):
                customer_obj = customer
            else:
                try:
                    customer_obj = Customer.objects.get(id=customer.id)
                except AttributeError:
                    customer_obj = customer

            items_data = data.get("items", [])
            estimated_total = sum(
                (item["unit_price"] * item["quantity"]) - item.get("discount", 0)
                for item in items_data
            )
            discount = data.get("discount", Decimal("0"))
            if data.get("discount_type") == "percentage":
                discount_amount = estimated_total * (discount / Decimal("100"))
            else:
                discount_amount = discount

            new_balance = customer_obj.outstanding_balance + estimated_total - discount_amount - paid
            if new_balance > customer_obj.credit_limit:
                raise serializers.ValidationError(
                    f"Credit limit exceeded. "
                    f"Limit: {customer_obj.credit_limit}, "
                    f"current balance: {customer_obj.outstanding_balance}"
                )

        return data

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        paid = validated_data.pop("paid", 0)
        validated_data.pop("payment_method", None)

        subtotal = Decimal("0")

        for item_data in items_data:
            product = item_data["product"]
            qty = item_data["quantity"]
            price = item_data["unit_price"]
            item_discount = item_data.get("discount", Decimal("0"))
            line_subtotal = (price * qty) - item_discount
            subtotal += line_subtotal

        discount = validated_data.get("discount", Decimal("0"))
        discount_type = validated_data.get("discount_type", "fixed")

        if discount_type == "percentage":
            discount_amount = subtotal * (discount / Decimal("100"))
        else:
            discount_amount = discount

        taxable = subtotal - discount_amount
        tax_rate = Decimal("0")
        for item_data in items_data:
            product = item_data["product"]
            tax_amount = product.vat_rate or Decimal("0")
            if tax_amount > tax_rate:
                tax_rate = tax_amount

        tax = taxable * (tax_rate / Decimal("100"))
        total = taxable + tax

        sale = Sale.objects.create(
            **validated_data,
            subtotal=subtotal,
            tax=tax,
            total=total,
            paid_amount=paid,
        )

        if sale.customer and paid > 0:
            customer = sale.customer
            customer.outstanding_balance += total - paid
            customer.save()

        for item_data in items_data:
            product = item_data["product"]
            qty = item_data["quantity"]
            price = item_data["unit_price"]
            item_discount = item_data.get("discount", Decimal("0"))
            line_subtotal = (price * qty) - item_discount

            SaleItem.objects.create(
                sale=sale,
                product=product,
                quantity=qty,
                unit_price=price,
                discount=item_discount,
                subtotal=line_subtotal,
            )

        return sale


class SaleRefundSerializer(serializers.Serializer):
    items = serializers.ListField(
        child=serializers.DictField(), required=False
    )
    reason = serializers.CharField(required=True)


class QuotationItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = QuotationItem
        fields = (
            "id", "product", "product_name", "product_sku",
            "quantity", "unit_price", "discount", "subtotal",
        )
        read_only_fields = ("id", "subtotal")


class QuotationListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source="customer.name", read_only=True, default=""
    )
    created_by_name = serializers.CharField(
        source="created_by.username", read_only=True, default=""
    )
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Quotation
        fields = (
            "id", "quote_number", "customer", "customer_name",
            "quote_date", "valid_until", "status",
            "subtotal", "discount", "tax", "total",
            "item_count", "created_by_name",
            "is_active", "created_at",
        )
        read_only_fields = ("id", "quote_date", "created_at")

    def get_item_count(self, obj):
        return obj.items.count()


class QuotationDetailSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(
        source="customer.name", read_only=True, default=""
    )
    created_by_name = serializers.CharField(
        source="created_by.username", read_only=True, default=""
    )
    items = QuotationItemSerializer(many=True, read_only=True)

    class Meta:
        model = Quotation
        fields = (
            "id", "quote_number", "customer", "customer_name",
            "quote_date", "valid_until", "status",
            "subtotal", "discount", "discount_type", "tax", "total",
            "notes", "converted_sale",
            "items", "created_by", "created_by_name",
            "is_active", "created_at", "updated_at",
        )
        read_only_fields = ("id", "quote_date", "created_at", "updated_at")


class QuotationItemCreateSerializer(serializers.Serializer):
    product = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0
    )
    discount = serializers.DecimalField(
        max_digits=12, decimal_places=2, default=0, min_value=0
    )

    def validate_product(self, value):
        try:
            return Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found")


class QuotationCreateSerializer(serializers.ModelSerializer):
    items = QuotationItemCreateSerializer(many=True, min_length=1)

    class Meta:
        model = Quotation
        fields = (
            "quote_number", "customer", "valid_until",
            "discount", "discount_type", "notes", "items",
        )

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        subtotal = Decimal("0")

        for item_data in items_data:
            product = item_data["product"]
            qty = item_data["quantity"]
            price = item_data["unit_price"]
            item_discount = item_data.get("discount", Decimal("0"))
            subtotal += (price * qty) - item_discount

        discount = validated_data.get("discount", Decimal("0"))
        discount_type = validated_data.get("discount_type", "fixed")

        if discount_type == "percentage":
            discount_amount = subtotal * (discount / Decimal("100"))
        else:
            discount_amount = discount

        taxable = subtotal - discount_amount
        tax_rate = Decimal("0")
        for item_data in items_data:
            tax_amount = item_data["product"].vat_rate or Decimal("0")
            if tax_amount > tax_rate:
                tax_rate = tax_amount

        tax = taxable * (tax_rate / Decimal("100"))
        total = taxable + tax

        quotation = Quotation.objects.create(
            **validated_data,
            subtotal=subtotal,
            tax=tax,
            total=total,
        )

        for item_data in items_data:
            product = item_data["product"]
            qty = item_data["quantity"]
            price = item_data["unit_price"]
            item_discount = item_data.get("discount", Decimal("0"))
            line_subtotal = (price * qty) - item_discount

            QuotationItem.objects.create(
                quotation=quotation,
                product=product,
                quantity=qty,
                unit_price=price,
                discount=item_discount,
                subtotal=line_subtotal,
            )

        return quotation
