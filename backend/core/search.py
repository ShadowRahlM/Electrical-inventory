from apps.products.models import Product
from apps.customers.models import Customer
from apps.suppliers.models import Supplier
from apps.sales.models import Sale
from apps.purchases.models import PurchaseOrder


def global_search(query, limit=20):
    if not query or len(query.strip()) < 2:
        return {}

    results = {}

    products = Product.objects.filter(
        is_active=True,
    ).filter(
        name__icontains=query
    ) | Product.objects.filter(sku__icontains=query) | Product.objects.filter(
        barcode__icontains=query
    ) | Product.objects.filter(brand__icontains=query)
    results["products"] = [
        {"id": str(p.id), "name": p.name, "sku": p.sku, "barcode": p.barcode}
        for p in products.select_related("category")[:limit]
    ]

    customers = Customer.objects.filter(is_active=True).filter(
        name__icontains=query
    ) | Customer.objects.filter(phone__icontains=query) | Customer.objects.filter(
        email__icontains=query
    )
    results["customers"] = [
        {"id": str(c.id), "name": c.name, "phone": c.phone, "email": c.email}
        for c in customers[:limit]
    ]

    suppliers = Supplier.objects.filter(is_active=True).filter(
        company__icontains=query
    ) | Supplier.objects.filter(contact_person__icontains=query) | Supplier.objects.filter(
        phone__icontains=query
    )
    results["suppliers"] = [
        {"id": str(s.id), "company": s.company, "contact": s.contact_person, "phone": s.phone}
        for s in suppliers[:limit]
    ]

    sales = Sale.objects.filter(is_active=True).filter(
        invoice_number__icontains=query
    ) | Sale.objects.filter(customer__name__icontains=query) | Sale.objects.filter(
        customer__phone__icontains=query
    )
    results["sales"] = [
        {"id": str(s.id), "invoice": s.invoice_number,
         "customer": s.customer.name if s.customer else "Walk-in",
         "total": str(s.total), "date": str(s.sale_date.date())}
        for s in sales.select_related("customer")[:limit]
    ]

    purchases = PurchaseOrder.objects.filter(is_active=True).filter(
        order_number__icontains=query
    ) | PurchaseOrder.objects.filter(supplier__company__icontains=query)
    results["purchases"] = [
        {"id": str(p.id), "order_number": p.order_number,
         "supplier": p.supplier.company,
         "total": str(p.total_amount), "status": p.status}
        for p in purchases.select_related("supplier")[:limit]
    ]

    return results
