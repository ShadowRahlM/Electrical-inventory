from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("quotations", views.QuotationViewSet, basename="quotation")
router.register("", views.SaleViewSet, basename="sale")

urlpatterns = [
    path("", include(router.urls)),
]
