# Complete Deployment Guide

This comprehensive guide covers all deployment scenarios for the Retail Inventory Platform.

## 🚀 Quick Start (Local Development)

### Prerequisites

- Docker and Docker Compose
- Git

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd retail-inventory-platform
chmod +x setup.sh
./setup.sh
```

### 2. Start All Services

```bash
docker-compose up -d
```

### 3. Access the Platform

- **Frontend**: http://localhost:3000
- **Spring Boot API**: http://localhost:8080
- **ML API**: http://localhost:8000
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090

## 🏭 Production Deployment

### Option 1: Docker Compose (Single Server)

#### Prerequisites

- Linux server with Docker and Docker Compose
- Domain name with DNS pointing to your server
- SSL certificates (Let's Encrypt recommended)

#### 1. Prepare Environment

```bash
# Copy environment template
cp env.prod.example .env

# Edit with your production values
nano .env
```

#### 2. Deploy

```bash
# Use the deployment script
./scripts/deploy.sh --target production --env prod

# Or manually
docker-compose -f docker-compose.prod.yml up -d
```

#### 3. Configure SSL (Optional)

```bash
# Install certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
```

### Option 2: Kubernetes (Cloud/On-Premise)

#### Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Container registry access
- Ingress controller (nginx-ingress recommended)

#### 1. Build and Push Images

```bash
# Build images
docker build -f backend/Dockerfile.spring -t your-registry/retail-inventory-spring-api:latest backend/
docker build -f backend/Dockerfile -t your-registry/retail-inventory-ml-api:latest backend/
docker build -f frontend/Dockerfile.prod -t your-registry/retail-inventory-frontend:latest frontend/

# Push to registry
docker push your-registry/retail-inventory-spring-api:latest
docker push your-registry/retail-inventory-ml-api:latest
docker push your-registry/retail-inventory-frontend:latest
```

#### 2. Update Image References

```bash
# Update k8s/kustomization.yaml with your registry
sed -i 's|your-registry|your-registry|g' k8s/kustomization.yaml
```

#### 3. Deploy to Kubernetes

```bash
# Create namespace and apply manifests
kubectl apply -k k8s/

# Check deployment status
kubectl get pods -n retail-inventory
kubectl get services -n retail-inventory
```

#### 4. Configure Ingress

```bash
# Update domain in ingress.yaml
sed -i 's/yourdomain.com/your-actual-domain.com/g' k8s/ingress.yaml

# Apply ingress
kubectl apply -f k8s/ingress.yaml
```

## 🔄 CI/CD Pipeline

### GitHub Actions Setup

#### 1. Repository Secrets

Configure these secrets in your GitHub repository:

```
KUBE_CONFIG          # Base64 encoded kubeconfig
GITHUB_TOKEN         # GitHub token for registry access
```

#### 2. Pipeline Features

- **Automated Testing**: Runs on every PR
- **Multi-stage Build**: Builds all Docker images
- **Automated Deployment**: Deploys to production on main branch
- **Health Checks**: Verifies deployment success

#### 3. Manual Deployment

```bash
# Deploy specific version
./scripts/deploy.sh --target kubernetes --env prod

# Deploy with custom options
./scripts/deploy.sh --target production --env prod --skip-tests
```

## 📊 Monitoring and Observability

### Grafana Dashboards

- **System Overview**: Infrastructure metrics
- **Application Performance**: API and service metrics
- **Business Metrics**: Inventory and forecasting KPIs
- **ML Model Performance**: Model accuracy and drift

### Prometheus Metrics

- **Application Metrics**: Request rates, response times, errors
- **Infrastructure Metrics**: CPU, memory, disk, network
- **Business Metrics**: Inventory levels, forecast accuracy
- **Custom Metrics**: ML model performance, cache hit rates

### Alerting

- **Critical**: Service down, high error rates
- **Warning**: High memory usage, slow responses
- **Info**: Deployment notifications, capacity warnings

## 🔧 Configuration Management

### Environment Variables

#### Required for Production

```bash
# Database
DB_PASSWORD=your_secure_password
DB_USERNAME=retail_user
DB_NAME=retail_inventory

