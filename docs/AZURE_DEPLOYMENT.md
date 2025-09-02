# Microsoft Azure Deployment Guide

## Option 1: Azure Kubernetes Service (AKS)

### Prerequisites
- Azure CLI installed
- kubectl configured
- AKS cluster created

### Steps

1. **Create AKS Cluster**
```bash
az aks create \
    --resource-group retail-inventory-rg \
    --name retail-inventory-cluster \
    --node-count 3 \
    --enable-addons monitoring
```

2. **Push Images to Azure Container Registry**
```bash
# Create ACR
az acr create --resource-group retail-inventory-rg --name retailinventoryacr --sku Basic

# Login to ACR
az acr login --name retailinventoryacr

# Tag and push images
docker tag retail-inventory-spring-api:latest retailinventoryacr.azurecr.io/retail-inventory-spring-api:latest
docker push retailinventoryacr.azurecr.io/retail-inventory-spring-api:latest
```

3. **Deploy Application**
```bash
# Get AKS credentials
az aks get-credentials --resource-group retail-inventory-rg --name retail-inventory-cluster

# Deploy application
kubectl apply -k k8s/
```

## Option 2: Azure Container Instances (ACI)

### Prerequisites
- Azure CLI installed
- Images in Azure Container Registry

### Steps

1. **Deploy Services to ACI**
```bash
# Deploy Spring Boot API
az container create \
    --resource-group retail-inventory-rg \
    --name spring-api \
    --image retailinventoryacr.azurecr.io/retail-inventory-spring-api:latest \
    --dns-name-label retail-inventory-spring-api \
    --ports 8080

# Deploy ML API
az container create \
    --resource-group retail-inventory-rg \
    --name ml-api \
    --image retailinventoryacr.azurecr.io/retail-inventory-ml-api:latest \
    --dns-name-label retail-inventory-ml-api \
    --ports 8000
```

2. **Set up Azure Database and Cache**
- Create Azure Database for PostgreSQL
- Create Azure Cache for Redis
- Update connection strings

## Option 3: Azure App Service

### Prerequisites
- Azure CLI installed
- Docker images in ACR

### Steps

1. **Create App Service Plans**
```bash
az appservice plan create \
    --name retail-inventory-plan \
    --resource-group retail-inventory-rg \
    --sku B1 \
    --is-linux
```

2. **Deploy Web Apps**
```bash
# Deploy Spring Boot API
az webapp create \
    --resource-group retail-inventory-rg \
    --plan retail-inventory-plan \
    --name retail-inventory-spring-api \
    --deployment-container-image-name retailinventoryacr.azurecr.io/retail-inventory-spring-api:latest
```

## Cost Estimation (Monthly)
- **AKS**: $100-250 (cluster + nodes)
- **ACI**: $40-120 (pay-per-use)
- **App Service**: $30-100 (plan + usage)

## Benefits
- ✅ Enterprise-grade security
- ✅ Hybrid cloud support
- ✅ Integrated DevOps tools
- ✅ Global presence
- ✅ Compliance certifications
