# User Personas

## Persona 1: The Manufacturer (Service Provider)
**Role:** Owner or Production Manager at a CNC Machine Shop or Sheet Metal facility.
**Goals:**
- Quickly set up their machine capabilities, materials, and pricing formulas.
- Automatically generate accurate quotes for incoming RFQs (Requests for Quote).
- Manage accepted orders through to delivery.
**Frustrations:**
- Spending hours manually calculating costs from complex CAD files.
- Inconsistent pricing due to human error.
- Software that doesn't understand the nuances of their specific machines.

## Persona 2: The Engineer (Customer)
**Role:** Mechanical or Design Engineer at a product company.
**Goals:**
- Upload CAD models and get instant, accurate manufacturability feedback.
- Receive transparent and competitive pricing from vetted manufacturers.
- Track the status of their ordered parts.
**Frustrations:**
- Waiting days for a quote.
- Receiving parts that don't meet specifications because of miscommunication.
- Clunky, slow web interfaces for uploading large CAD assemblies.

## Persona 3: The System Admin / Developer
**Role:** The person maintaining and deploying the Quotanic platform.
**Goals:**
- Keep the system stable, secure, and fast.
- Easily debug failing FBM tasks or UI errors.
- Deploy updates seamlessly (using Docker, as indicated by `Dockerfile` and `docker-compose.prod.yml`).
**Frustrations:**
- Poor documentation or inconsistent architectural decisions.
- Unhandled exceptions in asynchronous workers (Celery).
