# Google Cloud Platform Deployment Guide

## Option 1: Google Kubernetes Engine (GKE)

### Prerequisites
- Google Cloud SDK installed
- kubectl configured
- GKE cluster created

### Steps

1. **Create GKE Cluster**
```bash
gcloud container clusters create retail-inventory \
    --zone us-central1-a \
    --num-nodes 3 \
    --machine-type e2-medium
```

2. **Push Images to Google Container Registry**
```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Tag and push images
docker tag retail-inventory-spring-api:latest gcr.io/PROJECT-ID/retail-inventory-spring-api:latest
docker push gcr.io/PROJECT-ID/retail-inventory-spring-api:latest
```

3. **Deploy Application**
```bash
# Update image references in k8s/kustomization.yaml
kubectl apply -k k8s/
```

## Option 2: Cloud Run (Serverless)

### Prerequisites
- Google Cloud SDK installed
- Images in Google Container Registry

### Steps

1. **Deploy Services to Cloud Run**
```bash
# Deploy Spring Boot API
gcloud run deploy spring-api \
    --image gcr.io/PROJECT-ID/retail-inventory-spring-api \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated

# Deploy ML API
gcloud run deploy ml-api \
    --image gcr.io/PROJECT-ID/retail-inventory-ml-api \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated

# Deploy Frontend
gcloud run deploy frontend \
    --image gcr.io/PROJECT-ID/retail-inventory-frontend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

2. **Set up Cloud SQL and Memorystore**
- Create Cloud SQL PostgreSQL instance
- Create Memorystore Redis instance
- Update connection strings

## Option 3: App Engine (Platform as a Service)

### Prerequisites
- Google Cloud SDK installed
- app.yaml configuration files

### Steps

1. **Create app.yaml files for each service**
2. **Deploy to App Engine**
```bash
gcloud app deploy
```

## Cost Estimation (Monthly)
- **GKE**: $75-200 (cluster + nodes)
- **Cloud Run**: $20-80 (pay-per-request)
- **App Engine**: $30-120 (pay-per-use)

## Benefits
- ✅ Serverless options available
- ✅ Auto-scaling
- ✅ Global load balancing
- ✅ Integrated monitoring
- ✅ Security by default
