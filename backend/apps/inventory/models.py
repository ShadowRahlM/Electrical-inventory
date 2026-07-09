from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from core.models import BaseModel


class StockMovement(models.Model):
    class MovementType(models.TextChoices):
        STOCK_IN = "stock_in", "Stock In"
        STOCK_OUT = "stock_out", "Stock Out"
        TRANSFER = "transfer", "Transfer"
        ADJUSTMENT = "adjustment", "Adjustment"
        DAMAGE = "damage", "Damage"
        THEFT = "theft", "Theft"
        EXPIRED = "expired", "Expired"
        RETURN = "return", "Return"

    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        related_name="stock_movements",
    )
    movement_type = models.CharField(
        max_length=20, choices=MovementType.choices
    )
    quantity = models.IntegerField(validators=[MinValueValidator(0)])
    quantity_change = models.IntegerField(
        help_text="Positive for inbound, negative for outbound"
    )
    balance_before = models.IntegerField()
    balance_after = models.IntegerField()
    reference = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_movements",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "stock_movements"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["product", "movement_type"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.movement_type} {self.quantity} of {self.product.name}"
