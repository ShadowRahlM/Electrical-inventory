from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("user", "action", "resource", "resource_id", "created_at")
    list_filter = ("action", "resource", "created_at")
    search_fields = ("resource", "resource_id", "description", "user__username")
    date_hierarchy = "created_at"
    readonly_fields = (
        "user",
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

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
