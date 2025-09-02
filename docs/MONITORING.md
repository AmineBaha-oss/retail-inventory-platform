# Monitoring and Observability Guide

This guide covers the complete monitoring and observability setup for the Retail Inventory Platform in production.

## Overview

The platform includes a comprehensive monitoring stack with:

- **Prometheus** for metrics collection
- **Grafana** for visualization and dashboards
- **Health checks** for all services
- **Structured logging** with audit trails
- **Alerting** for critical issues

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │───▶│   Prometheus    │───▶│     Grafana     │
│    Services     │    │   (Metrics)     │    │  (Dashboards)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Health        │    │   Alerting      │    │   Logging       │
│   Checks        │    │   Rules         │    │   Aggregation   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Metrics Collection

### Spring Boot API Metrics

The Spring Boot application exposes metrics via Actuator:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

**Key Metrics:**

- `http_server_requests_seconds` - HTTP request duration
- `jvm_memory_used_bytes` - JVM memory usage
- `jvm_gc_pause_seconds` - Garbage collection metrics
- `hikaricp_connections_active` - Database connection pool
- `spring_data_repository_invocations` - Repository method calls

### ML API Metrics

The FastAPI application includes custom metrics:

```python
from prometheus_client import Counter, Histogram, Gauge

# Custom metrics
forecast_requests = Counter('forecast_requests_total', 'Total forecast requests')
forecast_duration = Histogram('forecast_duration_seconds', 'Forecast processing time')
active_models = Gauge('active_models_count', 'Number of active ML models')
```

**Key Metrics:**

- `forecast_requests_total` - Total forecast requests
- `forecast_duration_seconds` - Forecast processing time
- `active_models_count` - Number of active ML models
- `http_requests_total` - HTTP request counter
- `http_request_duration_seconds` - HTTP request duration

### Database Metrics

TimescaleDB metrics via PostgreSQL exporter:

- `pg_stat_database_*` - Database statistics
- `pg_stat_user_tables_*` - Table statistics
- `pg_stat_user_indexes_*` - Index statistics

### Redis Metrics

Redis metrics via Redis exporter:

- `redis_connected_clients` - Connected clients
- `redis_used_memory_bytes` - Memory usage
- `redis_commands_processed_total` - Commands processed
- `redis_keyspace_hits_total` - Cache hit rate

## Grafana Dashboards

### 1. System Overview Dashboard

**Key Panels:**

- System load and CPU usage
- Memory utilization
- Disk I/O and space
- Network traffic
- Service health status

**Refresh Rate:** 30 seconds
**Time Range:** Last 1 hour

### 2. Application Performance Dashboard

**Key Panels:**

- Request rate and response times
- Error rates and status codes
- Database connection pool status
- Cache hit/miss ratios
- JVM metrics (heap, GC)

**Refresh Rate:** 15 seconds
**Time Range:** Last 4 hours

### 3. Business Metrics Dashboard

**Key Panels:**

- Inventory levels by store
- Forecast accuracy metrics
- Purchase order generation rate
- Supplier performance
- Revenue and sales trends

**Refresh Rate:** 1 minute
**Time Range:** Last 24 hours

### 4. ML Model Performance Dashboard

**Key Panels:**

- Model training frequency
- Forecast accuracy by product
- Prediction confidence intervals
- Model drift detection
- Training data quality

**Refresh Rate:** 5 minutes
**Time Range:** Last 7 days

## Alerting Rules

### Critical Alerts

```yaml
groups:
  - name: critical
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.instance }} is down"
          description: "Service {{ $labels.instance }} has been down for more than 1 minute"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.instance }}"
          description: "Error rate is {{ $value }} errors per second"

      - alert: DatabaseConnectionPoolExhausted
        expr: hikaricp_connections_active / hikaricp_connections_max > 0.9
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool nearly exhausted"
          description: "Connection pool usage is {{ $value | humanizePercentage }}"
```

### Warning Alerts

```yaml
- name: warning
  rules:
    - alert: HighMemoryUsage
      expr: jvm_memory_used_bytes / jvm_memory_max_bytes > 0.8
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High memory usage on {{ $labels.instance }}"
        description: "Memory usage is {{ $value | humanizePercentage }}"

    - alert: SlowResponseTime
      expr: histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m])) > 2
      for: 3m
      labels:
        severity: warning
      annotations:
        summary: "Slow response times on {{ $labels.instance }}"
        description: "95th percentile response time is {{ $value }}s"
```

## Health Checks

### Spring Boot Health Checks

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        // Check database connectivity
        // Check Redis connectivity
        // Check ML API connectivity
        // Check external service dependencies

        return Health.up()
            .withDetail("database", "UP")
            .withDetail("redis", "UP")
            .withDetail("ml-api", "UP")
            .build();
    }
}
```

### ML API Health Checks

```python
@app.get("/health")
async def health_check():
    checks = {
        "database": await check_database_connection(),
        "redis": await check_redis_connection(),
        "models": await check_model_availability()
    }

    status = "UP" if all(checks.values()) else "DOWN"
    return {"status": status, "checks": checks}
```

## Logging Configuration

### Structured Logging

```yaml
logging:
  level:
    com.retailinventory: INFO
    org.springframework.security: WARN
    org.hibernate.SQL: WARN
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: /var/log/retail-inventory/application.log
```

### Log Aggregation

For production, consider using:

- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Fluentd** for log forwarding
- **CloudWatch** (AWS) or **Stackdriver** (GCP)

## Monitoring Setup

### 1. Local Development

```bash
# Start monitoring stack
docker-compose up -d prometheus grafana

# Access Grafana
open http://localhost:3001
# Default credentials: admin/admin
```

### 2. Production Deployment

```bash
# Deploy with monitoring
kubectl apply -k k8s/

# Port forward to access Grafana
kubectl port-forward svc/grafana 3001:3000 -n retail-inventory
```

### 3. Configure Data Sources

1. **Prometheus Data Source:**

   - URL: `http://prometheus:9090`
   - Access: Server (default)

2. **Import Dashboards:**
   - Import dashboard JSON files from `grafana/dashboards/`
   - Configure data source mappings

## Performance Optimization

### Database Monitoring

```sql
-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Monitor table sizes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Cache Monitoring

```bash
# Redis memory usage
redis-cli info memory

# Cache hit rate
redis-cli info stats | grep keyspace
```

## Troubleshooting

### Common Issues

1. **High Memory Usage:**

   - Check JVM heap settings
   - Monitor garbage collection
   - Review memory leaks

2. **Slow Database Queries:**

   - Enable slow query logging
   - Analyze query execution plans
   - Check index usage

3. **Cache Misses:**
   - Review cache TTL settings
   - Check cache key patterns
   - Monitor cache eviction

### Debug Commands

```bash
# Check service health
curl http://localhost:8080/api/actuator/health

# View application logs
docker-compose logs -f spring-api

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Test ML API
curl http://localhost:8000/health
```

## Best Practices

1. **Set up proper alerting thresholds**
2. **Monitor business metrics, not just technical metrics**
3. **Use log aggregation for distributed tracing**
4. **Regular capacity planning based on metrics**
5. **Test alerting rules regularly**
6. **Keep dashboards focused and actionable**
7. **Document runbooks for common issues**

## Security Considerations

1. **Secure Prometheus and Grafana endpoints**
2. **Use authentication for monitoring tools**
3. **Encrypt metrics in transit**
4. **Limit access to sensitive metrics**
5. **Regular security updates for monitoring stack**
