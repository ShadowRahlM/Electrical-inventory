from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("accounts", views.AccountViewSet, basename="account")
router.register("journal", views.JournalEntryViewSet, basename="journal-entry")
router.register("reports", views.FinancialReportViewSet, basename="financial-report")

urlpatterns = [
    path("", include(router.urls)),
]
