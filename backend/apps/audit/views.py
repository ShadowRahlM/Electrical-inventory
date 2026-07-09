from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("user").all()
    serializer_class = AuditLogSerializer
    permission_classes = (permissions.IsAdminUser,)
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = {
        "action": ["exact"],
        "resource": ["exact", "icontains"],
        "resource_id": ["exact"],
        "user": ["exact"],
        "created_at": ["gte", "lte", "date"],
    }
    search_fields = (
        "description",
        "resource",
        "resource_id",
        "user__username",
    )
    ordering_fields = ("created_at", "action", "resource")
    ordering = ["-created_at"]
