# Retail Inventory Platform - Java Spring Boot Backend

## Overview

This is the Java Spring Boot backend for the **Multi-store Demand Forecasting & Auto-Replenishment Platform**. It provides a robust, enterprise-grade foundation for managing retail stores, inventory, and forecasting operations.

## Tech Stack

- **Framework**: Spring Boot 3.2.0
- **Java Version**: 17
- **Database**: PostgreSQL with TimescaleDB extension
- **ORM**: Spring Data JPA with Hibernate
- **Security**: Spring Security with JWT
- **API Documentation**: OpenAPI 3.0 (Swagger)
- **Caching**: Redis
- **Message Queue**: Apache Kafka
- **GraphQL**: Spring GraphQL
- **Testing**: JUnit 5, TestContainers
- **Build Tool**: Maven

## Architecture

The backend follows a clean, layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Controllers | Security | Exception Handling | Validation  │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Services | Business Logic | Transaction Management        │
├─────────────────────────────────────────────────────────────┤
│                     Domain Layer                           │
├─────────────────────────────────────────────────────────────┤
│  Entities | Repositories | Domain Services                 │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│  Database | Cache | Message Queue | External APIs          │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 🏪 **Store Management**

- Multi-store support (Retail, Warehouse, Pop-up, Outlet)
- Store performance metrics and analytics
- POS system integration (Shopify, Lightspeed, Square, WooCommerce)
- Geographic and timezone management

### 📊 **Performance Monitoring**

- Service level tracking (95%, 98%, etc.)
- Stockout rate monitoring with alerts
- Inventory turnover analysis
- Lead time optimization

### 🔄 **Data Integration**

- Real-time POS data synchronization
- Configurable sync frequencies
- Webhook support for external systems
- Data quality validation

### 🚀 **Advanced Analytics**

- Multi-dimensional filtering and search
- Performance benchmarking
- Risk assessment indicators
- Bulk operations support

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 13+
- Redis 6+
- Apache Kafka 2.8+

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd retail-inventory-platform/backend
   ```

2. **Configure environment variables**

   ```bash
   export DB_USERNAME=postgres
   export DB_PASSWORD=your_password
   export REDIS_HOST=localhost
   export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
   export JWT_SECRET=your-secret-key
   ```

3. **Start dependencies**

   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d postgres redis kafka

   # Or start services individually
   ```

4. **Build and run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

### API Endpoints

The application runs on `http://localhost:8080/api`

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **GraphiQL**: `http://localhost:8080/graphiql`
- **Health Check**: `http://localhost:8080/api/actuator/health`

## API Documentation

### Store Management Endpoints

| Method   | Endpoint                       | Description      | Auth Required |
| -------- | ------------------------------ | ---------------- | ------------- |
| `POST`   | `/api/v1/stores`               | Create new store | ADMIN/MANAGER |
| `GET`    | `/api/v1/stores`               | List all stores  | USER          |
| `GET`    | `/api/v1/stores/{id}`          | Get store by ID  | USER          |
| `PUT`    | `/api/v1/stores/{id}`          | Update store     | ADMIN/MANAGER |
| `DELETE` | `/api/v1/stores/{id}`          | Delete store     | ADMIN         |
| `POST`   | `/api/v1/stores/{id}/sync`     | Sync store data  | ADMIN/MANAGER |
| `POST`   | `/api/v1/stores/{id}/forecast` | Update forecast  | ADMIN/MANAGER |

### Advanced Features

- **Search & Filtering**: Multi-criteria store search
- **Bulk Operations**: Mass status updates, sync, and forecasting
- **Analytics**: Performance metrics and risk indicators
- **Real-time Updates**: WebSocket support for live data

## Database Schema

### Core Tables

- **stores**: Store information and configuration
- **inventories**: Inventory levels and tracking
- **products**: Product catalog and variants
- **suppliers**: Supplier profiles and constraints
- **purchase_orders**: Purchase order management
- **sales_transactions**: Sales data for forecasting

### Key Relationships

```
Store (1) ←→ (N) Inventory
Store (1) ←→ (N) SalesTransaction
Store (1) ←→ (N) PurchaseOrder
Product (1) ←→ (N) Inventory
Supplier (1) ←→ (N) PurchaseOrder
```

## Integration Points

### Python ML Service

- **Endpoint**: `http://localhost:8001` (configurable)
- **Purpose**: Demand forecasting and ML predictions
- **Protocol**: REST API with JSON payloads
- **Authentication**: API key or JWT

### External POS Systems

- **Shopify**: Webhook-based real-time sync
- **Lightspeed**: REST API integration
- **Square**: Webhook and API integration
- **WooCommerce**: REST API integration

## Security

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- OAuth2 support for external providers
- SSO integration capabilities

### Data Protection

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

## Performance & Scalability

### Caching Strategy

- Redis for session and data caching
- JPA second-level cache
- HTTP response caching

### Database Optimization

- Indexed queries for common operations
- Connection pooling
- Query optimization
- TimescaleDB for time-series data

### Monitoring & Observability

- Spring Boot Actuator
- Prometheus metrics
- OpenTelemetry tracing
- Structured logging

## Development

### Code Quality

- **Linting**: Checkstyle, PMD
- **Testing**: JUnit 5, Mockito, TestContainers
- **Coverage**: JaCoCo
- **Documentation**: JavaDoc, OpenAPI

### Testing Strategy

- **Unit Tests**: Service and repository layers
- **Integration Tests**: API endpoints
- **End-to-End Tests**: Full workflow validation
- **Performance Tests**: Load and stress testing

### Development Workflow

1. Feature branch creation
2. Code implementation with tests
3. Code review and approval
4. Integration testing
5. Deployment to staging
6. Production deployment

## Deployment

### Docker Support

```bash
# Build Docker image
docker build -t retail-inventory-backend .

# Run container
docker run -p 8080:8080 retail-inventory-backend
```

### Kubernetes Deployment

- Helm charts provided
- ConfigMap and Secret management
- Horizontal Pod Autoscaling
- Ingress configuration

### CI/CD Pipeline

- GitHub Actions workflow
- Automated testing
- Security scanning
- Deployment automation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Code review and approval

## License

[License Information]

## Support

For questions and support:

- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ for the retail industry**
