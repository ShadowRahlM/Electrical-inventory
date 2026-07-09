import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.test")

import django
django.setup()

import pytest
from django.contrib.auth import get_user_model
from model_bakery import baker


@pytest.fixture(autouse=True)
def enable_db_access(db):
    pass


@pytest.fixture
def admin_user():
    return baker.make(get_user_model(), is_superuser=True, is_staff=True, role="admin")


@pytest.fixture
def regular_user():
    return baker.make(get_user_model(), role="salesperson")


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient
    return APIClient()


@pytest.fixture
def auth_client(admin_user):
    from rest_framework.test import APIClient
    from rest_framework_simplejwt.tokens import RefreshToken
    client = APIClient()
    token = str(RefreshToken.for_user(admin_user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client


@pytest.fixture
def supplier():
    return baker.make("suppliers.Supplier", company="Test Supplier")


@pytest.fixture
def category():
    return baker.make("categories.Category", name="Test Category")


@pytest.fixture
def product(category, supplier):
    return baker.make(
        "products.Product",
        name="Test Product",
        sku="TST-001",
        category=category,
        supplier=supplier,
        cost_price=50,
        selling_price=100,
        quantity=100,
        min_stock=10,
        reorder_level=5,
    )


@pytest.fixture
def customer():
    return baker.make(
        "customers.Customer",
        name="Test Customer",
        credit_limit=5000,
    )
