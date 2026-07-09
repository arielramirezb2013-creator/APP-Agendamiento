# ===============================================================
# Rehavid Operaciones · Backend FastAPI
# Multi-stage build · imagen optimizada para Azure App Service
# ===============================================================
FROM python:3.11-slim AS builder

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# ─── Imagen final ─────────────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Usuario no-root (buena práctica)
RUN useradd -m -u 1000 rehavid && chown -R rehavid:rehavid /app

COPY --from=builder /root/.local /home/rehavid/.local
COPY --chown=rehavid:rehavid app/ ./app/

ENV PATH=/home/rehavid/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

USER rehavid

EXPOSE 8000

# Health check para Azure
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
