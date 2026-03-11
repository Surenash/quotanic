# Integrations & Connections

**Active Integrations:**
1. **PostgreSQL:** (Assumed based on Django standards) Primary relational database for user accounts, orders, quotes, and manufacturer settings.
2. **Redis:** Message broker for Celery asynchronous task processing (crucial for the FBM engine's CAD analysis) and potential caching.
3. **AWS (Amazon Web Services):** As indicated by `aws_deployment.md` and `amplify.yml`, AWS is used for hosting and deployment, potentially utilizing S3 for storing CAD files and EC2/ECS/Amplify for application hosting.

**Planned Integrations:**
- Email Service Provider (e.g., SendGrid or AWS SES) for quote and order notifications (likely integrated within the `notifications/` app).
- Payment Gateway (e.g., Stripe) for processing payments on accepted quotes.

**Rejected Tools:**
- Synchronous processing of CAD files (rejected in favor of Celery/Redis due to timeout risks).
