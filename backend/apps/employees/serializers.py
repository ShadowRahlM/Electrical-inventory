from rest_framework import serializers
from .models import Employee, Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.name", read_only=True)

    class Meta:
        model = Attendance
        fields = (
            "id", "employee", "employee_name",
            "date", "time_in", "time_out",
            "is_present", "notes",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class EmployeeSerializer(serializers.ModelSerializer):
    attendance_today = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = (
            "id", "user", "name", "role", "phone", "email",
            "salary", "hire_date",
            "attendance_today", "is_active",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def get_attendance_today(self, obj):
        from django.utils import timezone
        try:
            att = obj.attendance_records.filter(date=timezone.now().date()).first()
            if att:
                return AttendanceSerializer(att).data
        except Exception:
            pass
        return None
