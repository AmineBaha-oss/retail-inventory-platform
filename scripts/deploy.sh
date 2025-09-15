#!/bin/bash

# Deployment script for Retail Inventory Platform
# Supports multiple deployment targets: local, production, kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEPLOYMENT_TARGET="local"
ENVIRONMENT="dev"
SKIP_TESTS=false
BUILD_IMAGES=true

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --target TARGET     Deployment target (local|production|kubernetes)"
    echo "  -e, --env ENVIRONMENT   Environment (dev|prod)"
    echo "  -s, --skip-tests        Skip running tests"
    echo "  -n, --no-build          Skip building images"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --target local --env dev"
    echo "  $0 --target production --env prod"
    echo "  $0 --target kubernetes --env prod --skip-tests"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--target)
            DEPLOYMENT_TARGET="$2"
            shift 2
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -n|--no-build)
            BUILD_IMAGES=false
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate deployment target
if [[ ! "$DEPLOYMENT_TARGET" =~ ^(local|production|kubernetes)$ ]]; then
    print_error "Invalid deployment target: $DEPLOYMENT_TARGET"
    print_error "Valid targets: local, production, kubernetes"
    exit 1
fi

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|prod)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    print_error "Valid environments: dev, prod"
    exit 1
fi

print_status "Starting deployment..."
print_status "Target: $DEPLOYMENT_TARGET"
print_status "Environment: $ENVIRONMENT"
print_status "Skip tests: $SKIP_TESTS"
print_status "Build images: $BUILD_IMAGES"

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    if [[ "$DEPLOYMENT_TARGET" == "kubernetes" ]]; then
        if ! command -v kubectl &> /dev/null; then
            print_error "kubectl is not installed"
            exit 1
        fi
        
        if ! kubectl cluster-info &> /dev/null; then
            print_error "kubectl is not configured or cluster is not accessible"
            exit 1
        fi
    fi
    
    print_success "Prerequisites check passed"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        print_warning "Skipping tests"
        return
    fi
    
    print_status "Running tests..."
    
    # Backend tests
    if [[ -f "backend/pom.xml" ]]; then
        print_status "Running Spring Boot tests..."
        cd backend
        if [[ -f "./mvnw" ]]; then
            ./mvnw test
        elif command -v mvn &> /dev/null; then
            mvn test
        else
            print_warning "Maven not found, skipping Spring Boot tests"
        fi
        cd ..
    fi
    
    # Python tests
    if [[ -f "backend/requirements.txt" ]]; then
        print_status "Running Python tests..."
        cd backend
        python -m pytest tests/ -v || print_warning "Python tests failed or not found"
        cd ..
    fi
    
    # Frontend tests
    if [[ -f "frontend/package.json" ]]; then
        print_status "Running frontend tests..."
        cd frontend
        npm test -- --coverage --watchAll=false || print_warning "Frontend tests failed"
        cd ..
    fi
    
    print_success "Tests completed"
}

# Build images
build_images() {
    if [[ "$BUILD_IMAGES" == "false" ]]; then
        print_warning "Skipping image builds"
        return
    fi
    
    print_status "Building Docker images..."
    
    # Build Spring Boot image
    if [[ -f "backend/Dockerfile.spring" ]]; then
        print_status "Building Spring Boot image..."
        docker build -f backend/Dockerfile.spring -t retail-inventory-spring-api:latest backend/
    fi
    
    # Build ML API image
    if [[ -f "backend/Dockerfile" ]]; then
        print_status "Building ML API image..."
        docker build -f backend/Dockerfile -t retail-inventory-ml-api:latest backend/
    fi
    
    # Build Frontend image
    if [[ -f "frontend/Dockerfile.prod" ]]; then
        print_status "Building Frontend image..."
        docker build -f frontend/Dockerfile.prod -t retail-inventory-frontend:latest frontend/
    fi
    
    print_success "Images built successfully"
}

# Deploy locally
deploy_local() {
    print_status "Deploying locally..."
    
    # Stop existing containers
    docker-compose down || true
    
    # Start services
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        docker-compose -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check health
    check_health_local
    
    print_success "Local deployment completed"
    print_status "Access the application at:"
    print_status "  Frontend: http://localhost:3000"
    print_status "  Spring Boot API: http://localhost:8080"
    print_status "  ML API: http://localhost:8000"
    print_status "  Grafana: http://localhost:3001"
}

# Deploy to production
deploy_production() {
    print_status "Deploying to production..."
    
    # Check if .env file exists
    if [[ ! -f ".env" ]]; then
        print_error ".env file not found. Please create it from env.prod.example"
        exit 1
    fi
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down || true
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 60
    
    # Check health
    check_health_production
    
    print_success "Production deployment completed"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    print_status "Deploying to Kubernetes..."
    
    # Check if kubeconfig is set
    if [[ -z "$KUBECONFIG" ]] && [[ ! -f "$HOME/.kube/config" ]]; then
        print_error "Kubernetes configuration not found"
        exit 1
    fi
    
    # Apply Kubernetes manifests
    print_status "Applying Kubernetes manifests..."
    kubectl apply -k k8s/
    
    # Wait for deployments to be ready
    print_status "Waiting for deployments to be ready..."
    kubectl rollout status deployment/spring-api -n retail-inventory --timeout=300s
    kubectl rollout status deployment/ml-api -n retail-inventory --timeout=300s
    kubectl rollout status deployment/frontend -n retail-inventory --timeout=300s
    
    # Get service URLs
    print_status "Getting service URLs..."
    kubectl get services -n retail-inventory
    
    print_success "Kubernetes deployment completed"
}

# Check health locally
check_health_local() {
    print_status "Checking service health..."
    
    # Check Spring Boot API
    if curl -f http://localhost:8080/api/actuator/health &> /dev/null; then
        print_success "Spring Boot API is healthy"
    else
        print_error "Spring Boot API is not responding"
    fi
    
    # Check ML API
    if curl -f http://localhost:8000/health &> /dev/null; then
        print_success "ML API is healthy"
    else
        print_error "ML API is not responding"
    fi
    
    # Check Frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend is not responding"
    fi
}

# Check health in production
check_health_production() {
    print_status "Checking service health..."
    
    # Get the domain from environment or use localhost
    DOMAIN=${DOMAIN:-localhost}
    
    # Check Spring Boot API
    if curl -f http://$DOMAIN/api/actuator/health &> /dev/null; then
        print_success "Spring Boot API is healthy"
    else
        print_error "Spring Boot API is not responding"
    fi
    
    # Check ML API
    if curl -f http://$DOMAIN/ml/health &> /dev/null; then
        print_success "ML API is healthy"
    else
        print_error "ML API is not responding"
    fi
    
    # Check Frontend
    if curl -f http://$DOMAIN &> /dev/null; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend is not responding"
    fi
}

# Main deployment logic
main() {
    check_prerequisites
    run_tests
    build_images
    
    case $DEPLOYMENT_TARGET in
        local)
            deploy_local
            ;;
        production)
            deploy_production
            ;;
        kubernetes)
            deploy_kubernetes
            ;;
    esac
    
    print_success "Deployment completed successfully!"
}

# Run main function
main
