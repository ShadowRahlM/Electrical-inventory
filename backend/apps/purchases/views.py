from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from .models import PurchaseOrder, PurchaseItem, PurchaseReturn
from .serializers import (
    PurchaseOrderListSerializer,
    PurchaseOrderDetailSerializer,
    PurchaseOrderCreateSerializer,
    ReceiveItemsSerializer,
    PurchaseReturnSerializer,
)
from apps.inventory.models import StockMovement
from core.exceptions import BusinessError, NotFoundError
from decimal import Decimal


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.filter(is_active=True).prefetch_related(
        "items", "items__product"
    ).select_related("supplier", "created_by")
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,
    ]
    filterset_fields = {
        "supplier": ["exact"],
        "status": ["exact"],
        "order_date": ["gte", "lte", "exact", "year", "month"],
        "is_active": ["exact"],
    }
    search_fields = ("order_number", "supplier__company", "notes")
    ordering_fields = ("order_date", "total_amount", "status", "created_at")
    ordering = ["-order_date"]

    def get_serializer_class(self):
        if self.action == "list":
            return PurchaseOrderListSerializer
        if self.action == "create":
            return PurchaseOrderCreateSerializer
        return PurchaseOrderDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        if instance.status in ("received", "partially_received"):
            raise BusinessError(
                "Cannot delete a purchase that has been received"
            )
        instance.is_active = False
        instance.save()

    @action(detail=True, methods=["post"])
    def receive(self, request, pk=None):
        purchase = self.get_object()
        if purchase.status in (PurchaseOrder.Status.RECEIVED, PurchaseOrder.Status.CANCELLED):
            raise BusinessError(
                f"Cannot receive a purchase with status '{purchase.status}'"
            )

        serializer = ReceiveItemsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            all_received = True
            for item_data in serializer.validated_data["items"]:
                try:
                    item = purchase.items.get(id=item_data["id"])
                except PurchaseItem.DoesNotExist:
                    raise NotFoundError(f"Item {item_data['id']} not found")

                qty = int(item_data["quantity_received"])
                if qty <= 0:
                    raise BusinessError("Quantity must be positive")
                if item.quantity_received + qty > item.quantity_ordered:
                    raise BusinessError(
                        f"Cannot receive {qty} of {item.product.name}. "
                        f"Ordered: {item.quantity_ordered}, "
                        f"already received: {item.quantity_received}"
                    )

                item.quantity_received += qty
                item.save()

                product = item.product
                balance_before = product.quantity
                product.quantity += qty
                product.save()

                StockMovement.objects.create(
                    product=product,
                    movement_type=StockMovement.MovementType.STOCK_IN,
                    quantity=qty,
                    quantity_change=qty,
                    balance_before=balance_before,
                    balance_after=product.quantity,
                    reference=purchase.order_number,
                    notes=f"Purchase order received",
                    performed_by=request.user,
                )

                if item.quantity_pending > 0:
                    all_received = False

            purchase.status = (
                PurchaseOrder.Status.RECEIVED
                if all_received
                else PurchaseOrder.Status.PARTIALLY_RECEIVED
            )
            purchase.save()

        return Response({
            "success": True,
            "message": f"Purchase {purchase.order_number} partially received"
            if not all_received
            else f"Purchase {purchase.order_number} fully received",
            "status": purchase.status,
        })

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        purchase = self.get_object()
        if purchase.status == PurchaseOrder.Status.CANCELLED:
            raise BusinessError("Purchase is already cancelled")
        if purchase.status in (PurchaseOrder.Status.RECEIVED,):
            raise BusinessError("Cannot cancel a fully received purchase")

        purchase.status = PurchaseOrder.Status.CANCELLED
        purchase.save()
        return Response({
            "success": True,
            "message": f"Purchase {purchase.order_number} cancelled",
        })

    @action(detail=True, methods=["post"])
    def mark_paid(self, request, pk=None):
        purchase = self.get_object()
        amount = request.data.get("amount")
        if not amount:
            return Response(
                {"success": False, "message": "amount is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        purchase.paid_amount += Decimal(str(amount))
        purchase.save()
        return Response({
            "success": True,
            "message": f"Payment of {amount} recorded",
            "paid_amount": str(purchase.paid_amount),
            "balance_due": str(purchase.balance_due),
        })


class PurchaseReturnViewSet(viewsets.ModelViewSet):
    queryset = PurchaseReturn.objects.filter(is_active=True).select_related(
        "purchase_order", "purchase_order__supplier", "created_by"
    )
    serializer_class = PurchaseReturnSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,
    ]
    filterset_fields = {
        "purchase_order": ["exact"],
        "return_date": ["gte", "lte"],
    }
    search_fields = ("reason", "purchase_order__order_number")
    ordering_fields = ("return_date", "total_amount")
    ordering = ["-return_date"]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
