import pytest
from rest_framework import status
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestSaleAPI:
    def test_list_sales(self, auth_client, product, customer):
        sale = baker.make("sales.Sale", customer=customer, total=200, paid_amount=200)
        baker.make("sales.SaleItem", sale=sale, product=product, quantity=2, unit_price=100, subtotal=200)
        resp = auth_client.get("/api/v1/sales/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] >= 1

    def test_pos_create(self, auth_client, product, customer):
        data = {
            "invoice_number": "POS-TEST-001",
            "customer": str(customer.id),
            "items": [
                {"product": str(product.id), "quantity": 2, "unit_price": 100},
            ],
            "paid": 200,
        }
        resp = auth_client.post("/api/v1/sales/pos_create/", data, format="json")
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["success"] is True

    def test_pos_create_deducts_stock(self, auth_client, product, customer):
        initial = product.quantity
        data = {
            "invoice_number": "POS-TEST-002",
            "items": [{"product": str(product.id), "quantity": 5, "unit_price": 100}],
            "paid": 500,
        }
        resp = auth_client.post("/api/v1/sales/pos_create/", data, format="json")
        assert resp.status_code == status.HTTP_201_CREATED
        product.refresh_from_db()
        assert product.quantity == initial - 5

    def test_pos_create_insufficient_stock(self, auth_client, product, customer):
        data = {
            "invoice_number": "POS-TEST-003",
            "items": [{"product": str(product.id), "quantity": 999, "unit_price": 100}],
            "paid": 0,
        }
        resp = auth_client.post("/api/v1/sales/pos_create/", data, format="json")
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_record_payment(self, auth_client, product, customer):
        sale = baker.make("sales.Sale", customer=customer, total=500, paid_amount=200)
        resp = auth_client.post(f"/api/v1/sales/{sale.id}/record_payment/", {"amount": 300}, format="json")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["success"] is True

    def test_refund_full(self, auth_client, product, customer):
        sale = baker.make("sales.Sale", customer=customer, total=200, paid_amount=200)
        baker.make("sales.SaleItem", sale=sale, product=product, quantity=2, unit_price=100, subtotal=200)
        resp = auth_client.post(f"/api/v1/sales/{sale.id}/refund/", {"reason": "Customer return"}, format="json")
        assert resp.status_code == status.HTTP_200_OK

    def test_today_sales(self, auth_client, product, customer):
        baker.make("sales.Sale", customer=customer, total=100)
        resp = auth_client.get("/api/v1/sales/today/")
        assert resp.status_code == status.HTTP_200_OK

    def test_is_fully_paid_property(self):
        sale = baker.make("sales.Sale", total=500, paid_amount=500)
        assert sale.is_fully_paid is True

    def test_balance_due_property(self):
        sale = baker.make("sales.Sale", total=500, paid_amount=200)
        assert sale.balance_due == 300
