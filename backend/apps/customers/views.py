from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.filter(is_active=True)
    serializer_class = CustomerSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,
    ]
    filterset_fields = {
        "is_active": ["exact"],
    }
    search_fields = ("name", "phone", "email", "address")
    ordering_fields = ("name", "created_at", "outstanding_balance", "loyalty_points")
    ordering = ["name"]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
