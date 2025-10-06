# Installation Guide

This comprehensive guide covers all installation scenarios for the Retail Inventory Platform, from local development to production deployment.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Production Installation](#production-installation)
- [Docker Installation](#docker-installation)
- [Kubernetes Installation](#kubernetes-installation)
- [Cloud Platform Installation](#cloud-platform-installation)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements

#### Minimum Requirements

- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB free space
- **OS**: Linux, macOS, or Windows 10+

#### Recommended Requirements

- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 20.04+, macOS 12+, or Windows 11

### Software Dependencies

#### Required Software

- **Docker**: 20.10+ with Docker Compose 2.0+
- **Git**: 2.30+
- **Node.js**: 18+ (for frontend development)
- **Java**: 21+ (for backend development)
- **Python**: 3.9+ (for ML services)

#### Optional Software

- **kubectl**: 1.20+ (for Kubernetes)
- **Helm**: 3.0+ (for Kubernetes package management)
- **Terraform**: 1.0+ (for infrastructure as code)

## 🚀 Local Development Setup

### 1. Quick Start (Docker)

#### Clone Repository

```bash
git clone https://github.com/your-org/retail-inventory-platform.git
cd retail-inventory-platform
```

#### Start All Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Access Services

- **Frontend**: http://localhost:3000
- **Spring Boot API**: http://localhost:8080
- **ML API**: http://localhost:8000
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090

### 2. Manual Development Setup

#### Backend Setup (Spring Boot)

##### Prerequisites

```bash
# Install Java 21
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-21-jdk

# macOS
brew install openjdk@21

# Windows
# Download from https://adoptium.net/
```

##### Setup Steps

```bash
# Navigate to backend directory
cd backend

# Install dependencies
./mvnw clean install

# Start Spring Boot application
./mvnw spring-boot:run

# Or run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

#### ML API Setup (Python/FastAPI)

##### Prerequisites

```bash
# Install Python 3.9+
# Ubuntu/Debian
sudo apt install python3.9 python3.9-venv python3.9-dev

# macOS
brew install python@3.9

# Windows
# Download from https://python.org/
```

##### Setup Steps

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI application
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup (React/TypeScript)

##### Prerequisites

```bash
# Install Node.js 18+
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node@18

# Windows
# Download from https://nodejs.org/
```

##### Setup Steps

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Or start with specific port
npm run dev -- --port 3000
```

#### Database Setup (PostgreSQL/TimescaleDB)

##### Prerequisites

```bash
# Install PostgreSQL
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://postgresql.org/
```

##### Setup Steps

```bash
# Start PostgreSQL service
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS

# Create database
sudo -u postgres psql
CREATE DATABASE retail_inventory;
CREATE USER retail_user WITH PASSWORD 'retail_password';
GRANT ALL PRIVILEGES ON DATABASE retail_inventory TO retail_user;

# Install TimescaleDB extension
sudo -u postgres psql -d retail_inventory -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"

# Run database migrations
cd backend
./mvnw flyway:migrate
```

#### Redis Setup

##### Prerequisites

```bash
# Install Redis
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis

# Windows
# Download from https://redis.io/
```

##### Setup Steps

```bash
# Start Redis service
sudo systemctl start redis-server  # Linux
brew services start redis          # macOS

# Test Redis connection
redis-cli ping
```

## 🏭 Production Installation

### 1. Server Preparation

#### System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git unzip

# Create application user
sudo useradd -m -s /bin/bash retail
sudo usermod -aG docker retail
```

#### Docker Installation

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. Application Deployment

#### Clone and Setup

```bash
# Switch to application user
sudo su - retail

# Clone repository
git clone https://github.com/your-org/retail-inventory-platform.git
cd retail-inventory-platform

# Set up environment
cp env.prod.example .env
nano .env  # Edit with production values
```

#### Production Configuration

```bash
# .env file contents
DB_PASSWORD=your_secure_password
DB_USERNAME=retail_user
DB_NAME=retail_inventory
JWT_SECRET=your_very_long_secret_key
REDIS_PASSWORD=your_redis_password
GRAFANA_ADMIN_PASSWORD=your_grafana_password
```

#### Deploy Application

```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. SSL/TLS Setup

#### Let's Encrypt SSL

```bash
# Install certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## 🐳 Docker Installation

### 1. Docker Compose Setup

#### Development Environment

```bash
# Start development environment
docker-compose up -d

# Start specific services
docker-compose up -d postgres redis

# View service logs
docker-compose logs -f spring-api
```

#### Production Environment

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale spring-api=3

# Update services
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Custom Docker Images

#### Build Custom Images

```bash
# Build Spring Boot image
docker build -f backend/Dockerfile.spring -t retail-inventory-spring-api:latest backend/

# Build ML API image
docker build -f backend/Dockerfile -t retail-inventory-ml-api:latest backend/

# Build frontend image
docker build -f frontend/Dockerfile.prod -t retail-inventory-frontend:latest frontend/
```

#### Push to Registry

```bash
# Tag images
docker tag retail-inventory-spring-api:latest your-registry/retail-inventory-spring-api:latest
docker tag retail-inventory-ml-api:latest your-registry/retail-inventory-ml-api:latest
docker tag retail-inventory-frontend:latest your-registry/retail-inventory-frontend:latest

# Push images
docker push your-registry/retail-inventory-spring-api:latest
docker push your-registry/retail-inventory-ml-api:latest
docker push your-registry/retail-inventory-frontend:latest
```

## ☸️ Kubernetes Installation

### 1. Prerequisites

#### Install kubectl

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

#### Install Helm

```bash
# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### 2. Deploy to Kubernetes

#### Create Namespace

```bash
# Create namespace
kubectl create namespace retail-inventory

# Set default namespace
kubectl config set-context --current --namespace=retail-inventory
```

#### Deploy Application

```bash
# Deploy all components
kubectl apply -k k8s/

# Check deployment status
kubectl get pods -n retail-inventory
kubectl get services -n retail-inventory
kubectl get ingress -n retail-inventory
```

#### Configure Ingress

```bash
# Update domain in ingress
sed -i 's/yourdomain.com/your-actual-domain.com/g' k8s/ingress.yaml

# Apply ingress
kubectl apply -f k8s/ingress.yaml
```

### 3. Monitoring Setup

#### Deploy Monitoring Stack

```bash
# Deploy Prometheus
kubectl apply -f k8s/monitoring.yaml

# Deploy Grafana
kubectl apply -f k8s/grafana.yaml

# Check monitoring
kubectl get pods -n retail-inventory | grep -E "(prometheus|grafana)"
```

## ☁️ Cloud Platform Installation

### 1. AWS Installation

#### Prerequisites

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Terraform
wget https://releases.hashicorp.com/terraform/1.0.0/terraform_1.0.0_linux_amd64.zip
unzip terraform_1.0.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

#### Deploy with Terraform

```bash
# Navigate to AWS deployment directory
cd docs/aws-deployment

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Deploy infrastructure
terraform apply
```

### 2. Azure Installation

#### Prerequisites

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Install Terraform
wget https://releases.hashicorp.com/terraform/1.0.0/terraform_1.0.0_linux_amd64.zip
unzip terraform_1.0.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

#### Deploy with Terraform

```bash
# Navigate to Azure deployment directory
cd docs/azure-deployment

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Deploy infrastructure
terraform apply
```

### 3. GCP Installation

#### Prerequisites

```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Install Terraform
wget https://releases.hashicorp.com/terraform/1.0.0/terraform_1.0.0_linux_amd64.zip
unzip terraform_1.0.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

#### Deploy with Terraform

```bash
# Navigate to GCP deployment directory
cd docs/gcp-deployment

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Deploy infrastructure
terraform apply
```

## 🔧 Configuration

### 1. Environment Variables

#### Spring Boot Configuration

```bash
# Database configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=retail_inventory
DB_USERNAME=retail_user
DB_PASSWORD=your_secure_password

# Redis configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT configuration
JWT_SECRET=your_very_long_secret_key
JWT_EXPIRATION=86400

# ML API configuration
ML_API_BASEURL=http://ml-api:8000

# CORS configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### ML API Configuration

```bash
# Database configuration
DATABASE_URL=postgresql://retail_user:retail_password@postgres:5432/retail_inventory

# Redis configuration
REDIS_URL=redis://redis:6379

# CORS configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Debug configuration
DEBUG=true
LOG_LEVEL=INFO
```

### 2. Database Configuration

#### PostgreSQL Configuration

```bash
# postgresql.conf
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

#### TimescaleDB Configuration

```sql
-- Enable TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create hypertables
CREATE TABLE sales_daily (
    store_id text NOT NULL,
    sku text NOT NULL,
    date date NOT NULL,
    qty_sold numeric,
    revenue numeric,
    PRIMARY KEY (store_id, sku, date)
);

SELECT create_hypertable('sales_daily', 'date');

-- Create indexes
CREATE INDEX idx_sales_daily_store_sku ON sales_daily(store_id, sku);
CREATE INDEX idx_sales_daily_date ON sales_daily(date);
```

### 3. Monitoring Configuration

#### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "spring-api"
    static_configs:
      - targets: ["spring-api:8080"]
    metrics_path: "/api/actuator/prometheus"

  - job_name: "ml-api"
    static_configs:
      - targets: ["ml-api:8000"]
    metrics_path: "/metrics"
```

#### Grafana Configuration

```yaml
# grafana.ini
[server]
http_port = 3000
root_url = http://localhost:3001

[security]
admin_user = admin
admin_password = your_grafana_password

[auth.anonymous]
enabled = true
org_name = Main Org.
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Docker Issues

##### Services Not Starting

```bash
# Check Docker status
docker --version
docker-compose --version

# Check service logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild services
docker-compose up --build
```

##### Port Conflicts

```bash
# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080
netstat -tulpn | grep :8000

# Stop conflicting services
sudo systemctl stop apache2  # If using port 80
sudo systemctl stop nginx    # If using port 80
```

#### 2. Database Issues

##### Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U retail_user -d retail_inventory

# Check TimescaleDB extension
psql -h localhost -U retail_user -d retail_inventory -c "SELECT * FROM pg_extension WHERE extname = 'timescaledb';"
```

##### Performance Issues

```bash
# Check database size
psql -h localhost -U retail_user -d retail_inventory -c "SELECT pg_size_pretty(pg_database_size('retail_inventory'));"

# Check table sizes
psql -h localhost -U retail_user -d retail_inventory -c "SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

#### 3. Application Issues

##### Spring Boot Issues

```bash
# Check application logs
docker-compose logs spring-api

# Check health endpoint
curl http://localhost:8080/api/actuator/health

# Check metrics
curl http://localhost:8080/api/actuator/metrics
```

##### ML API Issues

```bash
# Check ML API logs
docker-compose logs ml-api

# Check health endpoint
curl http://localhost:8000/health

# Check API documentation
curl http://localhost:8000/docs
```

##### Frontend Issues

```bash
# Check frontend logs
docker-compose logs frontend

# Check if frontend is accessible
curl http://localhost:3000

# Check build process
cd frontend
npm run build
```

### Debug Commands

#### System Information

```bash
# Check system resources
free -h
df -h
top

# Check Docker resources
docker stats

# Check network connectivity
ping google.com
nslookup localhost
```

#### Application Debugging

```bash
# Check service status
docker-compose ps

# Check service logs
docker-compose logs -f

# Check service health
curl http://localhost:8080/api/actuator/health
curl http://localhost:8000/health
curl http://localhost:3000
```

#### Database Debugging

```bash
# Check database connection
docker-compose exec postgres psql -U retail_user -d retail_inventory

# Check database size
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "SELECT pg_size_pretty(pg_database_size('retail_inventory'));"

# Check active connections
docker-compose exec postgres psql -U retail_user -d retail_inventory -c "SELECT * FROM pg_stat_activity;"
```

## 📚 Additional Resources

### Documentation

- [Quick Start Guide](QUICK_START.md)
- [Development Guide](DEVELOPMENT.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)

### Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides and references
- **Community**: Developer discussions and support

### Updates

- **Version Updates**: Regular updates and improvements
- **Security Updates**: Security patches and updates
- **Feature Updates**: New features and enhancements

---

**Next Steps**: After successful installation, proceed to [Quick Start Guide](QUICK_START.md) to begin using the platform.
