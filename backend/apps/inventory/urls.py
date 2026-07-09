from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("movements", views.StockMovementViewSet, basename="stock-movement")

urlpatterns = [
    path("", include(router.urls)),
]
