# Retail Inventory Management Platform

A comprehensive retail inventory management system with intelligent demand forecasting, automated purchase order generation, and real-time analytics.

## Architecture

The platform consists of three main components:

- **Spring Boot API** - Main business logic, GraphQL/REST APIs, authentication
- **ML API (FastAPI)** - Probabilistic forecasting with Prophet models
- **React Frontend** - Modern web interface with real-time updates

## Technology Stack

### Backend Services
- **Java 21** with Spring Boot 3.x
- **Python 3.13** with FastAPI
- **PostgreSQL 15** with TimescaleDB extension
- **Redis** for caching and session management
- **GraphQL** for efficient data queries
- **JWT** authentication with RBAC

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Chakra UI** for component library
- **Axios** for API communication

### Infrastructure
- **Docker** and Docker Compose for containerization
- **Prometheus** for metrics collection
- **Grafana** for monitoring dashboards
- **dbt** for data transformation and testing

## Features

### Core Functionality
- **Multi-store inventory management**
- **Probabilistic demand forecasting** (P50/P90 quantiles)
- **Automated reorder point calculations**
- **Purchase order generation and approval workflow**
- **Real-time inventory tracking**

### Advanced Features
- **GraphQL API** for efficient data queries
- **Webhook integration** (Shopify, Lightspeed)
- **PDF generation** for purchase orders
- **Email notifications** and alerts
- **Server-sent events** for real-time updates
- **Comprehensive audit trails**
- **Data analytics** with dbt transformations

### Observability
- **Prometheus metrics** collection
- **Grafana dashboards** for monitoring
- **Health checks** for all services
- **Structured logging** with audit trails

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Java 21 (for local development)
- Node.js 18+ (for frontend development)

### Running the Application

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd retail-inventory-platform
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the services**
   - Frontend: http://localhost:3000
   - Spring Boot API: http://localhost:8080
   - ML API: http://localhost:8000
   - Grafana: http://localhost:3001
   - Prometheus: http://localhost:9090

### Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React web application |
| Spring Boot API | http://localhost:8080 | Main business logic API |
| ML API | http://localhost:8000 | Forecasting and ML services |
| ML API Docs | http://localhost:8000/docs | FastAPI documentation |
| Grafana | http://localhost:3001 | Monitoring dashboards |
| Prometheus | http://localhost:9090 | Metrics collection |

## Development

### Backend Development

#### Spring Boot API
```bash
cd backend
./mvnw spring-boot:run
```

#### ML API
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Setup

The application uses TimescaleDB for time-series data optimization:

```sql
-- TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Sales data hypertable
CREATE TABLE sales_daily (
    store_id text NOT NULL,
    sku text NOT NULL,
    date date NOT NULL,
    qty_sold numeric,
    revenue numeric,
    PRIMARY KEY (store_id, sku, date)
);
SELECT create_hypertable('sales_daily', 'date');

-- Forecasts hypertable
CREATE TABLE forecasts_daily (
    store_id text NOT NULL,
    sku text NOT NULL,
    date date NOT NULL,
    p50 numeric,
    p90 numeric,
    model_version text,
    PRIMARY KEY (store_id, sku, date)
);
SELECT create_hypertable('forecasts_daily', 'date');
```

## API Documentation

### Spring Boot API
- **GraphQL Playground**: http://localhost:8080/graphiql
- **REST API**: http://localhost:8080/api/v1
- **Actuator**: http://localhost:8080/actuator

### ML API
- **OpenAPI Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Forecasting
- `POST /api/v1/forecasting/train` - Train forecasting model
- `POST /api/v1/forecasting/generate` - Generate forecasts
- `GET /api/v1/forecasting/{product_id}` - Get product forecasts

#### Inventory
- `GET /api/v1/inventory/` - List inventory items
- `POST /api/v1/inventory/reorder-recommendations` - Get reorder suggestions

#### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User authentication

## Configuration

### Environment Variables

#### Spring Boot API
```bash
DB_HOST=postgres
DB_PORT=5432
DB_NAME=retail_inventory
DB_USERNAME=retail_user
DB_PASSWORD=retail_password
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-secret-key-here
ML_API_BASEURL=http://ml-api:8000
```

#### ML API
```bash
DATABASE_URL=postgresql://retail_user:retail_password@postgres:5432/retail_inventory
REDIS_URL=redis://redis:6379
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Monitoring

### Grafana Dashboards
- **System Overview**: Key performance indicators
- **Inventory Metrics**: Stock levels and turnover
- **Forecast Accuracy**: Model performance tracking
- **API Performance**: Response times and error rates

### Prometheus Metrics
- `inventory_updates_total` - Inventory update counter
- `forecasts_generated_total` - Forecast generation counter
- `purchase_orders_created_total` - PO creation counter
- `webhooks_processed_total` - Webhook processing counter

## Data Analytics

The platform includes a dbt project for data transformation and testing:

```bash
cd dbt
dbt deps
dbt run
dbt test
```

### Key Models
- **Staging models**: Raw data cleaning and validation
- **Marts models**: Business-ready data marts
- **Metrics models**: KPI calculations and aggregations

## Security

- **JWT-based authentication** with configurable expiration
- **Role-based access control** (RBAC)
- **CORS configuration** for cross-origin requests
- **HMAC verification** for webhook security
- **Audit trails** for all state changes

## Deployment

### Production Considerations
- Use environment-specific configuration files
- Set up proper SSL/TLS certificates
- Configure production database credentials
- Set up monitoring and alerting
- Implement backup strategies for TimescaleDB

### Scaling
- **Horizontal scaling**: Multiple API instances behind load balancer
- **Database scaling**: TimescaleDB clustering for high availability
- **Caching**: Redis clustering for distributed caching
- **Message queues**: Kafka for event-driven architecture

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/docs` directory
- Review the API documentation at the service endpoints