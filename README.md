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
  
Welcome to the Quotanic project repository. This project consists of two main components:

1. **`manfacquot`**: The core Quotanic application. It is an advanced AI-driven manufacturing quotation and management system. It features a powerful Feature-Based Manufacturing (FBM) engine that automatically analyzes CAD files to estimate costs and generate manufacturing plans. It is built using **Django** for the backend and **React+Vite** for the frontend within the same directory.
2. **`front end `**: An AI Studio application prototype/frontend containing its own React application.

---

## Getting Started

To get the entire project up and running, you will need to start the respective servers for the components you wish to work on.

### 1. Main Application (`manfacquot`)

#### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Redis** (for Celery background tasks)

#### Backend Setup
```bash
cd manfacquot

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create a superuser account for the admin panel (optional but recommended)
python manage.py createsuperuser

# Start the Django development server
python manage.py runserver
```
The backend API will run at `http://localhost:8000`.

*Note: For Celery tasks (like FBM CAD processing), you need to run the Celery worker in a separate terminal inside the `manfacquot` folder:*
```bash
celery -A gmqp_project worker --loglevel=info --pool=solo
```

#### Frontend Setup (Inside `manfacquot`)
Open a new terminal and navigate to the `manfacquot` directory.
```bash
cd manfacquot

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
The application frontend will be available at `http://localhost:5173` (or the port specified by Vite).

---

##  Further Documentation

- For detailed backend and API documentation, refer to `manfacquot/README.md` and `manfacquot/FBM/API_DOCUMENTATION.md`.
- Ensure all environment variables are correctly set up. You can refer to `manfacquot/.env.example` to create your `.env` file for the main application.
