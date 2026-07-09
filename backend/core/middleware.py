import uuid
import time
import logging

from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class RequestIDMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request_id = request.META.get("HTTP_X_REQUEST_ID") or str(uuid.uuid4())
        request.request_id = request_id

    def process_response(self, request, response):
        request_id = getattr(request, "request_id", None)
        if request_id:
            response["X-Request-ID"] = request_id
        return response


class RequestLoggingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request._start_time = time.time()

    def process_response(self, request, response):
        duration = time.time() - getattr(request, "_start_time", time.time())
        user = request.user if request.user.is_authenticated else "anonymous"
        logger.info(
            "%s %s %s %s %.3fs",
            request.method,
            request.path,
            response.status_code,
            user,
            duration,
        )
        return response


class AuditMiddleware(MiddlewareMixin):
    def process_request(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0].strip()
        else:
            ip = request.META.get("REMOTE_ADDR", "0.0.0.0")
        request.audit_ip = ip
        request.audit_user_agent = request.META.get("HTTP_USER_AGENT", "")
        request.audit_device = request.META.get(
            "HTTP_SEC_CH_UA_PLATFORM",
            request.META.get("HTTP_USER_AGENT", "unknown"),
        )[:50]
