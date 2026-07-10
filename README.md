# Electrical Shop Management System (ESMS)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker)](https://docker.com)

Production-ready ERP system for electrical shops. Manages inventory, sales (POS), purchases, customers, suppliers, employees, expenses, payments, and accounting — all in a single dashboard.

## Features

- **Point of Sale** — Quick sale with product search, cart, barcode input, and payment recording
- **Inventory** — Real-time stock tracking, movement history, low-stock alerts, CSV import/export
- **Sales** — Invoices, refunds (full/partial), credit limit enforcement, quotation-to-sale conversion
- **Purchases** — Purchase orders with 5-status workflow, partial receiving, returns
- **Customers & Suppliers** — Credit limits, outstanding balances, loyalty points, purchase history
- **Payments** — Multiple methods (cash, card, transfer, cheque, mobile), inflow/outflow tracking
- **Expenses** — Categorized expense tracking with receipt upload
- **Employees** — Role-based access, attendance with clock-in/out
- **Accounting** — Double-entry journal, chart of accounts, financial reports (P&L, balance sheet, cash flow)
- **Reports** — 14 report types (daily/monthly/yearly sales, profit, inventory, expenses, tax) in JSON/PDF/XLSX
- **Dashboard** — Live KPIs: today's sales/expenses/profit, low stock, top products, recent invoices
- **Notifications** — 8 notification types for stock alerts, payment reminders, low credit
- **Global Search** — Unified search across products, customers, suppliers, sales, purchases

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.12+, Django 5.0, DRF 3.15 |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Zustand, TanStack Query |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **File Storage** | MinIO (S3-compatible) |
| **Task Queue** | Celery + Redis |
| **Reverse Proxy** | Nginx 1.25 |
| **Container** | Docker Compose |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.12+ (for local backend dev)

### Windows

Double-click `scripts\setup.bat` (no restrictions, auto-elevates to Administrator).

Or manually:
```powershell
# Run PowerShell as Administrator, then:
.\scripts\setup.ps1
```

The script automatically installs WSL2 if needed, configures Docker Desktop, generates a `.env` file with a random secret key, builds the stack, runs migrations, and creates an admin user.

### Linux / macOS

```bash
git clone <repo-url> && cd esms
cp .env.example .env
# Edit .env with your settings

# Production build & start
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate --noinput
```

### Run locally (dev)

```bash
# Infrastructure
docker compose up -d db redis minio

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements/dev.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

Access: http://localhost (production) or http://localhost:5173 (dev) — login: `admin` / `admin123`

## Environment Variables

Key variables (see `.env.example` for full list):

| Variable | Default | Description |
|----------|---------|-------------|
| `DJANGO_SECRET_KEY` | — | Django secret key (change in production) |
| `DJANGO_DEBUG` | `False` | Debug mode |
| `DJANGO_ALLOWED_HOSTS` | `localhost` | Comma-separated allowed hosts |
| `POSTGRES_PASSWORD` | `esms_password` | Database password |
| `REDIS_PASSWORD` | — | Redis password |
| `VITE_API_URL` | `/api/v1` | API base URL (use `/api/v1` for same-origin) |

## Deployment

```bash
# Production build & start
make build
make up

# SSL certificates (Let's Encrypt)
make ssl-init DOMAIN=yourdomain.com

# Backup
make backup

# Full deploy script
./scripts/deploy.sh
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

## Architecture

```
┌─────────┐   ┌──────────┐   ┌───────────┐
│ Browser │──▶│  Nginx   │──▶│  Backend   │──▶ PostgreSQL
└─────────┘   │  (80/443)│   │  (8000)   │──▶ Redis
              └──────────┘   │           │──▶ MinIO
                             └─────┬─────┘
                                   │
                          ┌────────▼───────┐
                          │  Celery Worker  │
                          │  + Celery Beat  │
                          └────────────────┘
```

## Tests

```bash
# Backend (102 tests)
cd backend && python -m pytest

# Frontend (24 tests)
cd frontend && npm test

# With coverage
python -m pytest --cov=apps --cov-report=term
```

## License

[MIT](LICENSE)
