from django.db.models import Sum, Q, F
from django.utils import timezone
from decimal import Decimal
from .models import Notification, NotificationType
from apps.products.models import Product
from apps.sales.models import Sale
from apps.customers.models import Customer
from apps.purchases.models import PurchaseOrder


def create_notification(user, notification_type, title, message, link=""):
    return Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link,
    )


def check_low_stock():
    from apps.accounts.models import User
    products = Product.objects.filter(
        is_active=True, status="active",
        quantity__gt=0, quantity__lte=F("min_stock"),
    )
    for product in products:
        message = f"{product.name} ({product.sku}) has {product.quantity} units left (min: {product.min_stock})"
        for user in User.objects.filter(is_active=True):
            create_notification(
                user, NotificationType.LOW_STOCK,
                f"Low Stock: {product.name}", message,
                f"/products/{product.id}",
            )


def check_reorder_level():
    from apps.accounts.models import User
    from django.db.models import F
    products = Product.objects.filter(
        is_active=True, status="active",
        quantity__gt=0, quantity__lte=F("reorder_level"),
    )
    for product in products:
        message = f"{product.name} ({product.sku}) needs reorder (qty: {product.quantity}, reorder at: {product.reorder_level})"
        for user in User.objects.filter(is_active=True):
            create_notification(
                user, NotificationType.REORDER,
                f"Reorder: {product.name}", message,
                f"/products/{product.id}",
            )


def check_customer_debt():
    from apps.accounts.models import User
    customers = Customer.objects.filter(
        is_active=True, credit_limit__gt=0,
        outstanding_balance__gte=F("credit_limit"),
    )
    for customer in customers:
        message = f"{customer.name} has exceeded credit limit (balance: {customer.outstanding_balance}, limit: {customer.credit_limit})"
        for user in User.objects.filter(is_active=True, role__in=["owner", "manager", "accountant"]):
            create_notification(
                user, NotificationType.CUSTOMER_DEBT,
                f"Customer debt: {customer.name}", message,
                f"/customers/{customer.id}",
            )


def check_supplier_payment():
    from apps.accounts.models import User
    from django.db.models import F
    orders = PurchaseOrder.objects.filter(
        is_active=True,
        status__in=["ordered", "partially_received", "received"],
        paid_amount__lt=F("total_amount"),
    )
    for order in orders:
        due = order.total_amount - order.paid_amount
        message = f"Payment of {due} due to {order.supplier.company} for order {order.order_number}"
        for user in User.objects.filter(is_active=True, role__in=["owner", "manager", "accountant"]):
            create_notification(
                user, NotificationType.SUPPLIER_PAYMENT,
                f"Supplier payment: {order.supplier.company}", message,
                f"/purchases/{order.id}",
            )


def check_daily_sales():
    from apps.accounts.models import User
    today = timezone.now().date()
    total = Sale.objects.filter(
        sale_date__date=today,
        is_active=True,
        status__in=[Sale.Status.COMPLETED, Sale.Status.PARTIALLY_REFUNDED],
    ).aggregate(t=Sum("total"))["t"] or Decimal("0")
    message = f"Today's sales total: {total}"
    for user in User.objects.filter(is_active=True):
        create_notification(
            user, NotificationType.DAILY_SALES,
            "Daily Sales Summary", message, "/",
        )


def run_all_checks():
    check_low_stock()
    check_reorder_level()
    check_customer_debt()
    check_supplier_payment()
