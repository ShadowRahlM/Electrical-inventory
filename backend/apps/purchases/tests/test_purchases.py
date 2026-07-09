import pytest
from rest_framework import status
from model_bakery import baker
from datetime import date

pytestmark = pytest.mark.django_db


class TestPurchaseOrderAPI:
    def test_list_orders(self, auth_client, supplier):
        baker.make("purchases.PurchaseOrder", supplier=supplier, order_date=date.today())
        resp = auth_client.get("/api/v1/purchases/orders/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] >= 1

    def test_create_order(self, auth_client, supplier, product):
        data = {
            "order_number": "PO-001",
            "supplier": str(supplier.id),
            "order_date": date.today().isoformat(),
            "items": [
                {"product": str(product.id), "quantity_ordered": 10, "unit_cost": 25},
            ],
        }
        resp = auth_client.post("/api/v1/purchases/orders/", data, format="json")
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["order_number"] == "PO-001"

    def test_receive_items(self, auth_client, supplier, product):
        po = baker.make("purchases.PurchaseOrder", supplier=supplier, order_date=date.today(), status="ordered")
        item = baker.make("purchases.PurchaseItem", purchase_order=po, product=product, quantity_ordered=10, quantity_received=0, unit_cost=25)
        resp = auth_client.post(f"/api/v1/purchases/orders/{po.id}/receive/", {
            "items": [{"id": item.id, "quantity_received": 5}],
        }, format="json")
        assert resp.status_code == status.HTTP_200_OK
        item.refresh_from_db()
        assert item.quantity_received == 5

    def test_cancel_order(self, auth_client, supplier):
        po = baker.make("purchases.PurchaseOrder", supplier=supplier, order_date=date.today(), status="draft")
        resp = auth_client.post(f"/api/v1/purchases/orders/{po.id}/cancel/")
        assert resp.status_code == status.HTTP_200_OK
        po.refresh_from_db()
        assert po.status == "cancelled"

    def test_mark_paid(self, auth_client, supplier):
        po = baker.make("purchases.PurchaseOrder", supplier=supplier, total_amount=1000, paid_amount=0, status="received")
        resp = auth_client.post(f"/api/v1/purchases/orders/{po.id}/mark_paid/", {"amount": 500}, format="json")
        assert resp.status_code == status.HTTP_200_OK
        po.refresh_from_db()
        assert po.paid_amount == 500

    def test_balance_due_property(self):
        po = baker.make("purchases.PurchaseOrder", total_amount=1000, paid_amount=300)
        assert po.balance_due == 700

    def test_is_fully_paid_property(self):
        po = baker.make("purchases.PurchaseOrder", total_amount=1000, paid_amount=1000)
        assert po.is_fully_paid is True
