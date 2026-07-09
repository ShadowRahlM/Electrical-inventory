from rest_framework import serializers
from .models import Account, JournalEntry, JournalLine


class AccountSerializer(serializers.ModelSerializer):
    account_type_display = serializers.CharField(
        source="get_account_type_display", read_only=True
    )

    class Meta:
        model = Account
        fields = (
            "id", "code", "name", "account_type",
            "account_type_display", "parent", "is_active",
        )


class JournalLineSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source="account.name", read_only=True)
    account_code = serializers.CharField(source="account.code", read_only=True)

    class Meta:
        model = JournalLine
        fields = (
            "id", "account", "account_name", "account_code",
            "description", "debit", "credit",
        )


class JournalEntrySerializer(serializers.ModelSerializer):
    lines = JournalLineSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(
        source="created_by.username", read_only=True, default=""
    )

    class Meta:
        model = JournalEntry
        fields = (
            "id", "entry_number", "description", "entry_date",
            "reference_type", "reference_id",
            "is_posted", "posted_at",
            "lines", "created_by", "created_by_name",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "posted_at", "created_at", "updated_at")


class JournalEntryCreateSerializer(serializers.ModelSerializer):
    lines = JournalLineSerializer(many=True, min_length=2)

    class Meta:
        model = JournalEntry
        fields = ("entry_number", "description", "entry_date",
                  "reference_type", "reference_id", "lines")

    def validate_lines(self, value):
        total_debit = sum(line["debit"] for line in value)
        total_credit = sum(line["credit"] for line in value)
        if total_debit != total_credit:
            raise serializers.ValidationError(
                f"Debits ({total_debit}) must equal credits ({total_credit})"
            )
        return value

    def create(self, validated_data):
        lines_data = validated_data.pop("lines")
        entry = JournalEntry.objects.create(**validated_data)
        for line_data in lines_data:
            JournalLine.objects.create(journal_entry=entry, **line_data)
        return entry
