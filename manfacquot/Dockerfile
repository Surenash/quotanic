# Use a stable Miniconda image
FROM continuumio/miniconda3:latest

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libarchive-dev \
    swig \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create environment
# Note: pythonocc-core is best installed from conda-forge
RUN conda install -y -c conda-forge \
    python=3.11 \
    pythonocc-core \
    gunicorn \
    pip && \
    conda clean -afy

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Run collectstatic
# Note: We set a dummy SECRET_KEY if needed for the build step
RUN DJANGO_SECRET_KEY=dummy python manage.py collectstatic --noinput

# Set environment variables
ENV DJANGO_SETTINGS_MODULE=gmqp_project.settings
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "gmqp_project.wsgi:application"]
