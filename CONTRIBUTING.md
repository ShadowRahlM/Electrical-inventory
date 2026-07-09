# Contributing

## Setup

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in values
3. Backend: `cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements/dev.txt`
4. Frontend: `cd frontend && npm ci`
5. Run `docker compose up -d db redis minio` for infrastructure
6. Backend: `python manage.py migrate && python manage.py runserver`
7. Frontend: `npm run dev`

## Code Style

### Backend
- `black` for formatting (`black .`)
- `isort` for import sorting (`isort .`)
- `flake8` for linting (`flake8`)
- `mypy` for type checking (`mypy .`)

### Frontend
- `prettier` for formatting (`npx prettier --write .`)
- ESLint for linting (`npm run lint`)

## Testing

- Backend: `cd backend && python -m pytest`
- Frontend: `cd frontend && npm test`
- With coverage: `python -m pytest --cov=apps`

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and lint
4. Submit a PR using the template
5. Ensure CI passes

## Commit Messages

Follow conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
