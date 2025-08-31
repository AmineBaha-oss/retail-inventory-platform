#!/bin/bash

echo "�� Setting up Retail Inventory Management Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'ENVEOF'
# Application Settings
DEBUG=true
SECRET_KEY=your-secret-key-change-in-production

# Database
DATABASE_URL=postgresql://retail_user:retail_password@localhost:5432/retail_inventory

# Redis
REDIS_URL=redis://localhost:6379

# External APIs (add your keys here)
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
LIGHTSPEED_API_KEY=
SQUARE_API_KEY=
ENVEOF
    echo "✅ .env file created"
fi

# Start services
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d postgres redis

echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is ready
until docker-compose exec -T postgres pg_isready -U retail_user -d retail_inventory; do
    echo "⏳ Waiting for database..."
    sleep 2
done

echo "✅ Database is ready!"

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install
cd ..

echo "🎉 Setup complete!"
echo ""
echo "To start the platform:"
echo "1. Backend: cd backend && source venv/bin/activate && python main.py"
echo "2. Frontend: cd frontend && npm run dev"
echo "3. Or use: docker-compose up -d"
echo ""
echo "Access the platform at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"
echo "- Database: localhost:5432"
