from django.contrib import admin
from .models import Account, JournalEntry, JournalLine


class JournalLineInline(admin.TabularInline):
    model = JournalLine
    extra = 2


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "account_type", "parent", "is_active")
    list_filter = ("account_type", "is_active")
    search_fields = ("code", "name")


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ("entry_number", "description", "entry_date", "is_posted", "created_by")
    list_filter = ("is_posted", "entry_date")
    search_fields = ("entry_number", "description")
    date_hierarchy = "entry_date"
    inlines = [JournalLineInline]
    readonly_fields = ("posted_at",)

    def has_delete_permission(self, request, obj=None):
        if obj and obj.is_posted:
            return False
        return True
