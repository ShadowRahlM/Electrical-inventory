from rest_framework import serializers
from .models import Expense, ExpenseCategory


class ExpenseSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(
        source="recorded_by.username", read_only=True, default=""
    )
    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )

    class Meta:
        model = Expense
        fields = (
            "id", "category", "category_display", "amount",
            "description", "date", "receipt", "recorded_by",
            "recorded_by_name", "is_active", "created_at", "updated_at",
        )
        read_only_fields = ("id", "recorded_by", "created_at", "updated_at")
