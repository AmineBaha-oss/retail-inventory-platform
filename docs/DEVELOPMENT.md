# Development Guide

## Local Development Setup

### Prerequisites
- Docker and Docker Compose
- Java 21
- Node.js 18+
- Python 3.13
- Git

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd retail-inventory-platform
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up -d postgres redis prometheus grafana
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

### Backend Development

#### Spring Boot API
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

**Key endpoints:**
- GraphQL Playground: http://localhost:8080/graphiql
- REST API: http://localhost:8080/api/v1
- Health check: http://localhost:8080/actuator/health

#### ML API
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Key endpoints:**
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

**Access:** http://localhost:3000

## Database Development

### TimescaleDB Setup
```sql
-- Connect to the database
docker exec -it retail_inventory_db psql -U retail_user -d retail_inventory

-- Create hypertables
CREATE EXTENSION IF NOT EXISTS timescaledb;
SELECT create_hypertable('sales_daily', 'date');
SELECT create_hypertable('forecasts_daily', 'date');
```

### Sample Data
```sql
-- Insert sample sales data
INSERT INTO sales_daily (store_id, sku, date, qty_sold, revenue) VALUES
('store-1', 'product-1', '2024-01-01', 10, 100.00),
('store-1', 'product-1', '2024-01-02', 12, 120.00);
```

## API Development

### GraphQL Schema
The GraphQL schema is defined in `backend/src/main/resources/graphql/schema.graphqls`

**Key queries:**
```graphql
query {
  stores {
    id
    name
    code
  }
  
  inventoryByStore(storeId: "store-id") {
    product {
      sku
      name
    }
    quantityOnHand
  }
}
```

**Key mutations:**
```graphql
mutation {
  updateInventory(input: {
    storeId: "store-id"
    productId: "product-id"
    quantityOnHand: 100
  }) {
    id
    quantityOnHand
  }
}
```

### REST API Endpoints

#### Authentication
```bash
# Register user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

#### Forecasting
```bash
# Train model
curl -X POST http://localhost:8000/api/v1/forecasting/train \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "product-1",
    "store_id": "store-1",
    "sales_data": [...]
  }'

# Generate forecast
curl -X POST http://localhost:8000/api/v1/forecasting/generate \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "product-1",
    "store_id": "store-1",
    "horizon_days": 30
  }'
```

## Testing

### Backend Testing
```bash
# Spring Boot tests
cd backend
./mvnw test

# ML API tests
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
npm run test:coverage
```

### Integration Testing
```bash
# Start all services
docker-compose up -d

# Run integration tests
./scripts/run-integration-tests.sh
```

## Code Quality

### Backend Standards
- **Java**: Follow Google Java Style Guide
- **Python**: Follow PEP 8 with Black formatting
- **Testing**: Minimum 80% code coverage
- **Documentation**: Javadoc for public APIs

### Frontend Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Testing**: Jest and React Testing Library

### Git Workflow
1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Run tests and linting
4. Create pull request
5. Code review and merge

## Debugging

### Spring Boot Debugging
```bash
# Enable debug logging
export LOGGING_LEVEL_COM_RETAILINVENTORY=DEBUG

# Remote debugging
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

### ML API Debugging
```bash
# Enable debug mode
export DEBUG=true

# Python debugging
python -m pdb main.py
```

### Database Debugging
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC;
```

## Performance Optimization

### Database Optimization
- Use TimescaleDB compression for historical data
- Create appropriate indexes for query patterns
- Monitor query performance with pg_stat_statements

### API Optimization
- Implement caching for frequently accessed data
- Use GraphQL query optimization
- Monitor API response times

### Frontend Optimization
- Implement code splitting
- Use React.memo for expensive components
- Optimize bundle size with webpack-bundle-analyzer

## Monitoring and Observability

### Metrics Collection
- Prometheus scrapes metrics from all services
- Custom business metrics for KPIs
- Health checks for service availability

### Logging
- Structured logging with correlation IDs
- Centralized log aggregation
- Error tracking and alerting

### Dashboards
- Grafana dashboards for system overview
- Business metrics visualization
- Alert rules for critical issues

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database status
docker-compose ps postgres

# Check connection
docker exec retail_inventory_db pg_isready -U retail_user
```

#### ML API Issues
```bash
# Check ML API logs
docker logs retail_inventory_ml_api

# Test database connection
docker exec retail_inventory_ml_api python -c "
from models.database import AsyncSessionLocal
import asyncio
async def test():
    async with AsyncSessionLocal() as session:
        result = await session.execute('SELECT 1')
        print('Database connection OK')
asyncio.run(test())
"
```

#### Frontend Issues
```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

### Performance Issues
- Check database query performance
- Monitor memory usage in containers
- Review API response times
- Analyze frontend bundle size

## Contributing

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Submit pull request

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass and coverage is adequate
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact is considered
