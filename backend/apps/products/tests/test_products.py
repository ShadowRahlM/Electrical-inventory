import pytest
from rest_framework import status
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestProductAPI:
    def test_list_products(self, auth_client, product):
        resp = auth_client.get("/api/v1/products/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] >= 1

    def test_create_product(self, auth_client, category, supplier):
        data = {
            "sku": "NEW-001",
            "name": "New Product",
            "cost_price": "25.00",
            "selling_price": "50.00",
            "category": str(category.id),
            "supplier": str(supplier.id),
            "quantity": 10,
            "unit": "pcs",
        }
        resp = auth_client.post("/api/v1/products/", data)
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["sku"] == "NEW-001"

    def test_retrieve_product(self, auth_client, product):
        resp = auth_client.get(f"/api/v1/products/{product.id}/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["name"] == product.name

    def test_update_product(self, auth_client, product):
        resp = auth_client.patch(f"/api/v1/products/{product.id}/", {"name": "Updated Product"})
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["name"] == "Updated Product"

    def test_delete_product(self, auth_client, product):
        resp = auth_client.delete(f"/api/v1/products/{product.id}/")
        assert resp.status_code == status.HTTP_204_NO_CONTENT

    def test_search_products(self, auth_client, product):
        resp = auth_client.get("/api/v1/products/", {"search": product.name[:5]})
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] >= 1

    def test_low_stock_endpoint(self, auth_client, product):
        resp = auth_client.get("/api/v1/products/low_stock/")
        assert resp.status_code == status.HTTP_200_OK

    def test_out_of_stock_endpoint(self, auth_client, product):
        resp = auth_client.get("/api/v1/products/out_of_stock/")
        assert resp.status_code == status.HTTP_200_OK

    def test_reorder_endpoint(self, auth_client, product):
        resp = auth_client.get("/api/v1/products/needs_reorder/")
        assert resp.status_code == status.HTTP_200_OK

    def test_is_low_stock_property(self, product):
        product.quantity = 5
        product.min_stock = 10
        assert product.is_low_stock is True

    def test_is_out_of_stock_property(self, product):
        product.quantity = 0
        assert product.is_out_of_stock is True

    def test_needs_reorder_property(self, product):
        product.quantity = 3
        product.reorder_level = 5
        assert product.needs_reorder is True

    def test_margin_property(self, product):
        product.cost_price = 50
        product.selling_price = 100
        assert product.margin == 100.0
