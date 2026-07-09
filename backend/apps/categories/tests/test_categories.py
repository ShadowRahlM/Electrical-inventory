import pytest
from rest_framework import status
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestCategoryAPI:
    def test_list_categories(self, auth_client, category):
        resp = auth_client.get("/api/v1/categories/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["count"] >= 1

    def test_create_category(self, auth_client):
        data = {"name": "New Category", "slug": "new-category"}
        resp = auth_client.post("/api/v1/categories/", data)
        assert resp.status_code == status.HTTP_201_CREATED

    def test_tree_endpoint(self, auth_client, category):
        resp = auth_client.get("/api/v1/categories/tree/")
        assert resp.status_code == status.HTTP_200_OK
        assert isinstance(resp.data, dict)
        assert "data" in resp.data

    def test_nested_category(self, auth_client, category):
        child = baker.make("categories.Category", name="Child", parent=category)
        resp = auth_client.get("/api/v1/categories/tree/")
        names = [c["name"] for c in resp.data["data"]]
        assert category.name in names
