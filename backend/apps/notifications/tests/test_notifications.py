import pytest
from rest_framework import status
from model_bakery import baker
from django.contrib.auth import get_user_model

User = get_user_model()

pytestmark = pytest.mark.django_db


class TestNotificationAPI:
    def test_list_notifications(self, auth_client, admin_user):
        baker.make("notifications.Notification", user=admin_user, title="Test", _quantity=3)
        resp = auth_client.get("/api/v1/notifications/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] >= 3

    def test_unread_count(self, auth_client, admin_user):
        baker.make("notifications.Notification", user=admin_user, title="Unread", is_read=False, _quantity=2)
        baker.make("notifications.Notification", user=admin_user, title="Read", is_read=True, _quantity=1)
        resp = auth_client.get("/api/v1/notifications/unread_count/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["data"]["unread_count"] == 2

    def test_mark_read(self, auth_client, admin_user):
        n = baker.make("notifications.Notification", user=admin_user, title="Test", is_read=False)
        resp = auth_client.post(f"/api/v1/notifications/{n.id}/mark_read/")
        assert resp.status_code == status.HTTP_200_OK
        n.refresh_from_db()
        assert n.is_read is True

    def test_mark_all_read(self, auth_client, admin_user):
        baker.make("notifications.Notification", user=admin_user, title="Test", is_read=False, _quantity=3)
        resp = auth_client.post("/api/v1/notifications/mark_all_read/")
        assert resp.status_code == status.HTTP_200_OK
