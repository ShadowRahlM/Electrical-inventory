import csv
import io
from rest_framework import viewsets, permissions, filters, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from .models import Product
from .serializers import (
    ProductSerializer,
    ProductBulkImportSerializer,
    ProductExportSerializer,
)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related(
        "category", "supplier"
    )
    serializer_class = ProductSerializer
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser)
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,
    ]
    filterset_fields = {
        "category": ["exact"],
        "supplier": ["exact", "isnull"],
        "status": ["exact"],
        "brand": ["exact", "icontains"],
        "quantity": ["gte", "lte", "exact"],
        "is_active": ["exact"],
    }
    search_fields = (
        "name", "sku", "barcode", "brand", "description",
    )
    ordering_fields = (
        "name", "sku", "selling_price", "cost_price",
        "quantity", "created_at", "brand",
    )
    ordering = ["name"]

    @action(detail=False, methods=["get"])
    def low_stock(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        low = [p for p in queryset if p.is_low_stock]
        serializer = self.get_serializer(low, many=True)
        return Response({"success": True, "count": len(low), "data": serializer.data})

    @action(detail=False, methods=["get"])
    def out_of_stock(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        out = [p for p in queryset if p.is_out_of_stock]
        serializer = self.get_serializer(out, many=True)
        return Response({"success": True, "count": len(out), "data": serializer.data})

    @action(detail=False, methods=["get"])
    def needs_reorder(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        reorder = [p for p in queryset if p.needs_reorder]
        serializer = self.get_serializer(reorder, many=True)
        return Response({"success": True, "count": len(reorder), "data": serializer.data})

    @action(detail=False, methods=["post"])
    def bulk_import(self, request):
        serializer = ProductBulkImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        results = {"created": 0, "updated": 0, "errors": []}
        for item in serializer.validated_data["products"]:
            try:
                obj, created = Product.objects.update_or_create(
                    sku=item["sku"],
                    defaults=item,
                )
                if created:
                    results["created"] += 1
                else:
                    results["updated"] += 1
            except Exception as e:
                results["errors"].append(
                    {"sku": item.get("sku", ""), "error": str(e)}
                )
        return Response({"success": True, "data": results})

    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = ProductExportSerializer(queryset, many=True)
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=products.csv"
        writer = csv.writer(response)
        if serializer.data:
            writer.writerow(serializer.data[0].keys())
            for row in serializer.data:
                writer.writerow(row.values())
        return response

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
