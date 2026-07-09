import pytest
from rest_framework import status
from model_bakery import baker
from datetime import date

pytestmark = pytest.mark.django_db


class TestReportsAPI:
    def test_daily_sales(self, auth_client, product, customer):
        sale = baker.make("sales.Sale", customer=customer, total=200, sale_date=date.today())
        baker.make("sales.SaleItem", sale=sale, product=product, quantity=2, unit_price=100, subtotal=200)
        resp = auth_client.get("/api/v1/reports/daily_sales/")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["success"] is True

    def test_monthly_sales(self, auth_client):
        resp = auth_client.get("/api/v1/reports/monthly_sales/")
        assert resp.status_code == status.HTTP_200_OK

    def test_yearly_sales(self, auth_client):
        resp = auth_client.get("/api/v1/reports/yearly_sales/")
        assert resp.status_code == status.HTTP_200_OK

    def test_sales_by_product(self, auth_client, product, customer):
        sale = baker.make("sales.Sale", customer=customer, total=100)
        baker.make("sales.SaleItem", sale=sale, product=product, quantity=1, unit_price=100, subtotal=100)
        resp = auth_client.get("/api/v1/reports/sales_by_product/")
        assert resp.status_code == status.HTTP_200_OK

    def test_sales_by_category(self, auth_client, product, customer, category):
        product.category = category
        product.save()
        sale = baker.make("sales.Sale", customer=customer, total=100)
        baker.make("sales.SaleItem", sale=sale, product=product, quantity=1, unit_price=100, subtotal=100)
        resp = auth_client.get("/api/v1/reports/sales_by_category/")
        assert resp.status_code == status.HTTP_200_OK

    def test_profit_report(self, auth_client):
        resp = auth_client.get("/api/v1/reports/profit/")
        assert resp.status_code == status.HTTP_200_OK

    def test_purchases_report(self, auth_client, supplier):
        baker.make("purchases.PurchaseOrder", supplier=supplier, total_amount=500, order_date=date.today())
        resp = auth_client.get("/api/v1/reports/purchases/")
        assert resp.status_code == status.HTTP_200_OK

    def test_inventory_report(self, auth_client, product):
        resp = auth_client.get("/api/v1/reports/inventory/")
        assert resp.status_code == status.HTTP_200_OK

    def test_suppliers_report(self, auth_client, supplier):
        resp = auth_client.get("/api/v1/reports/suppliers/")
        assert resp.status_code == status.HTTP_200_OK

    def test_customers_report(self, auth_client, customer):
        resp = auth_client.get("/api/v1/reports/customers/")
        assert resp.status_code == status.HTTP_200_OK

    def test_expenses_report(self, auth_client):
        baker.make("expenses.Expense", amount=100, date=date.today())
        resp = auth_client.get("/api/v1/reports/expenses/")
        assert resp.status_code == status.HTTP_200_OK

    def test_cash_flow_report(self, auth_client):
        resp = auth_client.get("/api/v1/reports/cash_flow/")
        assert resp.status_code == status.HTTP_200_OK

    def test_tax_report(self, auth_client):
        resp = auth_client.get("/api/v1/reports/tax/")
        assert resp.status_code == status.HTTP_200_OK

    def test_employee_sales_report(self, auth_client):
        resp = auth_client.get("/api/v1/reports/employee_sales/")
        assert resp.status_code == status.HTTP_200_OK

    def test_product_movement_report(self, auth_client, product):
        resp = auth_client.get("/api/v1/reports/product_movement/")
        assert resp.status_code == status.HTTP_200_OK
