# Notes & Observations

**Freeform Observations:**
- The `manfacquot/index.tsx` file is exceptionally large (~240KB) and has a backup (`index.tsx.bak`). This strongly suggests it's a prime candidate for refactoring into smaller, modular React components.
- The presence of scripts like `simulate_pricing.py`, `test_matcher.py`, and `fix_pricing_structure.py` indicates that the core business logic around the FBM engine is actively being tuned and tested.
- The use of Docker (`Dockerfile`, `docker-compose.prod.yml`) and `nginx/` suggests a containerized deployment strategy, likely on AWS (given `aws_deployment.md` in the root).

**Things to Revisit:**
- The relationship and communication between the standalone `front end` AI Studio and the main `manfacquot` application.
- The exact algorithms used in the FBM engine for feature recognition.
