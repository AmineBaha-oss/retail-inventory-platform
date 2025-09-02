# DigitalOcean Deployment Guide

## Option 1: DigitalOcean App Platform (Recommended)

### Prerequisites
- DigitalOcean account
- GitHub repository connected

### Steps

1. **Connect GitHub Repository**
   - Go to DigitalOcean App Platform
   - Connect your GitHub account
   - Select your retail-inventory-platform repository

2. **Configure Services**
   - **Frontend**: Static site from `frontend/` directory
   - **Spring Boot API**: Docker service from `backend/Dockerfile.spring`
   - **ML API**: Docker service from `backend/Dockerfile`
   - **Database**: Managed PostgreSQL database
   - **Cache**: Managed Redis database

3. **Environment Variables**
   ```bash
   # Database
   DB_HOST=your-postgres-host
   DB_PASSWORD=your-secure-password
   
   # Redis
   REDIS_HOST=your-redis-host
   REDIS_PASSWORD=your-redis-password
   
   # Security
   JWT_SECRET=your-jwt-secret
   ```

4. **Deploy**
   - Click "Deploy" and wait for deployment to complete
   - Get your live URLs

## Option 2: DigitalOcean Droplets (VPS)

### Prerequisites
- DigitalOcean account
- SSH access to droplet

### Steps

1. **Create Droplet**
   - Choose Ubuntu 22.04 LTS
   - Select size: 4GB RAM, 2 vCPUs (minimum)
   - Add SSH key

2. **Install Dependencies**
   ```bash
   # SSH into droplet
   ssh root@your-droplet-ip
   
   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   apt-get install docker-compose-plugin
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/retail-inventory-platform.git
   cd retail-inventory-platform
   
   # Copy environment file
   cp env.prod.example .env
   # Edit .env with your production values
   
   # Deploy
   ./scripts/deploy.sh --target production --env prod
   ```

4. **Set up Domain and SSL**
   ```bash
   # Install Nginx and Certbot
   apt install nginx certbot python3-certbot-nginx
   
   # Configure domain
   # Get SSL certificate
   certbot --nginx -d yourdomain.com
   ```

## Option 3: DigitalOcean Kubernetes (DOKS)

### Prerequisites
- DigitalOcean account
- kubectl configured

### Steps

1. **Create Kubernetes Cluster**
   - Go to DigitalOcean Kubernetes
   - Create cluster with 3 nodes
   - Download kubeconfig

2. **Deploy Application**
   ```bash
   # Update image references in k8s/kustomization.yaml
   kubectl apply -k k8s/
   ```

## Cost Estimation (Monthly)
- **App Platform**: $25-100 (pay-per-use)
- **Droplets**: $24-48 (4GB droplet)
- **Kubernetes**: $45-90 (3 nodes)

## Benefits
- ✅ Very cost-effective
- ✅ Simple setup
- ✅ Good performance
- ✅ Managed databases
- ✅ Automatic SSL
- ✅ Global CDN

## Quick Start (Recommended)
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository
4. Configure services as described above
5. Deploy!

**Total setup time: 15-30 minutes**
