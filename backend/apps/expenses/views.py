from rest_framework import viewsets, permissions, filters, parsers
from django_filters.rest_framework import DjangoFilterBackend
from .models import Expense
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.filter(is_active=True).select_related("recorded_by")
    serializer_class = ExpenseSerializer
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser)
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,
    ]
    filterset_fields = {
        "category": ["exact"],
        "date": ["exact", "gte", "lte", "year", "month"],
        "amount": ["gte", "lte"],
        "recorded_by": ["exact"],
    }
    search_fields = ("description", "category")
    ordering_fields = ("date", "amount", "category", "created_at")
    ordering = ["-date"]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
