from django.contrib import admin
from .models import Employee, Attendance


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "phone", "salary", "hire_date", "is_active")
    list_filter = ("role", "is_active")
    search_fields = ("name", "role", "phone", "email")


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "time_in", "time_out", "is_present")
    list_filter = ("date", "is_present")
    search_fields = ("employee__name",)
    date_hierarchy = "date"
