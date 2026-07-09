from abc import ABC, abstractmethod
from typing import Optional, Generic, TypeVar

T = TypeVar("T")

class RepositoryInterface(ABC, Generic[T]):
    @abstractmethod
    def get_all(self, **filters):
        ...

    @abstractmethod
    def get_by_id(self, id) -> Optional[T]:
        ...

    @abstractmethod
    def create(self, **data) -> T:
        ...

    @abstractmethod
    def update(self, id, **data) -> T:
        ...

    @abstractmethod
    def delete(self, id) -> bool:
        ...

class ServiceInterface(ABC, Generic[T]):
    @abstractmethod
    def list(self, **filters):
        ...

    @abstractmethod
    def retrieve(self, id) -> Optional[T]:
        ...

    @abstractmethod
    def create(self, **data) -> T:
        ...

    @abstractmethod
    def update(self, id, **data) -> T:
        ...

    @abstractmethod
    def delete(self, id) -> bool:
        ...
