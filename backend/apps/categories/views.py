from rest_framework import viewsets, permissions, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category
from .serializers import CategorySerializer, CategoryTreeSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        "parent": ["exact", "isnull"],
        "is_active": ["exact"],
    }
    search_fields = ("name", "slug", "description")
    ordering_fields = ("name", "created_at")
    ordering = ["name"]

    def perform_destroy(self, instance):
        if instance.children.exists():
            raise serializers.ValidationError(
                "Cannot delete category with subcategories"
            )
        instance.is_active = False
        instance.save()

    @action(detail=False, methods=["get"])
    def tree(self, request):
        root_categories = Category.objects.filter(
            parent__isnull=True, is_active=True
        )
        serializer = CategoryTreeSerializer(root_categories, many=True)
        return Response({"success": True, "data": serializer.data})

    @action(detail=False, methods=["get"])
    def flat(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data})
