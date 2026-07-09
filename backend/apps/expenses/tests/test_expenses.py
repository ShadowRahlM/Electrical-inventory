import pytest
from rest_framework import status
from model_bakery import baker
from datetime import date

pytestmark = pytest.mark.django_db


class TestExpenseAPI:
    def test_list_expenses(self, auth_client):
        baker.make("expenses.Expense", amount=100, date=date.today(), _quantity=3)
        resp = auth_client.get("/api/v1/expenses/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] >= 3

    def test_create_expense(self, auth_client):
        data = {
            "category": "rent",
            "amount": "1500.00",
            "description": "Monthly rent",
            "date": date.today().isoformat(),
        }
        resp = auth_client.post("/api/v1/expenses/", data)
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["category"] == "rent"

    def test_filter_by_category(self, auth_client):
        baker.make("expenses.Expense", category="utilities", amount=200, date=date.today())
        resp = auth_client.get("/api/v1/expenses/", {"category": "utilities"})
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] >= 1

    def test_filter_by_date_range(self, auth_client):
        baker.make("expenses.Expense", amount=100, date=date.today())
        resp = auth_client.get("/api/v1/expenses/", {"date__gte": date.today().isoformat()})
        assert resp.status_code == status.HTTP_200_OK
