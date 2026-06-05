# AI Nutrition Label Scanner - Backend Phase 1

This is the foundation for the FastAPI backend.

## Tech Stack
- FastAPI
- PostgreSQL (NeonDB compatible)
- Redis
- SQLAlchemy 2.0 & Alembic
- Docker & Docker Compose

## Getting Started Locally

### With Docker (Recommended)
1. Copy `.env.example` to `.env` and fill in your variables.
2. Run `docker-compose up -d --build`.
3. The API will be available at `http://localhost:8000`.

### Local Python Environment
1. Create a virtual environment: `python -m venv venv`
2. Activate it: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
3. Install dependencies: `pip install -r requirements.txt`
4. Start the server: `uvicorn app.main:app --reload`
