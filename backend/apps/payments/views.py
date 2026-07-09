from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from .models import Payment, PaymentMethod, PaymentDirection
from .serializers import PaymentSerializer, PaymentCreateSerializer
from core.exceptions import NotFoundError


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.filter(is_active=True).select_related(
        "sale", "purchase_order", "customer", "supplier", "recorded_by"
    )
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,
    ]
    filterset_fields = {
        "sale": ["exact"],
        "purchase_order": ["exact"],
        "customer": ["exact"],
        "supplier": ["exact"],
        "method": ["exact"],
        "direction": ["exact"],
        "payment_date": ["gte", "lte", "exact", "date"],
        "amount": ["gte", "lte"],
    }
    search_fields = ("reference", "notes", "sale__invoice_number")
    ordering_fields = ("payment_date", "amount", "method")
    ordering = ["-payment_date"]

    def get_serializer_class(self):
        if self.action == "create":
            return PaymentCreateSerializer
        return PaymentSerializer

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

    @action(detail=False, methods=["get"])
    def methods(self, request):
        return Response({
            "success": True,
            "data": [{"value": m.value, "label": m.label} for m in PaymentMethod],
        })

    @action(detail=False, methods=["get"])
    def by_sale(self, request):
        sale_id = request.query_params.get("sale_id")
        if not sale_id:
            return Response(
                {"success": False, "message": "sale_id is required"},
                status=400,
            )
        payments = self.get_queryset().filter(sale_id=sale_id)
        serializer = self.get_serializer(payments, many=True)
        return Response({"success": True, "data": serializer.data})
