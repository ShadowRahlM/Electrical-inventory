#!/bin/sh
set -e

# Rollback deployment to a specific version
# Usage: ./scripts/rollback.sh <version>

VERSION=${1:-latest}
COMPOSE_FILE="docker-compose.prod.yml"

if [ "$VERSION" = "latest" ]; then
    echo "Usage: ./scripts/rollback.sh <version-tag>"
    echo "Available versions:"
    docker images --format "{{.Tag}}" ghcr.io/*/esms-backend | head -10
    exit 1
fi

echo "=== Rolling back to v$VERSION ==="

# Tag the specific version as latest
docker tag "ghcr.io/*/esms-backend:$VERSION" "ghcr.io/*/esms-backend:latest"
docker tag "ghcr.io/*/esms-frontend:$VERSION" "ghcr.io/*/esms-frontend:latest"

# Rollback backend first (with an extra instance for zero-downtime)
docker compose -f "$COMPOSE_FILE" up -d --no-deps --scale backend=2 backend
sleep 10

# Bring everything up with old images
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

# Run migrations in reverse if needed (manual step)
echo "NOTE: If the rollback involves a DB migration reversal, run:"
echo "  docker compose exec backend python manage.py migrate <app> <previous-migration>"

echo "=== Rollback to v$VERSION complete ==="
