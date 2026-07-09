#!/bin/sh
set -e

if [ -n "$DATABASE_HOST" ]; then
    echo "Waiting for PostgreSQL..."
    while ! nc -z "$DATABASE_HOST" "${DATABASE_PORT:-5432}"; do
        sleep 1
    done
    echo "PostgreSQL is available"
fi

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput 2>/dev/null || true

exec "$@"
