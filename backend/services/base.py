import logging
from typing import Optional, Type, List
from django.db import transaction, models
from django.core.cache import cache
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

logger = logging.getLogger(__name__)


class BaseService:
    def __init__(self, model_class: Type[models.Model]):
        self.model_class = model_class

    def list(self, **filters) -> models.QuerySet:
        return self.model_class.objects.filter(**filters)

    def get_by_id(self, id) -> Optional[models.Model]:
        try:
            return self.model_class.objects.get(id=id)
        except self.model_class.DoesNotExist:
            return None

    @transaction.atomic
    def create(self, **data) -> models.Model:
        instance = self.model_class.objects.create(**data)
        logger.info("Created %s: %s", self.model_class.__name__, instance.pk)
        return instance

    @transaction.atomic
    def update(self, id, **data) -> Optional[models.Model]:
        instance = self.get_by_id(id)
        if not instance:
            return None
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        logger.info("Updated %s: %s", self.model_class.__name__, instance.pk)
        return instance

    @transaction.atomic
    def delete(self, id) -> bool:
        instance = self.get_by_id(id)
        if not instance:
            return False
        instance.delete()
        logger.info("Deleted %s: %s", self.model_class.__name__, id)
        return True

    def validate(self, data: dict, serializer_class: Type[serializers.Serializer]) -> dict:
        serializer = serializer_class(data=data)
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data

    def get_cached(self, key: str, default=None):
        return cache.get(key, default)

    def set_cache(self, key: str, data, timeout: int = 300):
        cache.set(key, data, timeout)

    def invalidate_cache(self, pattern: str):
        try:
            from django_redis import get_redis_connection
            conn = get_redis_connection("default")
            keys = conn.keys(pattern)
            if keys:
                conn.delete(*keys)
        except Exception:
            pass

    def exists(self, **filters) -> bool:
        return self.model_class.objects.filter(**filters).exists()

    def count(self, **filters) -> int:
        return self.model_class.objects.filter(**filters).count()
