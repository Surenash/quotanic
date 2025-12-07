
# Quotanic (ManfacQuot)

**Quotanic** is an advanced AI-driven manufacturing quotation and management system designed to streamline the interaction between customers and manufacturers. It features a powerful **Feature-Based Manufacturing (FBM)** engine that automatically analyzes CAD files to estimate costs, select tools, and generate manufacturing plans.

## Key Features

*   **Automated CAD Analysis**:
    *   Supports **STEP** and **IGES** file formats.
    *   **Feature Recognition**: Automatically detects holes, pockets, slots, and other geometric features.
    *   **Geometry Analysis**: Calculates volume, surface area, bounding boxes, and stock requirements.
*   **Smart Quotation Engine**:
    *   **Dynamic Cost Estimation**: Real-time pricing based on material costs, machine time, labor, and overhead.
    *   **14-Point Costing Model**: Detailed breakdown including setup, tooling, and inspection costs.
*   **Manufacturer Portal**:
    *   Manage incoming RFQs (Requests for Quotation).
    *   Track active orders and production status.
*   **Order Management**:
    *   End-to-end order tracking from placement to delivery.
    *   Integrated **Razorpay** payment gateway.
*   **Interactive 3D Viewer**: Visualize CAD models directly in the browser.

## Technology Stack

### Backend
*   **Framework**: Django 5.2 (Python)
*   **API**: Django REST Framework
*   **Task Queue**: Celery + Redis
*   **CAD Processing**: `numpy-stl`, `python-occ-core` (via Conda), `numpy`
*   **Authentication**: JWT (JSON Web Tokens)

### Frontend
*   **Framework**: React 18
*   **Build Tool**: Vite
*   **Language**: TypeScript
*   **Styling**: CSS Modules / Tailwind (configurable)

##  Prerequisites

*   **Python 3.10+**
*   **Node.js 18+**
*   **Redis** (for Celery task queue)
*   **Conda** (Recommended for installing `python-occ-core`)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Surenash/quotanic.git
cd quotanic
```

### 2. Backend Setup
It is recommended to use a virtual environment.

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Note: For CAD analysis features, you may need to install python-occ-core via Conda:
# conda install -c conda-forge python-occ-core
```

**Database & Migrations**:
```bash
python manage.py migrate
python manage.py createsuperuser  # Create an admin account
```

### 3. Frontend Setup
Navigate to the root directory (where `package.json` is located).

```bash
npm install
```

### 4. Configuration
Create a `.env` file in the project root if one doesn't exist (see `.env.example` if available) to configure:
*   `SECRET_KEY`
*   `DEBUG`
*   `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
*   `REDIS_URL`

## Usage

### Start the Backend Server
```bash
python manage.py runserver
```
The API will be available at `http://localhost:8000`.

### Start the Frontend Development Server
```bash
npm run dev
```
The application will run at `http://localhost:5173`.

### Start Celery Worker (Required for FBM & Async Tasks)
```bash
celery -A gmqp_project worker --loglevel=info --pool=solo
```

##  Documentation

*   **API Documentation**: See [FBM/API_DOCUMENTATION.md](FBM/API_DOCUMENTATION.md) for detailed API endpoints.
*   **FBM System**: See [FBM/README.md](FBM/README.md) for details on the Feature-Based Manufacturing engine.

##  Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.

##  License
This project is licensed under the MIT License.
