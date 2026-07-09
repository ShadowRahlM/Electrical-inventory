from django.urls import path
from . import views

urlpatterns = [
    path("", views.SearchViewSet.as_view({"get": "list"}), name="global-search"),
]
