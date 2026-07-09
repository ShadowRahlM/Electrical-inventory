from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = (
            "id",
            "user",
            "user_details",
            "action",
            "resource",
            "resource_id",
            "description",
            "old_value",
            "new_value",
            "ip_address",
            "user_agent",
            "device",
            "created_at",
        )
        read_only_fields = fields

    def get_user_details(self, obj):
        if obj.user:
            return {
                "id": str(obj.user.id),
                "username": obj.user.username,
                "role": obj.user.role,
            }
        return None
