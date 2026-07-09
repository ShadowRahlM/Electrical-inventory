import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from model_bakery import baker

User = get_user_model()

pytestmark = pytest.mark.django_db


class TestAuth:
    def test_login_success(self, api_client):
        user = baker.make(User, is_active=True)
        user.set_password("testpass123")
        user.save()
        resp = api_client.post("/api/v1/auth/login/", {"username": user.username, "password": "testpass123"})
        assert resp.status_code == status.HTTP_200_OK
        assert "access" in resp.data
        assert "refresh" in resp.data

    def test_login_invalid_credentials(self, api_client):
        resp = api_client.post("/api/v1/auth/login/", {"username": "nonexistent", "password": "wrong"})
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_token_refresh(self, api_client):
        user = baker.make(User, is_active=True)
        user.set_password("testpass123")
        user.save()
        login_resp = api_client.post("/api/v1/auth/login/", {"username": user.username, "password": "testpass123"})
        refresh = login_resp.data["refresh"]
        resp = api_client.post("/api/v1/auth/refresh/", {"refresh": refresh})
        assert resp.status_code == status.HTTP_200_OK
        assert "access" in resp.data

    def test_authenticated_endpoint(self, auth_client):
        resp = auth_client.get("/api/v1/auth/me/")
        assert resp.status_code == status.HTTP_200_OK
        assert "username" in resp.data

    def test_unauthenticated_rejected(self, api_client):
        resp = api_client.get("/api/v1/auth/me/")
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_profile(self, auth_client):
        resp = auth_client.patch("/api/v1/auth/me/", {"first_name": "Updated"})
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["first_name"] == "Updated"

    def test_change_password(self, auth_client, admin_user):
        admin_user.set_password("oldpass123")
        admin_user.save()
        from rest_framework.test import APIClient
        from rest_framework_simplejwt.tokens import RefreshToken
        client = APIClient()
        token = str(RefreshToken.for_user(admin_user).access_token)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        resp = client.post("/api/v1/auth/change-password/", {
            "old_password": "oldpass123",
            "new_password": "NewPass123!",
            "confirm_password": "NewPass123!",
        })
        assert resp.status_code == status.HTTP_200_OK
