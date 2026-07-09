from django.db import models
from core.models import BaseModel


class Supplier(BaseModel):
    company = models.CharField(max_length=200, db_index=True)
    contact_person = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    tax_number = models.CharField(max_length=100, blank=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        db_table = "suppliers"
        ordering = ["company"]

    def __str__(self):
        return self.company
