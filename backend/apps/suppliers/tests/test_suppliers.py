import pytest
from rest_framework import status
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestSupplierAPI:
    def test_list_suppliers(self, auth_client, supplier):
        resp = auth_client.get("/api/v1/suppliers/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] >= 1

    def test_create_supplier(self, auth_client):
        data = {"company": "New Supplier", "phone": "1234567890"}
        resp = auth_client.post("/api/v1/suppliers/", data)
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["company"] == "New Supplier"

    def test_retrieve_supplier(self, auth_client, supplier):
        resp = auth_client.get(f"/api/v1/suppliers/{supplier.id}/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["company"] == supplier.company

    def test_update_supplier(self, auth_client, supplier):
        resp = auth_client.patch(f"/api/v1/suppliers/{supplier.id}/", {"contact_person": "John"})
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["contact_person"] == "John"

    def test_product_count_computed(self, auth_client, supplier, product):
        resp = auth_client.get(f"/api/v1/suppliers/{supplier.id}/")
        assert int(resp.data["product_count"]) >= 1
