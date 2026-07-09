from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import BaseModel

class User(AbstractUser):
    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        MANAGER = "manager", "Manager"
        CASHIER = "cashier", "Cashier"
        STORE_KEEPER = "store_keeper", "Store Keeper"
        SALESPERSON = "salesperson", "Salesperson"
        ACCOUNTANT = "accountant", "Accountant"

    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.CASHIER
    )
    phone = models.CharField(max_length=20, blank=True)
    is_online = models.BooleanField(default=False)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