# Security
JWT_SECRET=your_very_long_secret_key
REDIS_PASSWORD=your_redis_password

# Monitoring
GRAFANA_ADMIN_PASSWORD=your_grafana_password
```

#### Optional Configuration

```bash
# External APIs
SHOPIFY_API_KEY=your_shopify_key
LIGHTSPEED_API_KEY=your_lightspeed_key

# Email
SMTP_HOST=smtp.yourdomain.com
SMTP_USERNAME=your_smtp_user
SMTP_PASSWORD=your_smtp_password
```

### Configuration Files

- `application.yml` - Spring Boot configuration
- `docker-compose.prod.yml` - Production Docker setup
- `k8s/` - Kubernetes manifests
- `nginx/nginx.conf` - Reverse proxy configuration

## 🗄️ Database Management

### Backup Strategy

```bash
# Automated daily backups
./scripts/backup.sh

# Manual backup
docker-compose exec postgres pg_dump -U retail_user retail_inventory > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U retail_user retail_inventory < backup.sql
```

### Migration Management

```bash
# Spring Boot migrations (Flyway)
./mvnw flyway:migrate

# Manual SQL migrations
docker-compose exec postgres psql -U retail_user retail_inventory -f migration.sql
```

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Change all default passwords
- [ ] Enable SSL/TLS encryption
- [ ] Configure firewall rules
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting
- [ ] Configure security headers
- [ ] Set up log monitoring
- [ ] Regular security updates

### SSL/TLS Configuration

```nginx
# nginx/nginx.conf
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## 📈 Scaling and Performance

### Horizontal Scaling

```bash
# Kubernetes HPA
kubectl autoscale deployment spring-api --cpu-percent=70 --min=2 --max=10

# Docker Compose scaling
docker-compose up -d --scale spring-api=3
```

### Performance Optimization

- **Database**: Connection pooling, query optimization
- **Caching**: Redis clustering, cache warming
- **Load Balancing**: Nginx upstream configuration
- **CDN**: Static asset delivery

## 🚨 Troubleshooting

### Common Issues

#### 1. Services Not Starting

```bash
# Check logs
docker-compose logs spring-api
kubectl logs deployment/spring-api -n retail-inventory

# Check health
curl http://localhost:8080/api/actuator/health
```

#### 2. Database Connection Issues

```bash
# Test connection
docker-compose exec postgres psql -U retail_user -d retail_inventory

# Check connection pool
curl http://localhost:8080/api/actuator/metrics/hikaricp.connections.active
```

#### 3. High Memory Usage

```bash
# Check JVM metrics
curl http://localhost:8080/api/actuator/metrics/jvm.memory.used

# Check container resources
docker stats
kubectl top pods -n retail-inventory
```

### Debug Commands

```bash
# Service status
docker-compose ps
kubectl get pods -n retail-inventory

# Resource usage
docker stats
kubectl top nodes
kubectl top pods -n retail-inventory

# Network connectivity
docker-compose exec spring-api curl http://ml-api:8000/health
kubectl exec -it deployment/spring-api -n retail-inventory -- curl http://ml-api:8000/health
```

## 📚 Additional Resources

### Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [Development Guide](DEVELOPMENT.md)
- [Monitoring Guide](docs/MONITORING.md)
- [API Documentation](http://localhost:8000/docs)

### Support

- Check logs for error messages
- Review health check endpoints
- Monitor Grafana dashboards
- Check Prometheus targets

### Updates and Maintenance

```bash
# Update application
git pull origin main
./scripts/deploy.sh --target production --env prod

# Update dependencies
cd backend && ./mvnw versions:use-latest-versions
cd frontend && npm update

# Database maintenance
docker-compose exec postgres psql -U retail_user retail_inventory -c "VACUUM ANALYZE;"
```

This deployment guide provides everything you need to deploy your retail inventory platform in any environment, from local development to production-scale Kubernetes clusters.
