import pytest
from rest_framework import status
from rest_framework.test import APIClient
from model_bakery import baker
from apps.accounts.models import User

pytestmark = pytest.mark.django_db


class TestSystemSettingsAPI:
    def test_get_settings_returns_defaults(self, auth_client):
        resp = auth_client.get("/api/v1/settings/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["shop_name"] == "My Shop"
        assert resp.data["currency"] == "KES"
        assert resp.data["tax_rate"] == "16.00"
        assert resp.data["low_stock_threshold"] == 10
        assert resp.data["enable_credit_sales"] is True
        assert resp.data["low_stock_alerts"] is True

    def test_update_settings(self, auth_client):
        resp = auth_client.put("/api/v1/settings/", {
            "shop_name": "Updated Shop",
            "currency": "USD",
            "tax_rate": "10.00",
            "low_stock_threshold": 20,
            "enable_credit_sales": False,
            "low_stock_alerts": False,
            "invoice_prefix": "INV-2024-",
            "default_credit_limit": "10000.00",
            "allow_negative_inventory": True,
            "shop_address": "123 Main St",
            "shop_phone": "+254700000000",
            "shop_email": "shop@example.com",
            "tax_name": "GST",
            "timezone": "Africa/Nairobi",
            "reorder_level": 8,
            "receipt_footer": "Thank you!",
        })
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["shop_name"] == "Updated Shop"
        assert resp.data["currency"] == "USD"
        assert resp.data["tax_rate"] == "10.00"
        assert resp.data["low_stock_threshold"] == 20
        assert resp.data["enable_credit_sales"] is False
        assert resp.data["invoice_prefix"] == "INV-2024-"
        assert resp.data["default_credit_limit"] == "10000.00"

    def test_partial_update_settings(self, auth_client):
        resp = auth_client.patch("/api/v1/settings/", {
            "shop_name": "Partially Updated",
        })
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["shop_name"] == "Partially Updated"
        assert resp.data["currency"] == "KES"

    def test_unauthenticated_rejected(self):
        client = APIClient()
        resp = client.get("/api/v1/settings/")
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_validates_types(self, auth_client):
        resp = auth_client.put("/api/v1/settings/", {
            "low_stock_threshold": "not-a-number",
        })
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_settings_persist_across_requests(self, auth_client):
        auth_client.patch("/api/v1/settings/", {"shop_name": "Persisted Shop"})
        resp = auth_client.get("/api/v1/settings/")
        assert resp.data["shop_name"] == "Persisted Shop"
