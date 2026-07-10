from rest_framework import serializers
from .models import SystemSettings


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = (
            "id",
            "shop_name", "shop_address", "shop_phone", "shop_email",
            "currency", "tax_rate", "tax_name", "timezone",
            "low_stock_threshold", "reorder_level", "allow_negative_inventory",
            "invoice_prefix", "enable_credit_sales", "default_credit_limit",
            "receipt_footer",
            "low_stock_alerts",
            "updated_at", "updated_by",
        )
        read_only_fields = ("id", "updated_at", "updated_by")
