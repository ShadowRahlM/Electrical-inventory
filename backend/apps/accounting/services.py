from decimal import Decimal
from django.db.models import Sum, Q
from django.utils import timezone
from apps.sales.models import Sale
from apps.purchases.models import PurchaseOrder
from apps.expenses.models import Expense
from apps.payments.models import Payment
from apps.products.models import Product
from apps.customers.models import Customer
from apps.suppliers.models import Supplier


def get_revenue(start_date=None, end_date=None):
    qs = Sale.objects.filter(
        status__in=[Sale.Status.COMPLETED, Sale.Status.PARTIALLY_REFUNDED],
        is_active=True,
    )
    if start_date:
        qs = qs.filter(sale_date__date__gte=start_date)
    if end_date:
        qs = qs.filter(sale_date__date__lte=end_date)
    return qs.aggregate(total=Sum("total"))["total"] or Decimal("0")


def get_expenses(start_date=None, end_date=None):
    qs = Expense.objects.filter(is_active=True)
    if start_date:
        qs = qs.filter(date__gte=start_date)
    if end_date:
        qs = qs.filter(date__lte=end_date)
    return qs.aggregate(total=Sum("amount"))["total"] or Decimal("0")


def get_cogs(start_date=None, end_date=None):
    from apps.sales.models import SaleItem
    qs = SaleItem.objects.filter(
        sale__status__in=[Sale.Status.COMPLETED, Sale.Status.PARTIALLY_REFUNDED],
        sale__is_active=True,
    )
    if start_date:
        qs = qs.filter(sale__sale_date__date__gte=start_date)
    if end_date:
        qs = qs.filter(sale__sale_date__date__lte=end_date)

    total_cogs = Decimal("0")
    for item in qs.select_related("product"):
        total_cogs += item.product.cost_price * item.quantity
    return total_cogs


def get_gross_profit(start_date=None, end_date=None):
    return get_revenue(start_date, end_date) - get_cogs(start_date, end_date)


def get_net_profit(start_date=None, end_date=None):
    return get_gross_profit(start_date, end_date) - get_expenses(start_date, end_date)


def get_cash_flow(start_date=None, end_date=None):
    qs = Payment.objects.filter(is_active=True)
    if start_date:
        qs = qs.filter(payment_date__date__gte=start_date)
    if end_date:
        qs = qs.filter(payment_date__date__lte=end_date)

    inflow = qs.filter(direction="inflow").aggregate(total=Sum("amount"))["total"] or Decimal("0")
    outflow = qs.filter(direction="outflow").aggregate(total=Sum("amount"))["total"] or Decimal("0")
    return inflow - outflow


def get_stock_value():
    products = Product.objects.filter(is_active=True, status="active")
    total = Decimal("0")
    for p in products:
        total += p.cost_price * p.quantity
    return total


def get_customer_debt():
    return Customer.objects.filter(is_active=True).aggregate(
        total=Sum("outstanding_balance")
    )["total"] or Decimal("0")


def get_supplier_debt():
    result = PurchaseOrder.objects.filter(
        is_active=True,
        status__in=["ordered", "partially_received", "received"],
    ).aggregate(total=Sum("total_amount") - Sum("paid_amount"))
    return result["total"] or Decimal("0")


def get_profit_summary(start_date=None, end_date=None):
    revenue = get_revenue(start_date, end_date)
    cogs = get_cogs(start_date, end_date)
    expenses = get_expenses(start_date, end_date)
    gross_profit = revenue - cogs
    net_profit = gross_profit - expenses
    margin = (gross_profit / revenue * 100) if revenue else Decimal("0")

    return {
        "revenue": str(revenue),
        "cost_of_goods_sold": str(cogs),
        "gross_profit": str(gross_profit),
        "gross_margin": str(round(margin, 2)),
        "expenses": str(expenses),
        "net_profit": str(net_profit),
        "net_margin": str(round((net_profit / revenue * 100) if revenue else 0, 2)),
    }


def get_financial_summary():
    return {
        "stock_value": str(get_stock_value()),
        "customer_debt": str(get_customer_debt()),
        "supplier_debt": str(get_supplier_debt()),
        "cash_flow": str(get_cash_flow()),
    }
