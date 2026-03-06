# Serve with Django API
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (needed for certain python packages)
# libgl1 is the modern replacement for libgl1-mesa-glx in newer Debian
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Create staticfiles directory (Static Root)
RUN mkdir -p /app/staticfiles

# Collect static files
# We pass dummy environment variables because collectstatic loads settings.py,
# which might require certain env vars to be present (even if not used)
# and we want to prevent connection errors to DB during build if possible (though collectstatic checks DB).
# Setting DATABASE_URL to sqlite should be safe if we don't have one.
RUN DJANGO_SECRET_KEY=build-key DEBUG=False python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run gunicorn
# Note: Workers should be adjusted based on CPU cores (e.g., 2-4)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "gmqp_project.wsgi:application"]
