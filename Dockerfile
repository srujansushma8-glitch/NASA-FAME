# Multi-stage / lean Python container for NASA-FLAME FastAPI Backend
FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing .pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install essential system libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./backend/requirements.txt

# Copy application source directories
COPY backend/ ./backend/
COPY simulation/ ./simulation/
COPY ai-engine/ ./ai-engine/
COPY database/ ./database/
COPY research/ ./research/

# Cloud Run defaults to port 8080
ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Start Uvicorn ASGI server
CMD ["sh", "-c", "exec uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}"]

