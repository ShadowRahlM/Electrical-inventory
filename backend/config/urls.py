from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/categories/", include("apps.categories.urls")),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/products/", include("apps.products.urls")),
    path("api/v1/inventory/", include("apps.inventory.urls")),
    path("api/v1/suppliers/", include("apps.suppliers.urls")),
    path("api/v1/customers/", include("apps.customers.urls")),
    path("api/v1/purchases/", include("apps.purchases.urls")),
    path("api/v1/sales/", include("apps.sales.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
    path("api/v1/expenses/", include("apps.expenses.urls")),
    path("api/v1/accounting/", include("apps.accounting.urls")),
    path("api/v1/reports/", include("apps.reports.urls")),
    path("api/v1/employees/", include("apps.employees.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/audit/", include("apps.audit.urls")),
    path("api/v1/accounts/", include("apps.accounts.urls")),
    path("api/v1/dashboard/", include("core.dashboard_urls")),
    path("api/v1/search/", include("core.search_urls")),
    path("api/v1/backup/", include("core.backup_urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("ht/", include("health_check.urls")),
    path("api/v1/health/", include("core.health_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
