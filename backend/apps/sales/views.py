from decimal import Decimal
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone
from .models import Sale, SaleItem, Quotation, QuotationItem
from .serializers import (
    SaleListSerializer,
    SaleDetailSerializer,
    SaleCreateSerializer,
    SaleRefundSerializer,
    QuotationListSerializer,
    QuotationDetailSerializer,
    QuotationCreateSerializer,
)
from apps.inventory.models import StockMovement
from apps.products.models import Product
from core.exceptions import BusinessError


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.filter(is_active=True).prefetch_related(
        "items", "items__product"
    ).select_related("customer", "created_by")
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,
    ]
    filterset_fields = {
        "customer": ["exact", "isnull"],
        "status": ["exact"],
        "sale_date": ["gte", "lte", "exact", "date"],
        "total": ["gte", "lte"],
        "created_by": ["exact"],
    }
    search_fields = (
        "invoice_number", "customer__name",
        "customer__phone", "notes",
    )
    ordering_fields = ("sale_date", "total", "created_at")
    ordering = ["-sale_date"]

    def get_serializer_class(self):
        if self.action == "list":
            return SaleListSerializer
        if self.action == "create":
            return SaleCreateSerializer
        return SaleDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

    @action(detail=False, methods=["post"])
    def pos_create(self, request):
        serializer = SaleCreateSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            sale = serializer.save(created_by=request.user)

            for item_data in serializer.validated_data["items"]:
                product = item_data["product"]
                qty = item_data["quantity"]

                balance_before = product.quantity
                product.quantity -= qty
                product.save()

                StockMovement.objects.create(
                    product=product,
                    movement_type=StockMovement.MovementType.STOCK_OUT,
                    quantity=qty,
                    quantity_change=-qty,
                    balance_before=balance_before,
                    balance_after=product.quantity,
                    reference=sale.invoice_number,
                    notes=f"Sale {sale.invoice_number}",
                    performed_by=request.user,
                )

        return Response(
            {
                "success": True,
                "message": f"Sale {sale.invoice_number} completed",
                "data": SaleDetailSerializer(sale).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def record_payment(self, request, pk=None):
        sale = self.get_object()
        amount = request.data.get("amount")
        if not amount:
            return Response(
                {"success": False, "message": "amount is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        sale.paid_amount += Decimal(str(amount))
        sale.save()

        if sale.customer:
            customer = sale.customer
            customer.outstanding_balance -= Decimal(str(amount))
            customer.save()

        return Response({
            "success": True,
            "message": f"Payment of {amount} recorded",
            "paid_amount": str(sale.paid_amount),
            "balance_due": str(sale.balance_due),
        })

    @action(detail=True, methods=["post"])
    def refund(self, request, pk=None):
        sale = self.get_object()
        if sale.status == Sale.Status.REFUNDED:
            raise BusinessError("Sale is already refunded")

        serializer = SaleRefundSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            refund_items = serializer.validated_data.get("items")
            full_refund = not refund_items

            if full_refund:
                for item in sale.items.all():
                    product = item.product
                    balance_before = product.quantity
                    product.quantity += item.quantity
                    product.save()

                    StockMovement.objects.create(
                        product=product,
                        movement_type=StockMovement.MovementType.RETURN,
                        quantity=item.quantity,
                        quantity_change=item.quantity,
                        balance_before=balance_before,
                        balance_after=product.quantity,
                        reference=sale.invoice_number,
                        notes=f"Full refund: {serializer.validated_data['reason']}",
                        performed_by=request.user,
                    )

                sale.status = Sale.Status.REFUNDED
                sale.save()
                message = f"Sale {sale.invoice_number} fully refunded"
            else:
                for refund_item in refund_items:
                    try:
                        item = sale.items.get(id=refund_item["id"])
                    except SaleItem.DoesNotExist:
                        raise BusinessError(f"Item {refund_item['id']} not found in sale")
                    qty = refund_item.get("quantity", item.quantity)
                    product = item.product
                    balance_before = product.quantity
                    product.quantity += qty
                    product.save()

                    StockMovement.objects.create(
                        product=product,
                        movement_type=StockMovement.MovementType.RETURN,
                        quantity=qty,
                        quantity_change=qty,
                        balance_before=balance_before,
                        balance_after=product.quantity,
                        reference=sale.invoice_number,
                        notes=f"Partial refund: {serializer.validated_data['reason']}",
                        performed_by=request.user,
                    )

                sale.status = Sale.Status.PARTIALLY_REFUNDED
                sale.save()
                message = f"Sale {sale.invoice_number} partially refunded"

        return Response({
            "success": True,
            "message": message,
        })

    @action(detail=False, methods=["get"])
    def today(self, request):
        today = timezone.now().date()
        sales = self.get_queryset().filter(sale_date__date=today)
        page = self.paginate_queryset(sales)
        if page is not None:
            serializer = SaleListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = SaleListSerializer(sales, many=True)
        return Response({"success": True, "data": serializer.data})


class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.filter(is_active=True).prefetch_related(
        "items", "items__product"
    ).select_related("customer", "created_by")
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,
    ]
    filterset_fields = {
        "customer": ["exact", "isnull"],
        "status": ["exact"],
        "quote_date": ["gte", "lte", "exact"],
        "valid_until": ["gte", "lte"],
    }
    search_fields = ("quote_number", "customer__name", "notes")
    ordering_fields = ("quote_date", "valid_until", "total", "created_at")
    ordering = ["-quote_date"]

    def get_serializer_class(self):
        if self.action == "list":
            return QuotationListSerializer
        if self.action == "create":
            return QuotationCreateSerializer
        return QuotationDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

    @action(detail=True, methods=["post"])
    def convert_to_sale(self, request, pk=None):
        quotation = self.get_object()
        if quotation.status == Quotation.Status.CONVERTED:
            raise BusinessError("Quotation already converted to sale")
        if quotation.status == Quotation.Status.EXPIRED:
            raise BusinessError("Cannot convert an expired quotation")
        if quotation.valid_until < timezone.now().date():
            quotation.status = Quotation.Status.EXPIRED
            quotation.save()
            raise BusinessError("Quotation has expired")

        with transaction.atomic():
            from apps.sales.serializers import SaleCreateSerializer
            items_data = []
            total_quantity = 0
            for item in quotation.items.all():
                items_data.append({
                    "product": item.product.id,
                    "quantity": item.quantity,
                    "unit_price": str(item.unit_price),
                    "discount": str(item.discount),
                })
                total_quantity += item.quantity

            if total_quantity == 0:
                raise BusinessError("Quotation has no items")

            for item_data in items_data:
                product = Product.objects.get(id=item_data["product"])
                if product.quantity < item_data["quantity"]:
                    raise BusinessError(
                        f"Insufficient stock for {product.name}. "
                        f"Available: {product.quantity}"
                    )

            from .serializers import SaleCreateSerializer as SC
            sale_data = {
                "invoice_number": f"INV-{quotation.quote_number}"[:50],
                "customer": quotation.customer.id if quotation.customer else None,
                "discount": str(quotation.discount),
                "discount_type": quotation.discount_type,
                "notes": f"From quotation: {quotation.quote_number}",
                "items": items_data,
                "paid": "0",
            }
            sale_serializer = SC(data=sale_data)
            sale_serializer.is_valid(raise_exception=True)
            sale = sale_serializer.save(created_by=request.user)

            for item_data in sale_serializer.validated_data["items"]:
                product = item_data["product"]
                qty = item_data["quantity"]
                balance_before = product.quantity
                product.quantity -= qty
                product.save()

                StockMovement.objects.create(
                    product=product,
                    movement_type=StockMovement.MovementType.STOCK_OUT,
                    quantity=qty,
                    quantity_change=-qty,
                    balance_before=balance_before,
                    balance_after=product.quantity,
                    reference=sale.invoice_number,
                    notes=f"Sale from quotation {quotation.quote_number}",
                    performed_by=request.user,
                )

            quotation.status = Quotation.Status.CONVERTED
            quotation.converted_sale = sale
            quotation.save()

        return Response({
            "success": True,
            "message": f"Quotation {quotation.quote_number} converted to sale {sale.invoice_number}",
            "data": {"sale_id": str(sale.id), "invoice_number": sale.invoice_number},
        })

    @action(detail=True, methods=["post"])
    def mark_sent(self, request, pk=None):
        quotation = self.get_object()
        quotation.status = Quotation.Status.SENT
        quotation.save()
        return Response({"success": True, "message": "Quotation marked as sent"})

    @action(detail=True, methods=["post"])
    def mark_accepted(self, request, pk=None):
        quotation = self.get_object()
        quotation.status = Quotation.Status.ACCEPTED
        quotation.save()
        return Response({"success": True, "message": "Quotation accepted"})
