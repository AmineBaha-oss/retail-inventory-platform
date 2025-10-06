# Troubleshooting Guide

This comprehensive guide helps diagnose and resolve common issues with the Retail Inventory Platform.

## 📋 Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Common Issues](#common-issues)
- [Service-Specific Issues](#service-specific-issues)
- [Database Issues](#database-issues)
- [Performance Issues](#performance-issues)
- [Security Issues](#security-issues)
- [Deployment Issues](#deployment-issues)
- [Debug Tools](#debug-tools)
- [Emergency Procedures](#emergency-procedures)

## 🚨 Quick Diagnostics

### Health Check Commands

#### System Status

```bash
# Check all services
docker-compose ps

# Check service health
curl http://localhost:8080/api/actuator/health
curl http://localhost:8000/health
curl http://localhost:3000

# Check resource usage
docker stats
```

#### Service Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs spring-api
docker-compose logs ml-api
docker-compose logs postgres
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f spring-api
```

#### Network Connectivity

```bash
# Test internal connectivity
docker-compose exec spring-api curl http://ml-api:8000/health
docker-compose exec spring-api curl http://postgres:5432
docker-compose exec spring-api curl http://redis:6379

# Test external connectivity
curl http://localhost:8080/api/actuator/health
curl http://localhost:8000/health
curl http://localhost:3000
```

## 🔧 Common Issues

### 1. Services Not Starting

#### Symptoms

- Services show as "unhealthy" or "exited"
- Error messages in logs
- Port conflicts

#### Diagnosis

```bash
# Check service status
docker-compose ps

# Check service logs
docker-compose logs <service-name>

# Check port usage
netstat -tulpn | grep :8080
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000
```

#### Solutions

```bash
# Restart specific service
docker-compose restart <service-name>

# Rebuild and restart
docker-compose up --build <service-name>

# Stop conflicting services
sudo systemctl stop apache2  # If using port 80
sudo systemctl stop nginx    # If using port 80

# Check Docker daemon
sudo systemctl status docker
sudo systemctl restart docker
```

### 2. Database Connection Issues

#### Symptoms

- "Connection refused" errors
- "Database not found" errors
- Timeout errors

#### Diagnosis

```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U retail_user

# Test database connection
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "SELECT 1;"

# Check database logs
docker-compose logs postgres

# Check connection pool
curl http://localhost:8080/api/actuator/metrics/hikaricp.connections.active
```

#### Solutions

```bash
# Restart database
docker-compose restart postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres

# Check database configuration
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT name, setting FROM pg_settings
WHERE name IN ('max_connections', 'shared_buffers', 'effective_cache_size');"
```

### 3. Memory Issues

#### Symptoms

- Out of memory errors
- Slow performance
- Service crashes

#### Diagnosis

```bash
# Check memory usage
docker stats

# Check JVM memory
curl http://localhost:8080/api/actuator/metrics/jvm.memory.used

# Check system memory
free -h
top -p $(pgrep java)
```

#### Solutions

```bash
# Increase Docker memory limits
# Edit docker-compose.yml
services:
  spring-api:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

# Restart with new limits
docker-compose up -d

# Check JVM heap settings
docker-compose exec spring-api java -XX:+PrintFlagsFinal -version | grep HeapSize
```

### 4. Port Conflicts

#### Symptoms

- "Port already in use" errors
- Services fail to start
- Connection refused errors

#### Diagnosis

```bash
# Check port usage
netstat -tulpn | grep :8080
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000
netstat -tulpn | grep :5432
netstat -tulpn | grep :6379

# Check Docker port mappings
docker-compose ps
```

#### Solutions

```bash
# Stop conflicting services
sudo systemctl stop apache2
sudo systemctl stop nginx
sudo systemctl stop postgresql
sudo systemctl stop redis

# Kill processes using ports
sudo lsof -ti:8080 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9
sudo lsof -ti:3000 | xargs kill -9

# Change ports in docker-compose.yml
services:
  spring-api:
    ports:
      - "8081:8080"  # Change from 8080 to 8081
```

## 🏗️ Service-Specific Issues

### Spring Boot API Issues

#### Application Won't Start

```bash
# Check application logs
docker-compose logs spring-api

# Check configuration
docker-compose exec spring-api env | grep -E "(DB_|REDIS_|JWT_)"

# Check database connectivity
docker-compose exec spring-api curl http://postgres:5432
```

#### Common Solutions

```bash
# Restart with fresh configuration
docker-compose down
docker-compose up -d spring-api

# Check environment variables
docker-compose exec spring-api printenv | grep -E "(DB_|REDIS_|JWT_)"

# Verify database schema
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "\dt"
```

#### Performance Issues

```bash
# Check response times
curl http://localhost:8080/api/actuator/metrics/http.server.requests

# Check memory usage
curl http://localhost:8080/api/actuator/metrics/jvm.memory.used

# Check thread pool
curl http://localhost:8080/api/actuator/metrics/tomcat.threads
```

### ML API Issues

#### Model Training Failures

```bash
# Check ML API logs
docker-compose logs ml-api

# Check Python dependencies
docker-compose exec ml-api pip list

# Check data availability
docker-compose exec ml-api python -c "
import pandas as pd
from sqlalchemy import create_engine
engine = create_engine('postgresql://retail_user:retail_password@postgres:5432/retail_inventory')
df = pd.read_sql('SELECT COUNT(*) FROM sales_transactions', engine)
print(f'Sales records: {df.iloc[0,0]}')
"
```

#### Forecast Generation Issues

```bash
# Test forecast endpoint
curl -X POST http://localhost:8000/api/v1/forecasting/generate \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "PROD-001",
    "store_id": "STORE-001",
    "horizon_days": 30
  }'

# Check model files
docker-compose exec ml-api ls -la /app/models/

# Check Python environment
docker-compose exec ml-api python -c "
import prophet
import pandas as pd
print(f'Prophet version: {prophet.__version__}')
print(f'Pandas version: {pd.__version__}')
"
```

### Frontend Issues

#### Build Failures

```bash
# Check Node.js version
docker-compose exec frontend node --version

# Check npm dependencies
docker-compose exec frontend npm list

# Clear npm cache
docker-compose exec frontend npm cache clean --force

# Reinstall dependencies
docker-compose exec frontend rm -rf node_modules package-lock.json
docker-compose exec frontend npm install
```

#### Runtime Issues

```bash
# Check frontend logs
docker-compose logs frontend

# Check browser console
# Open browser dev tools and check console for errors

# Check network requests
# Open browser dev tools and check Network tab
```

## 🗄️ Database Issues

### PostgreSQL Issues

#### Connection Problems

```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U retail_user

# Check connection limits
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';"

# Check max connections
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT name, setting FROM pg_settings WHERE name = 'max_connections';"
```

#### Performance Issues

```bash
# Check slow queries
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;"

# Check database size
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT pg_size_pretty(pg_database_size('retail_inventory'));"

# Check table sizes
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

#### Data Issues

```bash
# Check data integrity
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM stores;
SELECT COUNT(*) FROM inventory;
SELECT COUNT(*) FROM sales_transactions;"

# Check for missing data
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT p.id, p.name, COUNT(i.id) as inventory_count
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
GROUP BY p.id, p.name
HAVING COUNT(i.id) = 0;"
```

### TimescaleDB Issues

#### Extension Problems

```bash
# Check TimescaleDB extension
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT * FROM pg_extension WHERE extname = 'timescaledb';"

# Check hypertables
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT * FROM timescaledb_information.hypertables;"

# Check compression
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT * FROM timescaledb_information.compression_stats;"
```

#### Performance Issues

```bash
# Check chunk information
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT * FROM timescaledb_information.chunks;"

# Check continuous aggregates
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT * FROM timescaledb_information.continuous_aggregates;"
```

## ⚡ Performance Issues

### High CPU Usage

#### Diagnosis

```bash
# Check CPU usage
top
htop
docker stats

# Check Java process
top -p $(pgrep java)

# Check specific service
docker-compose exec spring-api top
```

#### Solutions

```bash
# Increase CPU limits
# Edit docker-compose.yml
services:
  spring-api:
    deploy:
      resources:
        limits:
          cpus: '2.0'
        reservations:
          cpus: '1.0'

# Check for infinite loops
docker-compose logs spring-api | grep -i "error\|exception"

# Restart services
docker-compose restart spring-api
```

### High Memory Usage

#### Diagnosis

```bash
# Check memory usage
free -h
docker stats

# Check JVM memory
curl http://localhost:8080/api/actuator/metrics/jvm.memory.used

# Check heap dump
docker-compose exec spring-api jcmd 1 GC.run_finalization
```

#### Solutions

```bash
# Increase memory limits
# Edit docker-compose.yml
services:
  spring-api:
    environment:
      - JAVA_OPTS=-Xmx2g -Xms1g
    deploy:
      resources:
        limits:
          memory: 4G

# Check for memory leaks
docker-compose exec spring-api jcmd 1 VM.gc
```

### Slow Response Times

#### Diagnosis

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/api/v1/products

# Check database performance
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;"

# Check API metrics
curl http://localhost:8080/api/actuator/metrics/http.server.requests
```

#### Solutions

```bash
# Optimize database queries
# Add indexes
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_product_store ON inventory(product_id, store_id);"

# Check connection pool
curl http://localhost:8080/api/actuator/metrics/hikaricp.connections.active
```

## 🔒 Security Issues

### Authentication Problems

#### Symptoms

- "Invalid credentials" errors
- Token expiration issues
- Authorization failures

#### Diagnosis

```bash
# Check JWT configuration
docker-compose exec spring-api printenv | grep JWT

# Check authentication logs
docker-compose logs spring-api | grep -i "auth\|login\|token"

# Test authentication endpoint
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

#### Solutions

```bash
# Check JWT secret
docker-compose exec spring-api printenv JWT_SECRET

# Reset JWT secret
# Edit .env file
JWT_SECRET=your-new-very-long-secret-key

# Restart services
docker-compose restart spring-api
```

### CORS Issues

#### Symptoms

- "CORS policy" errors
- Cross-origin request failures
- Preflight request failures

#### Diagnosis

```bash
# Check CORS configuration
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:8080/api/v1/products

# Check allowed origins
docker-compose exec spring-api printenv ALLOWED_ORIGINS
```

#### Solutions

```bash
# Update CORS configuration
# Edit .env file
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com

# Restart services
docker-compose restart spring-api
```

## 🚀 Deployment Issues

### Docker Issues

#### Build Failures

```bash
# Check Docker daemon
sudo systemctl status docker

# Check disk space
df -h

# Clean Docker cache
docker system prune -a

# Check build logs
docker-compose build --no-cache spring-api
```

#### Container Issues

```bash
# Check container status
docker-compose ps

# Check container logs
docker-compose logs <service-name>

# Restart containers
docker-compose restart

# Rebuild containers
docker-compose up --build
```

### Kubernetes Issues

#### Pod Issues

```bash
# Check pod status
kubectl get pods -n retail-inventory

# Check pod logs
kubectl logs -f deployment/spring-api -n retail-inventory

# Check pod events
kubectl describe pod <pod-name> -n retail-inventory
```

#### Service Issues

```bash
# Check service status
kubectl get services -n retail-inventory

# Check service endpoints
kubectl get endpoints -n retail-inventory

# Test service connectivity
kubectl exec -it deployment/spring-api -n retail-inventory -- curl http://ml-api:8000/health
```

## 🛠️ Debug Tools

### Log Analysis

#### Log Aggregation

```bash
# Aggregate logs from all services
docker-compose logs --tail=1000 | grep -E "(ERROR|WARN|Exception)"

# Search for specific errors
docker-compose logs | grep -i "database\|connection\|timeout"

# Follow logs in real-time
docker-compose logs -f | grep -E "(ERROR|WARN)"
```

#### Log Parsing

```bash
# Parse JSON logs
docker-compose logs spring-api | jq 'select(.level == "ERROR")'

# Parse structured logs
docker-compose logs ml-api | grep -E "ERROR|WARN" | jq '.'

# Extract error patterns
docker-compose logs | grep -oE "Exception: [^,]+" | sort | uniq -c
```

### Performance Analysis

#### Profiling

```bash
# JVM profiling
docker-compose exec spring-api jcmd 1 VM.classloader_stats
docker-compose exec spring-api jcmd 1 VM.memory

# Python profiling
docker-compose exec ml-api python -m cProfile -s cumtime main.py
```

#### Monitoring

```bash
# Real-time monitoring
watch -n 1 'docker stats --no-stream'

# Resource monitoring
htop
iotop
nethogs
```

### Network Debugging

#### Connectivity Tests

```bash
# Test internal connectivity
docker-compose exec spring-api ping ml-api
docker-compose exec spring-api ping postgres
docker-compose exec spring-api ping redis

# Test external connectivity
curl -v http://localhost:8080/api/actuator/health
curl -v http://localhost:8000/health
curl -v http://localhost:3000
```

#### Port Testing

```bash
# Test port accessibility
telnet localhost 8080
telnet localhost 8000
telnet localhost 3000

# Check port mappings
docker-compose port spring-api 8080
docker-compose port ml-api 8000
docker-compose port frontend 3000
```

## 🚨 Emergency Procedures

### Service Recovery

#### Complete System Restart

```bash
# Stop all services
docker-compose down

# Clean up resources
docker system prune -f

# Restart services
docker-compose up -d

# Check service health
docker-compose ps
curl http://localhost:8080/api/actuator/health
```

#### Database Recovery

```bash
# Stop services
docker-compose down

# Backup database
docker-compose run --rm postgres pg_dump -U retail_user retail_inventory > backup.sql

# Restore database
docker-compose up -d postgres
docker-compose exec -T postgres psql -U retail_user retail_inventory < backup.sql
```

#### Data Recovery

```bash
# Check data integrity
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM stores;
SELECT COUNT(*) FROM inventory;"

# Restore from backup
docker-compose exec -T postgres psql -U retail_user retail_inventory < backup.sql
```

### Rollback Procedures

#### Application Rollback

```bash
# Check current version
git log --oneline -5

# Rollback to previous version
git checkout <previous-commit>
docker-compose up --build -d

# Verify rollback
curl http://localhost:8080/api/actuator/health
```

#### Database Rollback

```bash
# Check database version
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "
SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;"

# Rollback migrations
docker-compose exec spring-api ./mvnw flyway:repair
```

### Emergency Contacts

#### Escalation Procedures

1. **Level 1**: Development Team
2. **Level 2**: DevOps Team
3. **Level 3**: System Administrator
4. **Level 4**: External Support

#### Communication Channels

- **Slack**: #retail-inventory-alerts
- **Email**: alerts@retail-inventory.com
- **Phone**: +1-555-RETAIL-1
- **PagerDuty**: Critical alerts only

---

**Remember**: Always document issues and solutions for future reference. Keep a troubleshooting log and update this guide with new issues and solutions as they are discovered.
