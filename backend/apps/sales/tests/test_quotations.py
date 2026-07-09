import pytest
from rest_framework import status
from model_bakery import baker
from datetime import date, timedelta

pytestmark = pytest.mark.django_db


class TestQuotationAPI:
    def test_list_quotations(self, auth_client, product, customer):
        baker.make("sales.Quotation", customer=customer, valid_until=date.today() + timedelta(days=30))
        resp = auth_client.get("/api/v1/sales/quotations/")
        assert resp.status_code == status.HTTP_200_OK

    def test_create_quotation(self, auth_client, product, customer):
        data = {
            "quote_number": "Q-001",
            "customer": str(customer.id),
            "valid_until": (date.today() + timedelta(days=30)).isoformat(),
            "items": [
                {"product": str(product.id), "quantity": 5, "unit_price": 100},
            ],
        }
        resp = auth_client.post("/api/v1/sales/quotations/", data, format="json")
        assert resp.status_code == status.HTTP_201_CREATED

    def test_mark_sent(self, auth_client, customer):
        q = baker.make("sales.Quotation", customer=customer, status="draft", valid_until=date.today() + timedelta(days=30))
        resp = auth_client.post(f"/api/v1/sales/quotations/{q.id}/mark_sent/")
        assert resp.status_code == status.HTTP_200_OK
        q.refresh_from_db()
        assert q.status == "sent"

    def test_mark_accepted(self, auth_client, customer):
        q = baker.make("sales.Quotation", customer=customer, status="sent", valid_until=date.today() + timedelta(days=30))
        resp = auth_client.post(f"/api/v1/sales/quotations/{q.id}/mark_accepted/")
        assert resp.status_code == status.HTTP_200_OK
        q.refresh_from_db()
        assert q.status == "accepted"

    def test_convert_to_sale(self, auth_client, product, customer):
        q = baker.make("sales.Quotation", customer=customer, status="accepted", valid_until=date.today() + timedelta(days=30))
        baker.make("sales.QuotationItem", quotation=q, product=product, quantity=2, unit_price=100, subtotal=200)
        resp = auth_client.post(f"/api/v1/sales/quotations/{q.id}/convert_to_sale/")
        assert resp.status_code == status.HTTP_200_OK
        q.refresh_from_db()
        assert q.status == "converted"
