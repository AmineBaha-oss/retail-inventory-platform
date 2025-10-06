# Quick Start Guide

Get the Retail Inventory Platform up and running in minutes with this comprehensive quick start guide.

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Git** (2.30+)
- **Node.js** (18+) - for frontend development
- **Java 21** - for backend development (optional for Docker-only setup)

## ⚡ 5-Minute Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/retail-inventory-platform.git
cd retail-inventory-platform
```

### 2. Start All Services

```bash
# Start the entire platform
docker-compose up -d

# Check service status
docker-compose ps
```

### 3. Access the Platform

Once all services are running, access the platform at:

| Service               | URL                        | Description           |
| --------------------- | -------------------------- | --------------------- |
| **Frontend**          | http://localhost:3000      | Main web application  |
| **Spring Boot API**   | http://localhost:8080      | Core business logic   |
| **ML API**            | http://localhost:8000      | Forecasting services  |
| **API Documentation** | http://localhost:8000/docs | Interactive API docs  |
| **Grafana**           | http://localhost:3001      | Monitoring dashboards |
| **Prometheus**        | http://localhost:9090      | Metrics collection    |

### 4. Verify Installation

```bash
# Check all services are healthy
curl http://localhost:8080/api/actuator/health
curl http://localhost:8000/health
curl http://localhost:3000
```

## 🎯 First Steps

### 1. Create Your First User

Navigate to http://localhost:3000 and register a new account:

1. Click "Register" on the login page
2. Fill in your details (email, password, name)
3. Complete the registration process
4. Log in with your credentials

### 2. Set Up Your First Store

1. Go to **Stores** in the navigation
2. Click "Add Store"
3. Enter store details:
   - Name: "Main Store"
   - Address: "123 Main St, City, State"
   - Type: "Retail"
4. Save the store

### 3. Add Your First Product

1. Navigate to **Products**
2. Click "Add Product"
3. Enter product information:
   - SKU: "PROD-001"
   - Name: "Sample Product"
   - Category: "General"
   - Unit Cost: $10.00
4. Save the product

### 4. Set Up Inventory

1. Go to **Inventory**
2. Click "Add Inventory Item"
3. Select your store and product
4. Set initial stock level (e.g., 100 units)
5. Save the inventory item

### 5. Generate Your First Forecast

1. Navigate to **Forecasting**
2. Select your store and product
3. Click "Generate Forecast"
4. Review the P50 and P90 predictions
5. Analyze the forecast components

## 🔧 Development Setup

### Backend Development

```bash
# Start database and Redis only
docker-compose up -d postgres redis

# Run Spring Boot locally
cd backend
./mvnw spring-boot:run

# Run ML API locally
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Development

```bash
# Start database and backend services
docker-compose up -d postgres redis spring-api ml-api

# Run frontend locally
cd frontend
npm install
npm run dev
```

## 📊 Explore the Features

### Dashboard Overview

- **KPI Cards**: Key performance indicators
- **Sales Trends**: Historical sales data
- **Inventory Status**: Current stock levels
- **Forecast Accuracy**: Model performance metrics

### Inventory Management

- **Stock Levels**: Real-time inventory tracking
- **Reorder Points**: Automated reorder suggestions
- **Stock Adjustments**: Manual inventory corrections
- **Multi-Store View**: Cross-location inventory

### Forecasting Engine

- **Probabilistic Forecasts**: P50/P90 quantiles
- **Seasonality Detection**: Automatic pattern recognition
- **Holiday Effects**: Built-in holiday calendar
- **Model Performance**: Accuracy metrics and validation

### Purchase Orders

- **Automated Generation**: AI-powered PO creation
- **Approval Workflow**: Multi-level approval process
- **PDF Generation**: Professional PO documents
- **Supplier Management**: Vendor information and history

## 🧪 Test the System

### 1. Load Sample Data

```bash
# Load test data
docker-compose exec spring-api ./scripts/load-test-data.sh
```

### 2. Generate Test Forecasts

```bash
# Train a forecasting model
curl -X POST http://localhost:8000/api/v1/forecasting/train \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "PROD-001",
    "store_id": "STORE-001",
    "sales_data": [
      {"date": "2024-01-01", "quantity_sold": 10},
      {"date": "2024-01-02", "quantity_sold": 15}
    ]
  }'
```

### 3. Test Reorder Recommendations

```bash
# Get reorder suggestions
curl -X POST http://localhost:8000/api/v1/inventory/reorder-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "inventory_items": [
      {
        "product_id": "PROD-001",
        "store_id": "STORE-001",
        "current_inventory": 75,
        "unit_cost": 25.99
      }
    ],
    "config": {
      "service_level": 0.95,
      "lead_time_days": 7
    }
  }'
```

## 🔍 Monitor the System

### Grafana Dashboards

1. **System Overview**: http://localhost:3001

   - Login: admin / admin
   - Navigate to "Retail Inventory Dashboard"

2. **Key Metrics**:
   - API response times
   - Database performance
   - Memory and CPU usage
   - Business KPIs

### Prometheus Metrics

1. **Metrics Endpoint**: http://localhost:9090
2. **Key Metrics**:
   - `inventory_updates_total`
   - `forecasts_generated_total`
   - `purchase_orders_created_total`
   - `api_requests_total`

## 🚨 Troubleshooting

### Common Issues

#### Services Not Starting

```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild if needed
docker-compose up --build
```

#### Database Connection Issues

```bash
# Check database status
docker-compose exec postgres pg_isready -U retail_user

# Reset database
docker-compose down -v
docker-compose up -d
```

#### Frontend Not Loading

```bash
# Check if frontend is running
curl http://localhost:3000

# Rebuild frontend
cd frontend
npm run build
```

### Health Checks

```bash
# Check all service health
curl http://localhost:8080/api/actuator/health
curl http://localhost:8000/health
curl http://localhost:3000

# Check database
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "SELECT 1;"
```

## 📚 Next Steps

### For Developers

1. Read [Development Guide](DEVELOPMENT.md)
2. Review [Coding Standards](CODING_STANDARDS.md)
3. Set up [Testing Environment](TESTING.md)

### For System Administrators

1. Review [Deployment Guide](DEPLOYMENT.md)
2. Configure [Monitoring](MONITORING.md)
3. Set up [Security](SECURITY.md)

### For End Users

1. Read [User Guide](USER_GUIDE.md)
2. Learn [Forecasting Features](FORECASTING.md)
3. Master [Inventory Management](INVENTORY_MANAGEMENT.md)

## 🆘 Getting Help

### Documentation

- [Complete Documentation Index](README.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [FAQ](FAQ.md)

### Support Channels

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides and references
- **Community**: Developer discussions and support

### Quick Commands

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart spring-api

# Check service status
docker-compose ps

# Access database
docker-compose exec postgres psql -U retail_user -d retail_inventory
```

---

**Congratulations!** You now have a fully functional Retail Inventory Platform running locally. Explore the features, test the forecasting capabilities, and start managing your inventory with intelligent automation.

**Next**: [Development Guide](DEVELOPMENT.md) for detailed development setup and workflows.
