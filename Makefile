.PHONY: help build up down logs shell migrate static test lint backup restore

help:
	@echo "ESMS Deployment Commands"
	@echo "========================"
	@echo "make build        - Build all production images"
	@echo "make up           - Start production stack"
	@echo "make down         - Stop production stack"
	@echo "make logs         - Tail production logs"
	@echo "make shell        - Open Django shell in backend"
	@echo "make migrate      - Run database migrations"
	@echo "make static       - Collect static files"
	@echo "make test         - Run backend tests"
	@echo "make test-front   - Run frontend tests"
	@echo "make lint         - Run linters"
	@echo "make backup       - Backup database"
	@echo "make restore      - Restore database from backup"
	@echo "make ssl-init     - Initialize Let's Encrypt certificates"
	@echo "make ssl-renew    - Renew Let's Encrypt certificates"
	@echo "make clean        - Clean up volumes and images"

build:
	docker compose -f docker-compose.prod.yml build

up:
	docker compose -f docker-compose.prod.yml up -d

down:
	docker compose -f docker-compose.prod.yml down

logs:
	docker compose -f docker-compose.prod.yml logs -f

shell:
	docker compose -f docker-compose.prod.yml exec backend python manage.py shell_plus

migrate:
	docker compose -f docker-compose.prod.yml exec backend python manage.py migrate --noinput

static:
	docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

test:
	docker compose -f docker-compose.prod.yml exec backend python -m pytest

test-front:
	docker compose -f docker-compose.prod.yml exec frontend npm test

lint:
	docker compose -f docker-compose.prod.yml exec backend flake8

backup:
	@mkdir -p backups
	docker compose -f docker-compose.prod.yml exec -T db pg_dump -U ${POSTGRES_USER:-esms} ${POSTGRES_DB:-esms_db} > backups/esms_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup saved to backups/"

restore:
	@echo "Usage: make restore FILE=backups/esms_20240101_120000.sql"
	docker compose -f docker-compose.prod.yml exec -T db psql -U ${POSTGRES_USER:-esms} -d ${POSTGRES_DB:-esms_db} < $(FILE)
	@echo "Restore complete"

ssl-init:
	docker compose -f docker-compose.prod.yml -f docker-compose.ssl.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot -d $(DOMAIN)
	@echo "Certificates issued. Restart nginx: make down && make up"

ssl-renew:
	docker compose -f docker-compose.prod.yml -f docker-compose.ssl.yml up -d certbot

clean:
	@echo "WARNING: This will remove all volumes and images!"
	@read -p "Continue? [y/N] " ans; [ "$$ans" = "y" ] || exit 1
	docker compose -f docker-compose.prod.yml down -v
	docker system prune -af --volumes
