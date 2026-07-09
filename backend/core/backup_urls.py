from django.urls import path
from . import views

urlpatterns = [
    path("create/", views.BackupViewSet.as_view({"post": "create"}), name="backup-create"),
    path("pg-dump/", views.BackupViewSet.as_view({"post": "pg_dump"}), name="backup-pg-dump"),
]
