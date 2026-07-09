from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from core.models import BaseModel


class AccountType(models.TextChoices):
    ASSET = "asset", "Asset"
    LIABILITY = "liability", "Liability"
    EQUITY = "equity", "Equity"
    REVENUE = "revenue", "Revenue"
    EXPENSE = "expense", "Expense"


class Account(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    account_type = models.CharField(max_length=20, choices=AccountType.choices)
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE,
        null=True, blank=True, related_name="children",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "accounts"
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} - {self.name}"


class JournalEntry(BaseModel):
    entry_number = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField()
    entry_date = models.DateField(db_index=True)
    reference_type = models.CharField(max_length=50, blank=True)
    reference_id = models.CharField(max_length=100, blank=True)
    is_posted = models.BooleanField(default=True)
    posted_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
    )

    class Meta:
        db_table = "journal_entries"
        ordering = ["-entry_date", "-created_at"]

    def __str__(self):
        return f"{self.entry_number} - {self.description}"

    def delete(self, *args, **kwargs):
        if self.is_posted:
            raise Exception("Cannot delete a posted journal entry")
        super().delete(*args, **kwargs)


class JournalLine(models.Model):
    journal_entry = models.ForeignKey(
        JournalEntry, on_delete=models.CASCADE,
        related_name="lines",
    )
    account = models.ForeignKey(
        Account, on_delete=models.CASCADE, related_name="journal_lines",
    )
    description = models.CharField(max_length=255, blank=True)
    debit = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
    )
    credit = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
    )

    class Meta:
        db_table = "journal_lines"

    def __str__(self):
        return f"{self.account.name}: {self.debit}dr / {self.credit}cr"
