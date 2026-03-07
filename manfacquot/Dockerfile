# Use a base image with Conda/Mamba pre-installed
FROM mambaorg/micromamba:latest

USER root
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --chown=$MAMBA_USER:$MAMBA_USER environment.yml .
COPY --chown=$MAMBA_USER:$MAMBA_USER requirements.txt .

# Create environment from environment.yml
RUN micromamba install -y -n base -f environment.yml && \
    micromamba clean --all --yes

# Copy the rest of the application
COPY --chown=$MAMBA_USER:$MAMBA_USER . .

# Set environment variables
ENV PATH /opt/conda/bin:$PATH
ENV DJANGO_SETTINGS_MODULE=gmqp_project.settings
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Run gunicorn through micromamba to ensure the environment is active
CMD ["micromamba", "run", "-n", "base", "gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "gmqp_project.wsgi:application"]
