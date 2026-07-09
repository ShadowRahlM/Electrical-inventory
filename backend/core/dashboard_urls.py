from django.urls import path
from . import views

urlpatterns = [
    path("", views.DashboardViewSet.as_view({"get": "list"}), name="dashboard"),
    path("summary/", views.DashboardViewSet.as_view({"get": "summary"}), name="dashboard-summary"),
]
