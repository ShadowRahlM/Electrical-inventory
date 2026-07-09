from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id", "name", "slug", "parent", "description",
            "is_active", "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class CategoryTreeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            "id", "name", "slug", "description",
            "product_count", "children", "is_active",
        )

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        if children:
            return CategoryTreeSerializer(children, many=True).data
        return []

    def get_product_count(self, obj):
        return obj.product_set.filter(is_active=True).count()
