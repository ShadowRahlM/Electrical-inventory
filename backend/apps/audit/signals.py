import json
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.conf import settings
from .models import AuditLog


def record_audit(user, action, resource, resource_id, description="",
                 old_value=None, new_value=None, request=None):
    AuditLog.objects.create(
        user=user if user and user.is_authenticated else None,
        action=action,
        resource=resource,
        resource_id=str(resource_id) if resource_id else "",
        description=description,
        old_value=old_value,
        new_value=new_value,
        ip_address=getattr(request, "audit_ip", "") if request else "",
        user_agent=getattr(request, "audit_user_agent", "") if request else "",
        device=getattr(request, "audit_device", "") if request else "",
    )


def serialize_instance(instance):
    model_name = instance._meta.model_name
    excluded = {"password", "last_login", "is_superuser"}
    data = {}
    for field in instance._meta.fields:
        if field.name not in excluded:
            try:
                value = getattr(instance, field.name)
                if hasattr(value, "pk"):
                    value = str(value.pk)
                elif hasattr(value, "isoformat"):
                    value = value.isoformat()
                data[field.name] = str(value) if value is not None else None
            except Exception:
                data[field.name] = None
    return data
