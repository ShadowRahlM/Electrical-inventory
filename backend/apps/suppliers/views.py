from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Supplier
from .serializers import SupplierSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.filter(is_active=True)
    serializer_class = SupplierSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,
    ]
    filterset_fields = {
        "is_active": ["exact"],
    }
    search_fields = ("company", "contact_person", "phone", "email", "tax_number")
    ordering_fields = ("company", "balance", "created_at")
    ordering = ["company"]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
