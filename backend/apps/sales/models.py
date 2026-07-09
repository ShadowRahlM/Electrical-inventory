from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from core.models import BaseModel


class Sale(BaseModel):
    class Status(models.TextChoices):
        COMPLETED = "completed", "Completed"
        REFUNDED = "refunded", "Refunded"
        PARTIALLY_REFUNDED = "partially_refunded", "Partially Refunded"

    invoice_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(
        "customers.Customer",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales",
    )
    sale_date = models.DateTimeField(auto_now_add=True, db_index=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.COMPLETED
    )
    subtotal = models.DecimalField(
        max_digits=14, decimal_places=2, validators=[MinValueValidator(0)]
    )
    discount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
    )
    discount_type = models.CharField(
        max_length=10, choices=[("percentage", "Percentage"), ("fixed", "Fixed")],
        default="fixed",
    )
    tax = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
    )
    total = models.DecimalField(
        max_digits=14, decimal_places=2, validators=[MinValueValidator(0)]
    )
    paid_amount = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales",
    )

    class Meta:
        db_table = "sales"
        ordering = ["-sale_date"]

    def __str__(self):
        return f"{self.invoice_number} - {self.total}"

    @property
    def balance_due(self):
        return self.total - self.paid_amount

    @property
    def is_fully_paid(self):
        return self.paid_amount >= self.total


class SaleItem(models.Model):
    sale = models.ForeignKey(
        Sale, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        related_name="sale_items",
    )
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )
    discount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
    )
    subtotal = models.DecimalField(
        max_digits=14, decimal_places=2, validators=[MinValueValidator(0)]
    )

    class Meta:
        db_table = "sale_items"

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


class Quotation(BaseModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SENT = "sent", "Sent"
        ACCEPTED = "accepted", "Accepted"
        EXPIRED = "expired", "Expired"
        CONVERTED = "converted", "Converted to Sale"

    quote_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey(
        "customers.Customer",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="quotations",
    )
    quote_date = models.DateField(auto_now_add=True, db_index=True)
    valid_until = models.DateField()
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT
    )
    subtotal = models.DecimalField(
        max_digits=14, decimal_places=2, validators=[MinValueValidator(0)]
    )
    discount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
    )
    discount_type = models.CharField(
        max_length=10, choices=[("percentage", "Percentage"), ("fixed", "Fixed")],
        default="fixed",
    )
    tax = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
    )
    total = models.DecimalField(
        max_digits=14, decimal_places=2, validators=[MinValueValidator(0)]
    )
    notes = models.TextField(blank=True)
    converted_sale = models.ForeignKey(
        Sale, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="source_quotations",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="quotations",
    )

    class Meta:
        db_table = "quotations"
        ordering = ["-quote_date"]

    def __str__(self):
        return f"{self.quote_number} - {self.total}"


class QuotationItem(models.Model):
    quotation = models.ForeignKey(
        Quotation, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        related_name="quotation_items",
    )
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )
    discount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
    )
    subtotal = models.DecimalField(
        max_digits=14, decimal_places=2, validators=[MinValueValidator(0)]
    )

    class Meta:
        db_table = "quotation_items"

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
