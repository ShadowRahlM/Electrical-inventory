from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from .models import StockMovement
from .serializers import StockMovementSerializer, RecordMovementSerializer
from core.exceptions import BusinessError


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockMovement.objects.select_related(
        "product", "performed_by"
    ).all()
    serializer_class = StockMovementSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,
    ]
    filterset_fields = {
        "product": ["exact"],
        "movement_type": ["exact"],
        "performed_by": ["exact"],
        "created_at": ["gte", "lte", "date"],
    }
    search_fields = ("reference", "notes", "product__name", "product__sku")
    ordering_fields = ("created_at", "movement_type", "quantity")
    ordering = ["-created_at"]

    @action(detail=False, methods=["post"])
    def record(self, request):
        serializer = RecordMovementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data["product"]
        qty = serializer.validated_data["quantity"]
        movement_type = serializer.validated_data["movement_type"]

        is_inbound = movement_type in (
            StockMovement.MovementType.STOCK_IN,
            StockMovement.MovementType.RETURN,
        )
        quantity_change = qty if is_inbound else -qty
        balance_before = product.quantity
        balance_after = balance_before + quantity_change

        if balance_after < 0:
            raise BusinessError(
                f"Cannot perform {movement_type}. "
                f"Stock would become negative ({balance_after})"
            )

        with transaction.atomic():
            product.quantity = balance_after
            product.save()

            StockMovement.objects.create(
                product=product,
                movement_type=movement_type,
                quantity=qty,
                quantity_change=quantity_change,
                balance_before=balance_before,
                balance_after=balance_after,
                reference=serializer.validated_data.get("reference", ""),
                notes=serializer.validated_data.get("notes", ""),
                performed_by=request.user,
            )

        return Response(
            {
                "success": True,
                "message": f"{movement_type} recorded",
                "data": {
                    "product_id": str(product.id),
                    "product_name": product.name,
                    "movement_type": movement_type,
                    "quantity": qty,
                    "balance_before": balance_before,
                    "balance_after": balance_after,
                },
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"])
    def history(self, request):
        product_id = request.query_params.get("product_id")
        if not product_id:
            return Response(
                {"success": False, "message": "product_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        queryset = self.get_queryset().filter(product_id=product_id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data})
