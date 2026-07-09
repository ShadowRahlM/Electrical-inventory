#!/bin/sh
set -e

# Production deployment script for ESMS
# Usage: ./scripts/deploy.sh [version]

VERSION=${1:-latest}
COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_DIR="/opt/esms"

echo "=== ESMS Deployment v$VERSION ==="

cd "$PROJECT_DIR"

echo "1. Pulling latest images..."
docker compose -f "$COMPOSE_FILE" pull

echo "2. Starting services..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

echo "3. Running migrations..."
docker compose -f "$COMPOSE_FILE" exec -T backend python manage.py migrate --noinput

echo "4. Collecting static files..."
docker compose -f "$COMPOSE_FILE" exec -T backend python manage.py collectstatic --noinput 2>/dev/null || true

echo "5. Checking service health..."
sleep 5
docker compose -f "$COMPOSE_FILE" ps

echo "6. Cleaning up old images..."
docker image prune -f

echo "=== Deployment complete ==="
