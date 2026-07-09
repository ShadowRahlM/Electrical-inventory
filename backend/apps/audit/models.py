from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    class Action(models.TextChoices):
        CREATED = "created", "Created"
        UPDATED = "updated", "Updated"
        DELETED = "deleted", "Deleted"
        VIEWED = "viewed", "Viewed"
        LOGIN = "login", "Login"
        LOGOUT = "logout", "Logout"
        EXPORTED = "exported", "Exported"
        IMPORTED = "imported", "Imported"
        OTHER = "other", "Other"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=20, choices=Action.choices)
    resource = models.CharField(max_length=100, db_index=True)
    resource_id = models.CharField(max_length=100, blank=True, db_index=True)
    description = models.TextField(blank=True)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    device = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "audit_logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["resource", "resource_id"]),
            models.Index(fields=["user", "action"]),
        ]

    def __str__(self):
        return f"{self.user} {self.action} {self.resource} at {self.created_at}"
