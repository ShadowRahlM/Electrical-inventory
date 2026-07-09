from decimal import Decimal
from datetime import date, timedelta
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from apps.sales.models import Sale, SaleItem
from apps.purchases.models import PurchaseOrder, PurchaseItem
from apps.inventory.models import StockMovement
from apps.products.models import Product
from apps.expenses.models import Expense
from apps.customers.models import Customer
from apps.suppliers.models import Supplier
from apps.accounting.services import (
    get_revenue, get_expenses, get_gross_profit, get_net_profit, get_cash_flow,
)


def get_daily_sales(date_obj=None):
    if not date_obj:
        date_obj = timezone.now().date()
    sales = Sale.objects.filter(
        sale_date__date=date_obj, is_active=True,
        status__in=[Sale.Status.COMPLETED, Sale.Status.PARTIALLY_REFUNDED],
    )
    total = sales.aggregate(t=Sum("total"))["t"] or Decimal("0")
    count = sales.count()
    items = []
    for s in sales.select_related("customer", "created_by"):
        items.append({
            "invoice": s.invoice_number,
            "customer": s.customer.name if s.customer else "Walk-in",
            "time": s.sale_date.strftime("%H:%M"),
            "total": str(s.total),
            "paid": str(s.paid_amount),
            "by": s.created_by.username if s.created_by else "",
        })
    return {"date": str(date_obj), "sales_count": count, "total": str(total), "sales": items}


def get_period_sales(start_date, end_date, period="monthly"):
    sales = Sale.objects.filter(
        sale_date__date__gte=start_date, sale_date__date__lte=end_date,
        is_active=True,
        status__in=[Sale.Status.COMPLETED, Sale.Status.PARTIALLY_REFUNDED],
    )
    total = sales.aggregate(t=Sum("total"))["t"] or Decimal("0")
    count = sales.count()
    by_date = {}
    for s in sales:
        key = s.sale_date.strftime("%Y-%m-%d")
        by_date[key] = by_date.get(key, Decimal("0")) + s.total
    return {
        "period": period,
        "start": str(start_date), "end": str(end_date),
        "sales_count": count, "total": str(total),
        "daily_breakdown": {k: str(v) for k, v in sorted(by_date.items())},
    }


def get_sales_by_product(start_date=None, end_date=None):
    qs = SaleItem.objects.filter(sale__is_active=True).values("product__name", "product__sku").annotate(
        total_qty=Sum("quantity"),
        total_revenue=Sum("subtotal"),
        sale_count=Count("sale", distinct=True),
    ).order_by("-total_revenue")
    if start_date:
        qs = qs.filter(sale__sale_date__date__gte=start_date)
    if end_date:
        qs = qs.filter(sale__sale_date__date__lte=end_date)
    return list(qs)


def get_sales_by_category(start_date=None, end_date=None):
    qs = SaleItem.objects.filter(
        sale__is_active=True, product__category__isnull=False,
    ).values("product__category__name").annotate(
        total_qty=Sum("quantity"),
        total_revenue=Sum("subtotal"),
    ).order_by("-total_revenue")
    if start_date:
        qs = qs.filter(sale__sale_date__date__gte=start_date)
    if end_date:
        qs = qs.filter(sale__sale_date__date__lte=end_date)
    return list(qs)


def get_profit_report(start_date=None, end_date=None):
    revenue = get_revenue(start_date, end_date)
    expenses = get_expenses(start_date, end_date)
    gross_profit = get_gross_profit(start_date, end_date)
    net_profit = get_net_profit(start_date, end_date)
    cash_flow = get_cash_flow(start_date, end_date)
    return {
        "revenue": str(revenue),
        "expenses": str(expenses),
        "gross_profit": str(gross_profit),
        "net_profit": str(net_profit),
        "cash_flow": str(cash_flow),
        "gross_margin": str(round((gross_profit / revenue * 100) if revenue else 0, 2)),
        "net_margin": str(round((net_profit / revenue * 100) if revenue else 0, 2)),
    }


def get_purchase_report(start_date=None, end_date=None):
    qs = PurchaseOrder.objects.filter(is_active=True)
    if start_date:
        qs = qs.filter(order_date__gte=start_date)
    if end_date:
        qs = qs.filter(order_date__lte=end_date)
    total = qs.aggregate(t=Sum("total_amount"))["t"] or Decimal("0")
    paid = qs.aggregate(t=Sum("paid_amount"))["t"] or Decimal("0")
    items = []
    for po in qs.select_related("supplier", "created_by"):
        items.append({
            "order_number": po.order_number,
            "supplier": po.supplier.company,
            "date": str(po.order_date),
            "status": po.status,
            "total": str(po.total_amount),
            "paid": str(po.paid_amount),
        })
    return {"total_orders": qs.count(), "total_amount": str(total), "total_paid": str(paid), "orders": items}


def get_inventory_report():
    products = Product.objects.filter(is_active=True).select_related("category", "supplier")
    items = []
    for p in products:
        items.append({
            "sku": p.sku, "name": p.name, "category": p.category.name if p.category else "",
            "quantity": p.quantity, "min_stock": p.min_stock,
            "reorder_level": p.reorder_level, "cost_price": str(p.cost_price),
            "stock_value": str(p.cost_price * p.quantity),
            "status": p.status, "is_low_stock": p.is_low_stock,
            "is_out_of_stock": p.is_out_of_stock, "needs_reorder": p.needs_reorder,
        })
    total_value = sum(Decimal(i["stock_value"]) for i in items)
    return {
        "total_products": len(items),
        "total_stock_value": str(total_value),
        "low_stock_count": sum(1 for i in items if i["is_low_stock"]),
        "out_of_stock_count": sum(1 for i in items if i["is_out_of_stock"]),
        "products": items,
    }


