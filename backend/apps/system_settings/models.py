from django.db import models
from django.conf import settings


class SystemSettings(models.Model):
    shop_name = models.CharField(max_length=200, default="My Shop")
    shop_address = models.TextField(blank=True, default="")
    shop_phone = models.CharField(max_length=50, blank=True, default="")
    shop_email = models.EmailField(blank=True, default="")
    currency = models.CharField(max_length=10, default="KES")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=16.00)
    tax_name = models.CharField(max_length=50, default="VAT")
    timezone = models.CharField(max_length=50, default="Africa/Nairobi")

    low_stock_threshold = models.IntegerField(default=10)
    reorder_level = models.IntegerField(default=5)
    allow_negative_inventory = models.BooleanField(default=False)

    invoice_prefix = models.CharField(max_length=10, default="INV-")
    enable_credit_sales = models.BooleanField(default=True)
    default_credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=5000.00)
    receipt_footer = models.TextField(blank=True, default="")

    low_stock_alerts = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = "System Settings"
        verbose_name_plural = "System Settings"
        db_table = "system_settings"

    def __str__(self):
        return "System Settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
