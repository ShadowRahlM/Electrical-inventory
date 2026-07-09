import pytest
from rest_framework import status
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestCustomerAPI:
    def test_list_customers(self, auth_client, customer):
        resp = auth_client.get("/api/v1/customers/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] >= 1

    def test_create_customer(self, auth_client):
        data = {"name": "New Customer", "phone": "1234567890", "credit_limit": "1000"}
        resp = auth_client.post("/api/v1/customers/", data)
        assert resp.status_code == status.HTTP_201_CREATED
        assert resp.data["credit_limit"] == "1000.00"

    def test_retrieve_customer(self, auth_client, customer):
        resp = auth_client.get(f"/api/v1/customers/{customer.id}/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["name"] == customer.name

    def test_update_customer(self, auth_client, customer):
        resp = auth_client.patch(f"/api/v1/customers/{customer.id}/", {"phone": "0987654321"})
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["phone"] == "0987654321"

    def test_computed_available_credit(self, auth_client, customer):
        resp = auth_client.get(f"/api/v1/customers/{customer.id}/")
        expected = float(customer.credit_limit) - float(customer.outstanding_balance)
        assert float(resp.data["available_credit"]) == expected

    def test_search_customer(self, auth_client, customer):
        resp = auth_client.get("/api/v1/customers/", {"search": customer.name[:3]})
        assert resp.data["count"] >= 1
