#!/bin/sh
set -e

if [ -n "$DATABASE_HOST" ]; then
    echo "Waiting for PostgreSQL..."
    for i in $(seq 1 30); do
        python -c "import psycopg2; psycopg2.connect(host='$DATABASE_HOST', port='${DATABASE_PORT:-5432}', user='$POSTGRES_USER', password='$POSTGRES_PASSWORD', dbname='$POSTGRES_DB')" 2>/dev/null && break
        sleep 1
    done
    echo "PostgreSQL is available"
fi

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput 2>/dev/null || true

exec "$@"
