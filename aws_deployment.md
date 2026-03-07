Deployment Summary
The ManfacQuotanic full stack has been successfully deployed to AWS Mumbai (ap-south-1) and mapped to the domain quotanic.com.

Live URLs
Service	URL
Frontend	https://quotanic.com
Backend API	https://api.quotanic.com/api/
Demo Login Credentials
Role	Email	Password
Manufacturer	demo_mfg@quotanic.com	[MASKED]
Customer	purchasing@aerospacedynamics.com	[MASKED]
Recent Service Recovery
Fixed Frontend Security Warning: Identified that the "Broken HTTPS" warning was caused by the backend API (api.quotanic.com) being unreachable.
Service Recovery: Logged into the EC2 instance and restarted the Docker services (Django, Nginx, Celery).
SSL Verification: Confirmed that api.quotanic.com is now responding correctly over HTTPS, which resolves the Mixed Content issues on the main site.
Architecture
EC2 Instance - t3.micro
API Calls
React FrontendAWS Amplify(quotanic.com)
Nginx :443 (SSL)(api.quotanic.com)
Django API :8000Gunicorn
PostgreSQL :5432
Redis :6379
Celery Worker
S3 Bucketquotanic-fbm-designs-mumbai
AWS Resources Created
Resource	Details
EC2 Instance	i-07772c335f1884291 (t3.micro, Ubuntu 22.04)
EC2 Public IP	52.66.209.255
Security Group	QuotanicBackendSG (sg-065620d50b8259e1b) - ports 22, 80, 443, 8000
S3 Bucket	quotanic-fbm-designs-mumbai (CORS configured)
Amplify App	d26hyjmydbv3uo → d26hyjmydbv3uo.amplifyapp.com
SSH Key	quotanic-mumbai-key.pem (local)
Docker Containers on EC2
All 5 containers running via Docker Compose v2:

Container	Image	Ports
ubuntu-web-1	Custom (Python 3.11-slim)	8000
ubuntu-celery-1	Custom (Python 3.11-slim)	—
ubuntu-db-1	postgres:15-alpine	5432
ubuntu-redis-1	redis:7-alpine	6379
ubuntu-nginx-1	nginx:1.25-alpine	80
Changes Made
File	Change

Dockerfile
Removed frontend build stage (now on Amplify)

docker-compose.prod.yml
Added PostgreSQL container + ALLOWED_HOSTS env var

settings.py
Added CSRF_TRUSTED_ORIGINS, EC2 IP to ALLOWED_HOSTS, CSRF exemption middleware

middleware.py
New file: exempts /api/ from CSRF for JWT-based auth

utils/api.ts
Uses VITE_API_BASE_URL env var for API calls

index.tsx
Uses VITE_API_BASE_URL env var for API calls
Verification Results
✅ JWT token endpoint returns valid tokens: POST http://52.66.209.255:8000/api/auth/token/
✅ Django migrations applied successfully on PostgreSQL
✅ Demo data seeded (1 manufacturer, 1 customer, 60 historical designs)
✅ Amplify deployment status: SUCCEED
✅ SPA rewrite rules configured for client-side routing
SSH Access
bash
ssh -i quotanic-mumbai-key.pem ubuntu@52.66.209.255
Useful Commands
bash
# View container logs
sudo docker compose -f docker-compose.prod.yml logs web --tail 50
sudo docker compose -f docker-compose.prod.yml logs celery --tail 50
# Restart all services
sudo docker compose -f docker-compose.prod.yml restart
# Run Django management commands
sudo docker compose -f docker-compose.prod.yml exec web python manage.py <command>
NOTE

RDS PostgreSQL creation failed silently across multiple attempts, so PostgreSQL is hosted inside a Docker container on the same EC2 instance. Data persists via a volume mount at ./postgres_data.