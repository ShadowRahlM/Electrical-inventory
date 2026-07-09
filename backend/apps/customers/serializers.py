from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = (
            "id", "name", "phone", "email", "address",
            "credit_limit", "outstanding_balance", "available_credit",
            "is_over_credit_limit", "loyalty_points",
            "is_active", "created_at", "updated_at",
        )
        read_only_fields = (
            "id", "outstanding_balance", "available_credit",
            "is_over_credit_limit", "created_at", "updated_at",
        )
