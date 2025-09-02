# Architecture Overview

## System Architecture

The Retail Inventory Management Platform follows a microservices architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Spring Boot   │    │   ML API        │
│   (React/Vite)  │◄──►│   (GraphQL)     │◄──►│   (FastAPI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Grafana       │    │   TimescaleDB   │    │   Redis         │
│   (Dashboards)  │    │   (Hypertables) │    │   (Caching)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Prometheus    │    │   dbt Models    │    │   Webhooks      │
│   (Metrics)     │    │   (Analytics)   │    │   (Shopify/LS)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Component Responsibilities

### Spring Boot API (Port 8080)

- **Business Logic**: Core inventory management operations
- **Authentication**: JWT-based auth with RBAC
- **GraphQL API**: Efficient data queries and mutations
- **REST API**: Traditional CRUD operations
- **Webhook Processing**: External system integration
- **PDF Generation**: Purchase order documents
- **Email Services**: Notifications and alerts

### ML API (Port 8000)

- **Demand Forecasting**: Prophet-based probabilistic models
- **Model Training**: Automated model training and validation
- **Forecast Generation**: P50/P90 quantile predictions
- **Performance Metrics**: Model accuracy tracking
- **Data Processing**: Time-series data analysis

### Frontend (Port 3000)

- **User Interface**: React-based web application
- **Real-time Updates**: Server-sent events integration
- **Dashboard**: KPI visualization and monitoring
- **Inventory Management**: Stock level tracking and adjustments
- **Purchase Orders**: PO creation and approval workflow

### Database Layer

- **TimescaleDB**: Time-series optimized PostgreSQL
- **Hypertables**: sales_daily, forecasts_daily
- **Regular Tables**: stores, products, suppliers, users
- **Indexes**: Optimized for time-series queries

### Caching Layer

- **Redis**: Session storage and caching
- **Cache Keys**: User sessions, API responses, computed metrics
- **TTL Management**: Automatic cache expiration

### Monitoring Stack

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and alerting
- **Custom Metrics**: Business-specific KPIs
- **Health Checks**: Service availability monitoring

## Data Flow

### 1. Sales Data Ingestion

```
External Systems → Webhooks → Spring Boot API → TimescaleDB
```

### 2. Forecast Generation

```
TimescaleDB → ML API → Prophet Models → Forecasts → TimescaleDB
```

### 3. Reorder Calculations

```
Forecasts + Inventory → Reorder Service → Purchase Orders
```

### 4. Real-time Updates

```
State Changes → Audit Service → SSE → Frontend
```

## Security Architecture

### Authentication Flow

1. User credentials → JWT token generation
2. Token validation → Role-based access control
3. API requests → Token verification → Business logic

### Webhook Security

1. HMAC signature verification
2. Source validation (Shopify, Lightspeed)
3. Rate limiting and abuse prevention

### Data Protection

1. Encrypted connections (HTTPS/TLS)
2. Sensitive data encryption at rest
3. Audit trails for all operations

## Scalability Considerations

### Horizontal Scaling

- **API Services**: Multiple instances behind load balancer
- **Database**: Read replicas for query distribution
- **Cache**: Redis clustering for distributed caching

### Performance Optimization

- **Database**: TimescaleDB compression and partitioning
- **Caching**: Strategic cache placement and TTL
- **API**: GraphQL query optimization
- **Frontend**: Code splitting and lazy loading

## Deployment Architecture

### Development Environment

- Docker Compose for local development
- Hot reloading for rapid iteration
- Mock data for testing

### Production Environment

- Kubernetes orchestration
- Service mesh for communication
- CI/CD pipeline integration
- Monitoring and alerting

## Technology Decisions

### Why TimescaleDB?

- **Time-series optimization**: Built for temporal data
- **PostgreSQL compatibility**: Existing SQL knowledge
- **Hypertables**: Automatic partitioning by time
- **Compression**: Efficient storage for historical data

### Why GraphQL?

- **Efficient queries**: Fetch only needed data
- **Type safety**: Strong typing for API contracts
- **Real-time subscriptions**: Live data updates
- **Developer experience**: Self-documenting APIs

### Why Prophet for Forecasting?

- **Probabilistic forecasts**: P50/P90 quantiles
- **Seasonality handling**: Automatic trend detection
- **Robust to missing data**: Handles gaps gracefully
- **Business interpretability**: Clear forecast components
