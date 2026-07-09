from .base import *

DEBUG = True
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS += ["django_extensions"]

CORS_ALLOW_ALL_ORIGINS = True

DATABASES["default"]["OPTIONS"] = {}

MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware"] + MIDDLEWARE \
    if "debug_toolbar" not in MIDDLEWARE else MIDDLEWARE

INSTALLED_APPS += ["debug_toolbar"] if "debug_toolbar" not in INSTALLED_APPS else []

INTERNAL_IPS = ["127.0.0.1"]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
