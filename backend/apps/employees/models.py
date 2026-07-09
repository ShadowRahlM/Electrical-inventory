from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from core.models import BaseModel


class Employee(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="employee_profile",
        null=True, blank=True,
    )
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=100)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    salary = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
    )
    hire_date = models.DateField(db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "employees"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.role})"


class Attendance(BaseModel):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="attendance_records"
    )
    date = models.DateField(db_index=True)
    time_in = models.TimeField(null=True, blank=True)
    time_out = models.TimeField(null=True, blank=True)
    is_present = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "attendance"
        ordering = ["-date"]
        unique_together = ["employee", "date"]

    def __str__(self):
        return f"{self.employee.name} - {self.date}"
