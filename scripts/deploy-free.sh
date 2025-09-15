#!/bin/bash

# Free Deployment Script for Retail Inventory Platform
# Supports Railway, Render, and Fly.io

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Default values
PLATFORM="railway"
SKIP_BUILD=false

# Function to show usage
show_usage() {
    echo "Free Deployment Script for Retail Inventory Platform"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --platform PLATFORM    Deployment platform (railway|render|fly)"
    echo "  -s, --skip-build           Skip building images"
    echo "  -h, --help                 Show this help message"
    echo ""
    echo "Supported Platforms:"
    echo "  railway  - Railway.app (Recommended - $5 free credit)"
    echo "  render   - Render.com (Free tier available)"
    echo "  fly      - Fly.io (Free tier available)"
    echo ""
    echo "Examples:"
    echo "  $0 --platform railway"
    echo "  $0 --platform render"
    echo "  $0 --platform fly"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -s|--skip-build)
            SKIP_BUILD=true
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

# Validate platform
if [[ ! "$PLATFORM" =~ ^(railway|render|fly)$ ]]; then
    print_error "Invalid platform: $PLATFORM"
    print_error "Valid platforms: railway, render, fly"
    exit 1
fi

print_status "Starting free deployment to $PLATFORM..."

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    
    if [[ "$PLATFORM" == "fly" ]]; then
        if ! command -v flyctl &> /dev/null; then
            print_error "Fly CLI is not installed. Install it from https://fly.io/docs/hands-on/install-flyctl/"
            exit 1
        fi
    fi
    
    print_success "Prerequisites check passed"
}

# Deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    print_status "Railway deployment steps:"
    echo "1. Go to https://railway.app"
    echo "2. Sign up with GitHub"
    echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
    echo "4. Select your retail-inventory-platform repository"
    echo "5. Railway will auto-detect your services!"
    echo ""
    echo "Add these databases:"
    echo "- PostgreSQL (for main database)"
    echo "- Redis (for caching)"
    echo ""
    echo "Set these environment variables:"
    echo "- JWT_SECRET: your-secure-jwt-secret"
    echo "- CORS_ALLOWED_ORIGINS: https://your-app.railway.app"
    echo ""
    echo "Railway will automatically:"
    echo "- Deploy all services"
    echo "- Provide public URLs"
    echo "- Handle SSL certificates"
    echo "- Set up databases"
    
    print_success "Railway deployment guide displayed!"
    print_status "Visit https://railway.app to start deployment"
}

# Deploy to Render
deploy_render() {
    print_status "Deploying to Render..."
    
    print_status "Render deployment steps:"
    echo "1. Go to https://render.com"
    echo "2. Sign up with GitHub"
    echo "3. Click 'New' → 'Blueprint'"
    echo "4. Connect your GitHub repository"
    echo "5. Render will use the render.yaml configuration!"
    echo ""
    echo "The render.yaml file will automatically:"
    echo "- Create 3 web services (Spring Boot, ML API, Frontend)"
    echo "- Create PostgreSQL and Redis databases"
    echo "- Set up environment variables"
    echo "- Configure service connections"
    echo ""
    echo "Services will be available at:"
    echo "- Frontend: https://retail-inventory-frontend.onrender.com"
    echo "- Spring Boot API: https://retail-inventory-spring-api.onrender.com"
    echo "- ML API: https://retail-inventory-ml-api.onrender.com"
    
    print_success "Render deployment guide displayed!"
    print_status "Visit https://render.com to start deployment"
}

# Deploy to Fly.io
deploy_fly() {
    print_status "Deploying to Fly.io..."
    
    print_status "Fly.io deployment steps:"
    echo "1. Make sure you're logged in: fly auth login"
    echo "2. Deploy Spring Boot API:"
    echo "   cd backend && fly deploy --dockerfile Dockerfile.spring"
    echo "3. Deploy ML API:"
    echo "   fly deploy --dockerfile Dockerfile"
    echo "4. Deploy Frontend:"
    echo "   cd frontend && fly deploy --dockerfile Dockerfile.prod"
    echo "5. Create databases:"
    echo "   fly postgres create --name retail-inventory-db"
    echo "   fly redis create --name retail-inventory-redis"
    echo ""
    echo "The fly.toml file is configured for the Spring Boot API"
    echo "You'll need to create separate fly.toml files for other services"
    
    print_success "Fly.io deployment guide displayed!"
    print_status "Run 'fly auth login' to start deployment"
}

# Main deployment logic
main() {
    check_prerequisites
    
    case $PLATFORM in
        railway)
            deploy_railway
            ;;
        render)
            deploy_render
            ;;
        fly)
            deploy_fly
            ;;
    esac
    
    print_success "Free deployment guide completed!"
    print_status "Your retail inventory platform will be live in minutes!"
}

# Run main function
main
