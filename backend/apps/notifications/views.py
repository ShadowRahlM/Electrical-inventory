from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,
    ]
    filterset_fields = {
        "notification_type": ["exact"],
        "is_read": ["exact"],
        "created_at": ["gte", "lte"],
    }
    ordering_fields = ("created_at", "is_read")
    ordering = ["-created_at"]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        return Response(
            {"success": False, "message": "Use server-side notification creation"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            return Response(
                {"success": False, "message": "Not your notification"},
                status=status.HTTP_403_FORBIDDEN,
            )
        instance.is_active = False
        instance.save()

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.mark_read()
        return Response({"success": True, "message": "Notification marked as read"})

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"success": True, "message": "All notifications marked as read"})

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({"success": True, "data": {"unread_count": count}})
