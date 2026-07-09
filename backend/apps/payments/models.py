from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from core.models import BaseModel


class PaymentMethod(models.TextChoices):
    CASH = "cash", "Cash"
    MOBILE_MONEY = "mobile_money", "Mobile Money"
    BANK_TRANSFER = "bank_transfer", "Bank Transfer"
    CHEQUE = "cheque", "Cheque"
    CARD = "card", "Card"


class PaymentDirection(models.TextChoices):
    INFLOW = "inflow", "Inflow"
    OUTFLOW = "outflow", "Outflow"


class Payment(BaseModel):
    sale = models.ForeignKey(
        "sales.Sale",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )
    purchase_order = models.ForeignKey(
        "purchases.PurchaseOrder",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )
    customer = models.ForeignKey(
        "customers.Customer",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )
    supplier = models.ForeignKey(
        "suppliers.Supplier",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )
    direction = models.CharField(
        max_length=10, choices=PaymentDirection.choices,
        default=PaymentDirection.INFLOW,
    )
    method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    amount = models.DecimalField(
        max_digits=14, decimal_places=2,
        validators=[MinValueValidator(0.01)],
    )
    reference = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    payment_date = models.DateTimeField(auto_now_add=True, db_index=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_payments",
    )

    class Meta:
        db_table = "payments"
        ordering = ["-payment_date"]
        indexes = [
            models.Index(fields=["sale", "method"]),
            models.Index(fields=["purchase_order", "method"]),
        ]

    def __str__(self):
        return f"{self.get_method_display()} {self.amount} ({self.get_direction_display()})"
