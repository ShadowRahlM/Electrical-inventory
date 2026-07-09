import logging
import traceback

from django.conf import settings
from django.core.exceptions import (
    ValidationError as DjangoValidationError,
    PermissionDenied as DjangoPermissionDenied,
)
from django.http import Http404
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import APIException

logger = logging.getLogger(__name__)


class BusinessError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Business rule violation"
    default_code = "business_error"


class NotFoundError(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Resource not found"
    default_code = "not_found"


class PermissionDeniedError(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "You do not have permission to perform this action"
    default_code = "permission_denied"


class ConflictError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Resource conflict"
    default_code = "conflict"


class ValidationError(APIException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_detail = "Validation failed"
    default_code = "validation_error"


def core_exception_handler(exc, context):
    if isinstance(exc, DjangoValidationError):
        exc = ValidationError(detail={"non_field_errors": exc.messages})
    elif isinstance(exc, Http404):
        exc = NotFoundError()
    elif isinstance(exc, DjangoPermissionDenied):
        exc = PermissionDeniedError()

    response = drf_exception_handler(exc, context)

    if response is not None:
        errors = response.data
        response.data = {
            "success": False,
            "message": str(getattr(exc, "detail", "Request failed")),
            "errors": errors,
        }
        return response

    request_id = ""
    request = context.get("request")
    if request and hasattr(request, "request_id"):
        request_id = request.request_id

    logger.exception(
        "Unhandled exception [%s] %s %s: %s",
        request_id,
        request.method if request else "",
        request.path if request else "",
        str(exc),
        exc_info=traceback.format_exc() if settings.DEBUG else exc,
    )

    return Response(
        {
            "success": False,
            "message": "Internal server error",
            "request_id": request_id,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
