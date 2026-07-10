from django.urls import path
from django.http import JsonResponse
from django.db import connections
from django.core.cache import cache
from django.conf import settings


def health_check(request):
    status = 200
    checks = {
        "status": "healthy",
        "version": "1.0.0",
        "services": {},
    }

    db_ok = True
    try:
        connections["default"].cursor().execute("SELECT 1")
        checks["services"]["database"] = "ok"
    except Exception as e:
        checks["services"]["database"] = str(e)
        db_ok = False
        status = 503

    cache_ok = True
    try:
        cache.set("__health__", 1, 5)
        cache.get("__health__")
        checks["services"]["cache"] = "ok"
    except Exception as e:
        checks["services"]["cache"] = str(e)
        cache_ok = False
        status = 503

    checks["debug"] = settings.DEBUG

    if not db_ok or not cache_ok:
        checks["status"] = "unhealthy"

    return JsonResponse(checks, status=status)


urlpatterns = [
    path("", health_check, name="health-check"),
]
