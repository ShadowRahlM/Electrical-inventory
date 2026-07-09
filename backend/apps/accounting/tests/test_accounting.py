import pytest
from rest_framework import status
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestAccountAPI:
    def test_list_accounts(self, auth_client):
        baker.make("accounting.Account", code="1000", name="Cash", account_type="asset")
        resp = auth_client.get("/api/v1/accounting/accounts/")
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.data) >= 1

    def test_create_account(self, auth_client):
        data = {"code": "2000", "name": "Accounts Payable", "account_type": "liability"}
        resp = auth_client.post("/api/v1/accounting/accounts/", data)
        assert resp.status_code == status.HTTP_201_CREATED


class TestJournalEntryAPI:
    def test_create_journal_entry(self, auth_client):
        acc1 = baker.make("accounting.Account", code="1000", name="Cash", account_type="asset")
        acc2 = baker.make("accounting.Account", code="4000", name="Revenue", account_type="revenue")
        data = {
            "entry_number": "JE-001",
            "description": "Test entry",
            "entry_date": "2024-01-15",
            "lines": [
                {"account": acc1.id, "debit": "1000.00", "credit": "0.00", "description": "Debit"},
                {"account": acc2.id, "debit": "0.00", "credit": "1000.00", "description": "Credit"},
            ],
        }
        resp = auth_client.post("/api/v1/accounting/journal/", data, format="json")
        assert resp.status_code == status.HTTP_201_CREATED

    def test_unbalanced_entry_rejected(self, auth_client):
        acc1 = baker.make("accounting.Account", code="1000", name="Cash", account_type="asset")
        acc2 = baker.make("accounting.Account", code="4000", name="Revenue", account_type="revenue")
        data = {
            "entry_number": "JE-002",
            "description": "Unbalanced",
            "entry_date": "2024-01-15",
            "lines": [
                {"account": acc1.id, "debit": "1000.00", "credit": "0.00"},
                {"account": acc2.id, "debit": "0.00", "credit": "500.00"},
            ],
        }
        resp = auth_client.post("/api/v1/accounting/journal/", data, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_list_journal_entries(self, auth_client):
        baker.make("accounting.JournalEntry", entry_number="JE-100", description="Test")
        resp = auth_client.get("/api/v1/accounting/journal/")
        assert resp.status_code == status.HTTP_200_OK


class TestFinancialReports:
    def test_profit_summary(self, auth_client):
        resp = auth_client.get("/api/v1/accounting/reports/profit_summary/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["success"] is True

    def test_financial_summary(self, auth_client):
        resp = auth_client.get("/api/v1/accounting/reports/financial_summary/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["success"] is True

    def test_revenue(self, auth_client):
        resp = auth_client.get("/api/v1/accounting/reports/revenue/")
        assert resp.status_code == status.HTTP_200_OK

    def test_balance_sheet(self, auth_client):
        resp = auth_client.get("/api/v1/accounting/reports/balance_sheet/")
        assert resp.status_code == status.HTTP_200_OK
