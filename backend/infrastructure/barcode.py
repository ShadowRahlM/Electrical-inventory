import io
import barcode
from barcode import Code128, EAN13
from barcode.writer import ImageWriter
import qrcode
from django.core.files.base import ContentFile


def generate_code128(data: str) -> bytes:
    rv = io.BytesIO()
    Code128(data, writer=ImageWriter()).write(rv)
    rv.seek(0)
    return rv.getvalue()


def generate_ean13(data: str) -> bytes:
    if len(data) != 12 or not data.isdigit():
        data = data.zfill(12)[:12]
    rv = io.BytesIO()
    EAN13(data, writer=ImageWriter()).write(rv)
    rv.seek(0)
    return rv.getvalue()


def generate_qr_code(data: str) -> bytes:
    img = qrcode.make(data)
    rv = io.BytesIO()
    img.save(rv, format="PNG")
    rv.seek(0)
    return rv.getvalue()


def get_barcode_image(data: str, barcode_type: str = "code128") -> ContentFile:
    if barcode_type == "ean13":
        content = generate_ean13(data)
    elif barcode_type == "qr":
        content = generate_qr_code(data)
    else:
        content = generate_code128(data)
    return ContentFile(content, name=f"{data}.png")
