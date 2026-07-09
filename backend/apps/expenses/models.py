from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from core.models import BaseModel


class ExpenseCategory(models.TextChoices):
    RENT = "rent", "Rent"
    TRANSPORT = "transport", "Transport"
    UTILITIES = "utilities", "Utilities"
    SALARIES = "salaries", "Salaries"
    MAINTENANCE = "maintenance", "Maintenance"
    MISCELLANEOUS = "miscellaneous", "Miscellaneous"


class Expense(BaseModel):
    category = models.CharField(max_length=20, choices=ExpenseCategory.choices)
    amount = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0.01)],
    )
    description = models.TextField(blank=True)
    date = models.DateField(db_index=True)
    receipt = models.FileField(upload_to="expenses/", null=True, blank=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_expenses",
    )

    class Meta:
        db_table = "expenses"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.get_category_display()} - {self.amount} ({self.date})"
