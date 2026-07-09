import pytest
from rest_framework import status
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestPaymentAPI:
    def test_list_payments(self, auth_client):
        baker.make("payments.Payment", amount=100, _quantity=3)
        resp = auth_client.get("/api/v1/payments/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] >= 3

    def test_create_inflow_payment(self, auth_client, customer):
        data = {
            "direction": "inflow",
            "method": "cash",
            "amount": "500.00",
            "customer": str(customer.id),
        }
        resp = auth_client.post("/api/v1/payments/", data)
        assert resp.status_code == status.HTTP_201_CREATED

    def test_create_outflow_payment(self, auth_client, supplier):
        data = {
            "direction": "outflow",
            "method": "bank_transfer",
            "amount": "300.00",
            "supplier": str(supplier.id),
        }
        resp = auth_client.post("/api/v1/payments/", data)
        assert resp.status_code == status.HTTP_201_CREATED

    def test_methods_endpoint(self, auth_client):
        resp = auth_client.get("/api/v1/payments/methods/")
        assert resp.status_code == status.HTTP_200_OK
        assert len(resp.data) > 0

    def test_filter_by_sale(self, auth_client, customer):
        sale = baker.make("sales.Sale", customer=customer, total=100)
        baker.make("payments.Payment", sale=sale, amount=100)
        resp = auth_client.get(f"/api/v1/payments/by_sale/", {"sale_id": sale.id})
        assert resp.status_code == status.HTTP_200_OK
