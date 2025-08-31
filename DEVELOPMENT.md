end show anything # Development Guide

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd retail-inventory-platform
./setup.sh
```

### 2. Start Services

```bash
# Start database and Redis
docker-compose up -d postgres redis

# Start backend (in one terminal)
cd backend
source venv/bin/activate
python main.py

# Start frontend (in another terminal)
cd frontend
npm run dev
```

### 3. Access the Platform

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432

## 🏗️ Architecture Overview

### Backend (Python/FastAPI)

```
backend/
├── api/                    # API endpoints
│   ├── endpoints/         # Route handlers
│   └── middleware/        # Custom middleware
├── core/                  # Core business logic
│   ├── forecasting/       # Demand forecasting models
│   ├── optimization/      # PO optimization engine
│   └── data_quality/      # Data validation
├── models/                # Database models & schemas
├── services/              # Business logic services
└── utils/                 # Utility functions
```

### Frontend (React/TypeScript)

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── stores/           # State management (Zustand)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript type definitions
```

## 🔧 Development Workflow

### Backend Development

1. **API Development**: Add new endpoints in `backend/api/endpoints/`
2. **Models**: Update database models in `backend/models/`
3. **Business Logic**: Implement core logic in `backend/core/`
4. **Testing**: Run tests with `pytest`

### Frontend Development

1. **Components**: Create reusable components in `frontend/src/components/`
2. **Pages**: Add new pages in `frontend/src/pages/`
3. **State**: Manage state with Zustand stores
4. **Styling**: Use Chakra UI components and custom CSS

### Database Changes

1. **Models**: Update SQLAlchemy models
2. **Migrations**: Create Alembic migrations
3. **Schema**: Update Pydantic schemas

## 📊 Key Features Implementation

### 1. Demand Forecasting

- **Location**: `backend/core/forecasting/models.py`
- **API**: `backend/api/endpoints/forecasting.py`
- **Frontend**: `frontend/src/pages/Forecasting.tsx`

### 2. Inventory Management

- **Models**: `backend/models/database.py` (Inventory class)
- **API**: `backend/api/endpoints/inventory.py`
- **Frontend**: `frontend/src/pages/Inventory.tsx`

### 3. Purchase Orders

- **Models**: `backend/models/database.py` (PurchaseOrder classes)
- **API**: `backend/api/endpoints/purchase_orders.py`
- **Frontend**: `frontend/src/pages/PurchaseOrders.tsx`

### 4. Supplier Management

- **Models**: `backend/models/database.py` (Supplier class)
- **API**: `backend/api/endpoints/suppliers.py`
- **Frontend**: `frontend/src/pages/Suppliers.tsx`

## 🧪 Testing

### Backend Testing

```bash
cd backend
pytest tests/ -v
pytest tests/ --cov=core --cov-report=html
```

### Frontend Testing

```bash
cd frontend
npm test
npm run test:coverage
```

## 🚀 Deployment

### Development

```bash
docker-compose up -d
```

### Production

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Adding New Features

### 1. New API Endpoint

```python
# backend/api/endpoints/new_feature.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_feature():
    return {"message": "New feature"}
```

### 2. New Frontend Page

```typescript
// frontend/src/pages/NewFeature.tsx
import React from "react";

const NewFeature = () => {
  return <div>New Feature Page</div>;
};

export default NewFeature;
```

### 3. Update Routing

```typescript
// frontend/src/App.tsx
<Route path="/new-feature" element={<NewFeature />} />
```

## 🔍 Debugging

### Backend Debugging

- Use FastAPI's built-in debug mode
- Check logs in terminal
- Use `/docs` endpoint for API testing

### Frontend Debugging

- Browser DevTools
- React DevTools extension
- Console logging

### Database Debugging

- Connect to PostgreSQL: `psql -h localhost -U retail_user -d retail_inventory`
- Check logs: `docker-compose logs postgres`

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Chakra UI Documentation](https://chakra-ui.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Update documentation
5. Submit a pull request

## 🆘 Getting Help

- Check the logs for error messages
- Review the API documentation at `/docs`
- Check the development console in the browser
- Review the database schema and models
