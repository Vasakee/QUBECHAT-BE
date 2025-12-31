# Dockerfile for Docling PDF Processing Service
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies: curl (health check), poppler (pdf2image), tesseract-ocr (pytesseract)
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    poppler-utils \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies with increased timeout for large packages
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt

# Copy application code
COPY main.py .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-5000}/health || exit 1

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=5000

# Run the application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
