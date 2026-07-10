from .base import *

DEBUG = False

SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "True") == "True"
SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "True") == "True"
CSRF_COOKIE_SECURE = os.getenv("CSRF_COOKIE_SECURE", "True") == "True"
SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "31536000"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = os.getenv("SECURE_HSTS_INCLUDE_SUBDOMAINS", "True") == "True"
SECURE_HSTS_PRELOAD = os.getenv("SECURE_HSTS_PRELOAD", "True") == "True"
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
CORS_ALLOW_ALL_ORIGINS = False

INSTALLED_APPS = [app for app in INSTALLED_APPS if app not in [
    "debug_toolbar",
    "django_extensions",
]]

MIDDLEWARE = [m for m in MIDDLEWARE if "debug_toolbar" not in m]

# Sentry
import sentry_sdk

if sentry_dsn := os.getenv("SENTRY_DSN"):
    sentry_sdk.init(
        dsn=sentry_dsn,
        environment="production",
        traces_sample_rate=0.2,
        profiles_sample_rate=0.1,
        send_default_pii=False,
    )
