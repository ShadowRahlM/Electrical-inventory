from django.contrib import admin
from .models import Expense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("category", "amount", "date", "recorded_by", "is_active")
    list_filter = ("category", "date", "is_active")
    search_fields = ("description",)
    date_hierarchy = "date"
