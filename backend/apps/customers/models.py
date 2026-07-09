from django.db import models
from django.core.validators import MinValueValidator
from core.models import BaseModel


class Customer(BaseModel):
    name = models.CharField(max_length=200, db_index=True)
    phone = models.CharField(max_length=50, blank=True, db_index=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    credit_limit = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
    )
    outstanding_balance = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
    )
    loyalty_points = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    class Meta:
        db_table = "customers"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.phone})"

    @property
    def available_credit(self):
        return self.credit_limit - self.outstanding_balance

    @property
    def is_over_credit_limit(self):
        return self.credit_limit > 0 and self.outstanding_balance >= self.credit_limit
