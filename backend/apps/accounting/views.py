from datetime import date
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Account, JournalEntry
from .serializers import (
    AccountSerializer,
    JournalEntrySerializer,
    JournalEntryCreateSerializer,
)
from .services import (
    get_profit_summary,
    get_financial_summary,
    get_revenue,
    get_expenses,
    get_gross_profit,
    get_net_profit,
    get_cash_flow,
    get_stock_value,
    get_customer_debt,
    get_supplier_debt,
)


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.filter(is_active=True)
    serializer_class = AccountSerializer
    permission_classes = (permissions.IsAdminUser,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ("code", "name")
    ordering_fields = ("code", "name", "account_type")
    ordering = ["code"]


class JournalEntryViewSet(viewsets.ModelViewSet):
    queryset = JournalEntry.objects.prefetch_related(
        "lines", "lines__account"
    ).select_related("created_by").all()
    permission_classes = (permissions.IsAdminUser,)
    filter_backends = [
        filters.SearchFilter, filters.OrderingFilter,
    ]
    filterset_fields = {
        "entry_date": ["exact", "gte", "lte"],
        "is_posted": ["exact"],
        "reference_type": ["exact"],
    }
    search_fields = ("entry_number", "description", "reference_type", "reference_id")
    ordering_fields = ("entry_date", "created_at")
    ordering = ["-entry_date"]

    def get_serializer_class(self):
        if self.action == "create":
            return JournalEntryCreateSerializer
        return JournalEntrySerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        if instance.is_posted:
            return Response(
                {"success": False, "message": "Cannot delete a posted entry"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.delete()


class FinancialReportViewSet(viewsets.ViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    @action(detail=False, methods=["get"])
    def profit_summary(self, request):
        start = request.query_params.get("start_date")
        end = request.query_params.get("end_date")
        if start:
            start = date.fromisoformat(start)
        if end:
            end = date.fromisoformat(end)
        data = get_profit_summary(start, end)
        data["period"] = {
            "start": str(start) if start else "all",
            "end": str(end) if end else "all",
        }
        return Response({"success": True, "data": data})

    @action(detail=False, methods=["get"])
    def financial_summary(self, request):
        data = get_financial_summary()
        return Response({"success": True, "data": data})

    @action(detail=False, methods=["get"])
    def revenue(self, request):
        start = request.query_params.get("start_date")
        end = request.query_params.get("end_date")
        if start:
            start = date.fromisoformat(start)
        if end:
            end = date.fromisoformat(end)
        return Response({
            "success": True,
            "data": {"revenue": str(get_revenue(start, end))},
        })

    @action(detail=False, methods=["get"])
    def expenses(self, request):
        start = request.query_params.get("start_date")
        end = request.query_params.get("end_date")
        if start:
            start = date.fromisoformat(start)
        if end:
            end = date.fromisoformat(end)
        return Response({
            "success": True,
            "data": {"expenses": str(get_expenses(start, end))},
        })

    @action(detail=False, methods=["get"])
    def cash_flow(self, request):
        start = request.query_params.get("start_date")
        end = request.query_params.get("end_date")
        if start:
            start = date.fromisoformat(start)
        if end:
            end = date.fromisoformat(end)
        return Response({
            "success": True,
            "data": {"cash_flow": str(get_cash_flow(start, end))},
        })

    @action(detail=False, methods=["get"])
    def balance_sheet(self, request):
        return Response({
            "success": True,
            "data": {
                "stock_value": str(get_stock_value()),
                "customer_debt": str(get_customer_debt()),
                "supplier_debt": str(get_supplier_debt()),
            },
        })
