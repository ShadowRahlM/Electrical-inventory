import pytest
from rest_framework import status
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestStockMovementAPI:
    def test_list_movements(self, auth_client, product):
        baker.make("inventory.StockMovement", product=product, quantity=10, _quantity=3)
        resp = auth_client.get("/api/v1/inventory/movements/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] >= 3

    def test_record_movement_stock_in(self, auth_client, product):
        data = {
            "product_id": str(product.id),
            "movement_type": "stock_in",
            "quantity": 10,
            "reference": "PO-001",
        }
        resp = auth_client.post("/api/v1/inventory/movements/record/", data)
        assert resp.status_code == status.HTTP_201_CREATED

    def test_record_movement_stock_out(self, auth_client, product):
        data = {
            "product_id": str(product.id),
            "movement_type": "stock_out",
            "quantity": 5,
            "reference": "SALE-001",
        }
        resp = auth_client.post("/api/v1/inventory/movements/record/", data)
        assert resp.status_code == status.HTTP_201_CREATED

    def test_record_movement_negative_inventory(self, auth_client, product):
        data = {
            "product_id": str(product.id),
            "movement_type": "stock_out",
            "quantity": 999,
            "reference": "FAIL",
        }
        resp = auth_client.post("/api/v1/inventory/movements/record/", data)
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_movement_updates_quantity(self, auth_client, product):
        initial = product.quantity
        data = {
            "product_id": str(product.id),
            "movement_type": "stock_in",
            "quantity": 10,
        }
        auth_client.post("/api/v1/inventory/movements/record/", data)
        product.refresh_from_db()
        assert product.quantity == initial + 10
