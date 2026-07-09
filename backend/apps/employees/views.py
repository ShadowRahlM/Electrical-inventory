from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.filter(is_active=True)
    serializer_class = EmployeeSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,
    ]
    filterset_fields = {
        "role": ["exact", "icontains"],
        "hire_date": ["gte", "lte"],
        "is_active": ["exact"],
    }
    search_fields = ("name", "role", "phone", "email")
    ordering_fields = ("name", "role", "salary", "hire_date")
    ordering = ["name"]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related("employee").all()
    serializer_class = AttendanceSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter,
    ]
    filterset_fields = {
        "employee": ["exact"],
        "date": ["exact", "gte", "lte", "year", "month"],
        "is_present": ["exact"],
    }
    ordering_fields = ("date", "employee")
    ordering = ["-date"]

    @action(detail=False, methods=["post"])
    def clock_in(self, request):
        employee_id = request.data.get("employee_id")
        if not employee_id:
            return Response(
                {"success": False, "message": "employee_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        today = timezone.now().date()
        now = timezone.now().time()
        att, created = Attendance.objects.get_or_create(
            employee_id=employee_id,
            date=today,
            defaults={"time_in": now, "is_present": True},
        )
        if not created:
            if att.time_in:
                return Response(
                    {"success": False, "message": "Already clocked in today"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            att.time_in = now
            att.is_present = True
            att.save()
        return Response({"success": True, "message": "Clocked in", "data": AttendanceSerializer(att).data})

    @action(detail=False, methods=["post"])
    def clock_out(self, request):
        employee_id = request.data.get("employee_id")
        if not employee_id:
            return Response(
                {"success": False, "message": "employee_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        today = timezone.now().date()
        try:
            att = Attendance.objects.get(employee_id=employee_id, date=today)
            att.time_out = timezone.now().time()
            att.save()
            return Response({"success": True, "message": "Clocked out", "data": AttendanceSerializer(att).data})
        except Attendance.DoesNotExist:
            return Response(
                {"success": False, "message": "No clock-in record for today"},
                status=status.HTTP_400_BAD_REQUEST,
            )
