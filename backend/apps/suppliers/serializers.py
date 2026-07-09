from rest_framework import serializers
from .models import Supplier


class SupplierSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = (
            "id", "company", "contact_person", "phone", "email",
            "address", "tax_number", "balance", "product_count",
            "is_active", "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()
