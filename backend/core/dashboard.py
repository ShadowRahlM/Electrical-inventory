from decimal import Decimal
from django.db.models import Sum, Count
from django.utils import timezone
from apps.sales.models import Sale, SaleItem
from apps.products.models import Product
from apps.expenses.models import Expense
from apps.inventory.models import StockMovement
from apps.customers.models import Customer
from apps.suppliers.models import Supplier
from apps.purchases.models import PurchaseOrder


def get_dashboard_kpis():
    today = timezone.now().date()
    week_ago = today - timezone.timedelta(days=7)
    month_ago = today.replace(day=1)

    today_sales_total = Sale.objects.filter(
        sale_date__date=today, is_active=True,
        status__in=[Sale.Status.COMPLETED, Sale.Status.PARTIALLY_REFUNDED],
    ).aggregate(t=Sum("total"))["t"] or Decimal("0")

    today_sales_count = Sale.objects.filter(
        sale_date__date=today, is_active=True,
    ).count()

    week_sales = Sale.objects.filter(
        sale_date__date__gte=week_ago, is_active=True,
        status__in=[Sale.Status.COMPLETED, Sale.Status.PARTIALLY_REFUNDED],
    ).aggregate(t=Sum("total"))["t"] or Decimal("0")

    month_sales = Sale.objects.filter(
        sale_date__date__gte=month_ago, is_active=True,
        status__in=[Sale.Status.COMPLETED, Sale.Status.PARTIALLY_REFUNDED],
    ).aggregate(t=Sum("total"))["t"] or Decimal("0")

    low_stock_count = sum(
        1 for p in Product.objects.filter(is_active=True, status="active")
        if p.is_low_stock
    )

    out_of_stock_count = sum(
        1 for p in Product.objects.filter(is_active=True, status="active")
        if p.is_out_of_stock
    )

    today_expenses = Expense.objects.filter(
        date=today, is_active=True,
    ).aggregate(t=Sum("amount"))["t"] or Decimal("0")

    month_expenses = Expense.objects.filter(
        date__gte=month_ago, is_active=True,
    ).aggregate(t=Sum("amount"))["t"] or Decimal("0")

    total_revenue = Sale.objects.filter(
        is_active=True,
        status__in=[Sale.Status.COMPLETED, Sale.Status.PARTIALLY_REFUNDED],
    ).aggregate(t=Sum("total"))["t"] or Decimal("0")

    stock_value = sum(
        p.cost_price * p.quantity
        for p in Product.objects.filter(is_active=True, status="active")
    )

    customer_debt = Customer.objects.filter(is_active=True).aggregate(
        t=Sum("outstanding_balance")
    )["t"] or Decimal("0")

    supplier_debt = sum(
        (po.total_amount - po.paid_amount)
        for po in PurchaseOrder.objects.filter(is_active=True).exclude(
            status__in=["cancelled", "draft"]
        )
    )

    top_products = (
        SaleItem.objects.filter(sale__is_active=True)
        .values("product__name", "product__sku")
        .annotate(total_qty=Sum("quantity"), total_revenue=Sum("subtotal"))
        .order_by("-total_revenue")[:10]
    )

    best_customers = (
        Sale.objects.filter(is_active=True)
        .values("customer__name", "customer__phone")
        .annotate(total_spent=Sum("total"), sale_count=Count("id"))
        .order_by("-total_spent")[:10]
    )

    recent_invoices = list(
        Sale.objects.filter(is_active=True)
        .select_related("customer")
        .order_by("-sale_date")[:10]
        .values("invoice_number", "customer__name", "total", "sale_date")
    )

    cash_balance = (
        Sale.objects.filter(is_active=True).aggregate(t=Sum("paid_amount"))["t"] or Decimal("0")
    ) - (
        Expense.objects.filter(is_active=True).aggregate(t=Sum("amount"))["t"] or Decimal("0")
    )

    today_profit = today_sales_total - today_expenses

    return {
        "today": {
            "sales_total": str(today_sales_total),
            "sales_count": today_sales_count,
            "expenses": str(today_expenses),
            "profit": str(today_profit),
        },
        "weekly_sales": str(week_sales),
        "monthly": {
            "sales": str(month_sales),
            "expenses": str(month_expenses),
        },
        "inventory": {
            "low_stock": low_stock_count,
            "out_of_stock": out_of_stock_count,
            "stock_value": str(stock_value),
        },
        "financial": {
            "total_revenue": str(total_revenue),
            "cash_balance": str(cash_balance),
            "customer_debt": str(customer_debt),
            "supplier_debt": str(supplier_debt),
        },
        "top_products": [
            {"name": p["product__name"], "sku": p["product__sku"],
             "sold": p["total_qty"], "revenue": str(p["total_revenue"])}
            for p in top_products
        ],
        "best_customers": [
            {"name": c["customer__name"] or "Walk-in", "phone": c["customer__phone"] or "",
             "total": str(c["total_spent"]), "sales": c["sale_count"]}
            for c in best_customers
        ],
        "recent_invoices": [
            {"invoice": i["invoice_number"], "customer": i["customer__name"] or "Walk-in",
             "total": str(i["total"]), "date": i["sale_date"].isoformat() if i["sale_date"] else ""}
            for i in recent_invoices
        ],
    }
