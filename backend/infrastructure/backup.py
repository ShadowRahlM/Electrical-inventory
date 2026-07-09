import os
import subprocess
from datetime import datetime
from django.conf import settings
from django.core.management import call_command


def run_backup(output_dir=None):
    if not output_dir:
        output_dir = settings.BASE_DIR / "backups"
    os.makedirs(output_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"esms_backup_{timestamp}.json"
    filepath = os.path.join(output_dir, filename)

    with open(filepath, "w") as f:
        call_command("dumpdata", "--exclude", "contenttypes",
                     "--exclude", "auth.Permission",
                     "--natural-foreign", stdout=f)

    return {"filepath": filepath, "filename": filename, "size": os.path.getsize(filepath)}


def run_pg_backup(output_dir=None):
    if not output_dir:
        output_dir = settings.BASE_DIR / "backups"
    os.makedirs(output_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"esms_db_{timestamp}.sql"
    filepath = os.path.join(output_dir, filename)

    db_settings = settings.DATABASES["default"]
    env = os.environ.copy()
    env["PGPASSWORD"] = db_settings["PASSWORD"]

    cmd = [
        "pg_dump",
        "-h", db_settings["HOST"],
        "-p", str(db_settings["PORT"]),
        "-U", db_settings["USER"],
        "-d", db_settings["NAME"],
        "-f", filepath,
    ]

    try:
        result = subprocess.run(cmd, env=env, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            return {"error": result.stderr}
    except Exception as e:
        return {"error": str(e)}

    return {"filepath": filepath, "filename": filename, "size": os.path.getsize(filepath)}


def restore_backup(filepath):
    with open(filepath, "r") as f:
        call_command("loaddata", filepath)
    return True
