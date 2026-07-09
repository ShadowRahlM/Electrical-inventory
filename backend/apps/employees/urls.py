from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.EmployeeViewSet, basename="employee")
router.register("attendance", views.AttendanceViewSet, basename="attendance")

urlpatterns = [
    path("", include(router.urls)),
]
