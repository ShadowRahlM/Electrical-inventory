import os
import uuid
from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage

ALLOWED_FILE_EXTENSIONS = {
    "image": (".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"),
    "document": (".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv"),
    "barcode": (".png", ".svg"),
}

MAX_FILE_SIZE = 10 * 1024 * 1024


class MediaStorage(S3Boto3Storage):
    location = "media"
    file_overwrite = False

    def get_available_name(self, name, max_length=None):
        ext = os.path.splitext(name)[1].lower()
        return f"{self.location}/{uuid.uuid4()}{ext}"


class StaticStorage(S3Boto3Storage):
    location = "static"


def validate_file_extension(filename: str, category: str = "image") -> bool:
    ext = os.path.splitext(filename)[1].lower()
    allowed = ALLOWED_FILE_EXTENSIONS.get(category, ALLOWED_FILE_EXTENSIONS["image"])
    return ext in allowed


def validate_file_size(file_obj) -> bool:
    if file_obj.size > MAX_FILE_SIZE:
        return False
    return True


def generate_signed_url(file_path: str, expiration: int = 3600) -> str:
    if settings.DEFAULT_FILE_STORAGE == "storages.backends.s3boto3.S3Boto3Storage":
        from storages.backends.s3boto3 import S3Boto3Storage
        storage = S3Boto3Storage()
        return storage.url(file_path, expire=expiration)
    from django.conf import settings as dj_settings
    from django.contrib.staticfiles.storage import staticfiles_storage
    return f"{dj_settings.MEDIA_URL}{file_path}"
