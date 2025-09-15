# AWS Deployment Guide

## Option 1: AWS ECS (Elastic Container Service)

### Prerequisites
- AWS CLI configured
- Docker images pushed to ECR (Elastic Container Registry)

### Steps

1. **Create ECR Repositories**
```bash
# Create repositories for each service
aws ecr create-repository --repository-name retail-inventory-spring-api
aws ecr create-repository --repository-name retail-inventory-ml-api
aws ecr create-repository --repository-name retail-inventory-frontend
```

2. **Push Images to ECR**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push images
docker tag retail-inventory-spring-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/retail-inventory-spring-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/retail-inventory-spring-api:latest
```

3. **Deploy with ECS**
- Use the provided `k8s/` manifests adapted for ECS
- Set up Application Load Balancer
- Configure RDS for PostgreSQL
- Use ElastiCache for Redis

## Option 2: AWS EKS (Elastic Kubernetes Service)

### Prerequisites
- AWS CLI configured
- kubectl configured
- EKS cluster created

### Steps

1. **Create EKS Cluster**
```bash
eksctl create cluster --name retail-inventory --region us-east-1 --nodes 3
```

2. **Deploy Application**
```bash
# Update image references in k8s/kustomization.yaml
kubectl apply -k k8s/
```

## Option 3: AWS App Runner (Simplest)

### Prerequisites
- GitHub repository connected
- Docker images in ECR

### Steps

1. **Create App Runner Service**
- Go to AWS App Runner console
- Connect to your GitHub repository
- Configure build settings
- Deploy automatically

## Cost Estimation (Monthly)
- **ECS**: $50-200 (depending on instance size)
- **EKS**: $100-300 (cluster + nodes)
- **App Runner**: $25-100 (pay-per-use)

## Benefits
- ✅ Fully managed services
- ✅ Auto-scaling
- ✅ High availability
- ✅ Security built-in
- ✅ Monitoring with CloudWatch
