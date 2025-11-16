#!/bin/bash

# DinnerMatch Development Environment Setup
# This script sets up the complete development environment for DinnerMatch

set -e  # Exit on any error

echo "🚀 Setting up DinnerMatch development environment..."

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

# Check if Docker is installed and running
check_docker() {
    print_status "Checking Docker installation..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose."
        exit 1
    fi

    print_success "Docker is installed and running"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."

    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. Installing via nvm..."
        # Install Node.js via nvm (recommended for development)
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        source ~/.bashrc || source ~/.zshrc || true
        nvm install 18
        nvm use 18
    else
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            print_warning "Node.js version is below 18. Please upgrade to Node.js 18 or higher."
        else
            print_success "Node.js $(node -v) is installed"
        fi
    fi
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."

    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
            print_warning "Please review and update the .env file with your specific configuration"
        else
            print_error ".env.example file not found. Cannot create .env file."
            exit 1
        fi
    else
        print_warning ".env file already exists. Skipping creation."
    fi

    # Create frontend .env if it doesn't exist
    if [ ! -f apps/frontend/.env ]; then
        if [ -f apps/frontend/.env.example ]; then
            cp apps/frontend/.env.example apps/frontend/.env
            print_success "Created frontend .env file"
        fi
    fi
}

# Build and start services
start_services() {
    print_status "Building and starting services with Docker Compose..."

    # Use development compose file
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

    print_success "Services started successfully"
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be ready..."

    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    until docker-compose exec postgres pg_isready -U postgres -d dinnermatch; do
        sleep 2
    done
    print_success "PostgreSQL is ready"

    # Wait for Redis
    print_status "Waiting for Redis..."
    until docker-compose exec redis redis-cli ping | grep -q PONG; do
        sleep 2
    done
    print_success "Redis is ready"

    # Wait for backend API
    print_status "Waiting for Backend API..."
    until curl -f http://localhost:3000/health &> /dev/null; do
        sleep 5
    done
    print_success "Backend API is ready"
}

# Run database migrations and seeds
setup_database() {
    print_status "Setting up database..."

    # Wait a bit more for the backend to fully initialize
    sleep 10

    # Run migrations and seeds
    docker-compose exec backend npm run migrate:latest
    docker-compose exec backend npm run seed:run

    print_success "Database setup completed"
}

# Install dependencies locally for IDE support
install_local_dependencies() {
    print_status "Installing local dependencies for IDE support..."

    if command -v npm &> /dev/null; then
        # Install backend dependencies
        cd apps/backend
        npm install
        cd ../..

        # Install frontend dependencies
        cd apps/frontend
        npm install
        cd ../..

        print_success "Local dependencies installed"
    else
        print_warning "npm not available. Skipping local dependency installation."
    fi
}

# Display service URLs
show_service_urls() {
    print_success "🎉 Development environment is ready!"
    echo ""
    echo "Service URLs:"
    echo "📱 Frontend (Expo):      http://localhost:8081"
    echo "🔌 Backend API:          http://localhost:3000"
    echo "🗄️  PostgreSQL:           localhost:5432"
    echo "📦 Redis:                localhost:6379"
    echo "🔧 PgAdmin:              http://localhost:5050"
    echo "🔧 Redis Commander:      http://localhost:8082"
    echo ""
    echo "API Documentation:       http://localhost:3000/api-docs"
    echo "Health Check:            http://localhost:3000/health"
    echo ""
    echo "Credentials:"
    echo "PgAdmin:     admin@dinnermatch.com / admin"
    echo "PostgreSQL:  postgres / postgres"
    echo ""
    echo "To stop services: docker-compose down"
    echo "To view logs: docker-compose logs -f [service-name]"
    echo "To restart: docker-compose restart [service-name]"
}

# Main execution
main() {
    echo ""
    echo "🍽️  DinnerMatch Development Setup"
    echo "=================================="
    echo ""

    check_docker
    check_node
    setup_environment
    start_services
    wait_for_services
    setup_database
    install_local_dependencies
    show_service_urls
}

# Run the main function
main