def get_stock_movement_report(start_date=None, end_date=None):
    qs = StockMovement.objects.select_related("product", "performed_by")
    if start_date:
        qs = qs.filter(created_at__date__gte=start_date)
    if end_date:
        qs = qs.filter(created_at__date__lte=end_date)
    items = []
    for m in qs:
        items.append({
            "date": m.created_at.strftime("%Y-%m-%d %H:%M"),
            "product": m.product.name if m.product else "N/A",
            "sku": m.product.sku if m.product else "",
            "type": m.movement_type,
            "qty_change": m.quantity_change,
            "balance_after": m.balance_after,
            "reference": m.reference,
            "by": m.performed_by.username if m.performed_by else "",
        })
    return {"total_movements": len(items), "movements": items}


def get_supplier_report():
    suppliers = Supplier.objects.filter(is_active=True)
    items = []
    for s in suppliers:
        orders = s.purchase_orders.filter(is_active=True)
        total_purchases = orders.aggregate(t=Sum("total_amount"))["t"] or Decimal("0")
        items.append({
            "company": s.company, "contact": s.contact_person, "phone": s.phone,
            "balance": str(s.balance),
            "total_purchases": str(total_purchases),
            "order_count": orders.count(),
        })
    return {"suppliers": items}


def get_customer_report():
    customers = Customer.objects.filter(is_active=True)
    items = []
    for c in customers:
        sales = c.sales.filter(is_active=True)
        total_sales = sales.aggregate(t=Sum("total"))["t"] or Decimal("0")
        items.append({
            "name": c.name, "phone": c.phone, "email": c.email,
            "credit_limit": str(c.credit_limit),
            "outstanding": str(c.outstanding_balance),
            "total_sales": str(total_sales),
            "sale_count": sales.count(),
            "loyalty_points": c.loyalty_points,
        })
    return {"customers": items}


def get_expense_report(start_date=None, end_date=None):
    qs = Expense.objects.filter(is_active=True)
    if start_date:
        qs = qs.filter(date__gte=start_date)
    if end_date:
        qs = qs.filter(date__lte=end_date)
    by_category = qs.values("category").annotate(
        total=Sum("amount"), count=Count("id")
    ).order_by("-total")
    total = qs.aggregate(t=Sum("amount"))["t"] or Decimal("0")
    items = []
    for e in qs.select_related("recorded_by"):
        items.append({
            "category": e.get_category_display(),
            "amount": str(e.amount),
            "date": str(e.date),
            "description": e.description,
            "by": e.recorded_by.username if e.recorded_by else "",
        })
    return {
        "total_expenses": str(total),
        "by_category": [
            {"category": b["category"], "total": str(b["total"]), "count": b["count"]}
            for b in by_category
        ],
        "items": items,
    }


def get_tax_report(start_date=None, end_date=None):
    sales = Sale.objects.filter(
        is_active=True,
        status__in=[Sale.Status.COMPLETED, Sale.Status.PARTIALLY_REFUNDED],
    )
    if start_date:
        sales = sales.filter(sale_date__date__gte=start_date)
    if end_date:
        sales = sales.filter(sale_date__date__lte=end_date)
    total_tax = sales.aggregate(t=Sum("tax"))["t"] or Decimal("0")
    total_sales = sales.aggregate(t=Sum("total"))["t"] or Decimal("0")
    return {
        "total_tax_collected": str(total_tax),
        "total_sales": str(total_sales),
        "effective_rate": str(round((total_tax / total_sales * 100) if total_sales else 0, 2)),
    }


def get_employee_sales_report(start_date=None, end_date=None):
    qs = Sale.objects.filter(is_active=True)
    if start_date:
        qs = qs.filter(sale_date__date__gte=start_date)
    if end_date:
        qs = qs.filter(sale_date__date__lte=end_date)
    by_employee = qs.values(
        "created_by__username", "created_by__first_name", "created_by__last_name"
    ).annotate(
        total_sales=Sum("total"),
        sale_count=Count("id"),
    ).order_by("-total_sales")
    return {
        "employees": [
            {
                "username": e["created_by__username"],
                "name": f"{e['created_by__first_name']} {e['created_by__last_name']}".strip(),
                "total_sales": str(e["total_sales"]),
                "sale_count": e["sale_count"],
            }
            for e in by_employee
        ]
    }


def get_product_movement_report():
    threshold_high = 10
    threshold_low = 3
    products = Product.objects.filter(is_active=True, status="active")

    fast = []
    slow = []
    dead = []

    for p in products:
        movement_count = p.stock_movements.count()
        sales_count = p.sale_items.aggregate(t=Sum("quantity"))["t"] or 0

        if sales_count >= threshold_high:
            fast.append({"name": p.name, "sku": p.sku, "sold": sales_count, "stock": p.quantity})
        elif sales_count <= threshold_low:
            slow.append({"name": p.name, "sku": p.sku, "sold": sales_count, "stock": p.quantity})
        if movement_count == 0 and p.quantity > 0:
            dead.append({"name": p.name, "sku": p.sku, "stock": p.quantity})

    return {
        "fast_moving": sorted(fast, key=lambda x: x["sold"], reverse=True),
        "slow_moving": sorted(slow, key=lambda x: x["sold"]),
        "dead_stock": sorted(dead, key=lambda x: x["stock"]),
    }
