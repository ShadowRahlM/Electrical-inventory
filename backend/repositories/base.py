from typing import Optional, Type
from django.db import models

class BaseRepository:
    def __init__(self, model_class: Type[models.Model]):
        self.model_class = model_class

    def get_all(self, **filters):
        return self.model_class.objects.filter(**filters)

    def get_by_id(self, id) -> Optional[models.Model]:
        try:
            return self.model_class.objects.get(id=id)
        except self.model_class.DoesNotExist:
            return None

    def create(self, **data) -> models.Model:
        return self.model_class.objects.create(**data)

    def update(self, instance: models.Model, **data) -> models.Model:
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    def delete(self, instance: models.Model) -> None:
        instance.delete()
