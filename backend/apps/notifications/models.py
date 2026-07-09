from django.db import models
from django.conf import settings
from core.models import BaseModel


class NotificationType(models.TextChoices):
    LOW_STOCK = "low_stock", "Low Stock Alert"
    REORDER = "reorder", "Reorder Level Reached"
    INVOICE_OVERDUE = "invoice_overdue", "Invoice Overdue"
    CUSTOMER_DEBT = "customer_debt", "Customer Debt Overdue"
    SUPPLIER_PAYMENT = "supplier_payment", "Supplier Payment Due"
    DAILY_SALES = "daily_sales", "Daily Sales Completed"
    BACKUP = "backup", "Backup Required"
    SYSTEM = "system", "System Notification"


class Notification(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    notification_type = models.CharField(
        max_length=30, choices=NotificationType.choices
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    link = models.CharField(max_length=500, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.user.username}"

    def mark_read(self):
        from django.utils import timezone
        self.is_read = True
        self.read_at = timezone.now()
        self.save()
