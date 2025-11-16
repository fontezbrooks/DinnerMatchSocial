#!/bin/bash

# DinnerMatch Infrastructure Verification Script
# Verifies that all infrastructure components are properly set up

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✅ PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠️  WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌ FAIL]${NC} $1"
}

echo ""
echo "🍽️  DinnerMatch Infrastructure Verification"
echo "============================================"
echo ""

# Track results
PASSED=0
FAILED=0
WARNINGS=0

# Function to increment counters
pass() {
    print_success "$1"
    PASSED=$((PASSED + 1))
}

fail() {
    print_error "$1"
    FAILED=$((FAILED + 1))
}

warn() {
    print_warning "$1"
    WARNINGS=$((WARNINGS + 1))
}

# Check Docker installation and services
print_status "Checking Docker environment..."

if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        pass "Docker is installed and running"
    else
        fail "Docker is installed but not running"
    fi
else
    fail "Docker is not installed"
fi

if command -v docker-compose &> /dev/null; then
    pass "Docker Compose is available"
else
    fail "Docker Compose is not installed"
fi

# Check if services are running
print_status "Checking running services..."

if docker-compose ps | grep -q "postgres.*Up"; then
    pass "PostgreSQL container is running"
else
    warn "PostgreSQL container is not running"
fi

if docker-compose ps | grep -q "redis.*Up"; then
    pass "Redis container is running"
else
    warn "Redis container is not running"
fi

if docker-compose ps | grep -q "backend.*Up"; then
    pass "Backend container is running"
else
    warn "Backend container is not running"
fi

if docker-compose ps | grep -q "frontend.*Up"; then
    pass "Frontend container is running"
else
    warn "Frontend container is not running"
fi

# Check service connectivity
print_status "Checking service connectivity..."

if curl -f http://localhost:3000/health &> /dev/null; then
    pass "Backend API health check"
else
    warn "Backend API is not responding at http://localhost:3000/health"
fi

if curl -f http://localhost:8081 &> /dev/null; then
    pass "Frontend is accessible"
else
    warn "Frontend is not accessible at http://localhost:8081"
fi

# Check database connectivity
if docker-compose exec postgres pg_isready -U postgres -d dinnermatch &> /dev/null; then
    pass "PostgreSQL database is ready"
else
    warn "PostgreSQL database connection failed"
fi

# Check Redis connectivity
if docker-compose exec redis redis-cli ping | grep -q PONG &> /dev/null; then
    pass "Redis is responding"
else
    warn "Redis connection failed"
fi

# Check environment files
print_status "Checking configuration files..."

if [ -f .env ]; then
    pass ".env file exists"
else
    fail ".env file is missing"
fi

if [ -f apps/backend/.env.test ]; then
    pass "Backend test environment file exists"
else
    warn "Backend test environment file is missing"
fi

if [ -f docker-compose.yml ]; then
    pass "Docker Compose configuration exists"
else
    fail "Docker Compose configuration is missing"
fi

# Check GitHub workflows
print_status "Checking CI/CD configuration..."

if [ -f .github/workflows/ci.yml ]; then
    pass "CI workflow configuration exists"
else
    fail "CI workflow configuration is missing"
fi

if [ -f .github/workflows/cd.yml ]; then
    pass "CD workflow configuration exists"
else
    fail "CD workflow configuration is missing"
fi

if [ -f .github/workflows/security.yml ]; then
    pass "Security workflow configuration exists"
else
    warn "Security workflow configuration is missing"
fi

# Check Heroku deployment files
print_status "Checking deployment configuration..."

if [ -f Procfile ]; then
    pass "Heroku Procfile exists"
else
    warn "Heroku Procfile is missing"
fi

if [ -f heroku.yml ]; then
    pass "Heroku Docker configuration exists"
else
    warn "Heroku Docker configuration is missing"
fi

# Check monitoring setup
print_status "Checking monitoring configuration..."

if [ -f sentry.properties ]; then
    pass "Sentry configuration exists"
else
    warn "Sentry configuration is missing"
fi

if [ -f apps/backend/src/middleware/sentry.ts ]; then
    pass "Sentry middleware exists"
else
    warn "Sentry middleware is missing"
fi

# Check scripts
print_status "Checking setup scripts..."

SCRIPTS=("setup-dev.sh" "deploy-heroku.sh" "heroku-setup.sh" "monitoring-setup.sh")
for script in "${SCRIPTS[@]}"; do
    if [ -x "scripts/$script" ]; then
        pass "Script $script is executable"
    else
        warn "Script $script is missing or not executable"
    fi
done

# Check Node.js dependencies
print_status "Checking Node.js dependencies..."

cd apps/backend
if [ -f package.json ] && [ -d node_modules ]; then
    pass "Backend dependencies are installed"
else
    warn "Backend dependencies need installation"
fi

# Check if package.json has required scripts
REQUIRED_SCRIPTS=("test" "lint" "build" "start")
for script in "${REQUIRED_SCRIPTS[@]}"; do
    if grep -q "\"$script\"" package.json; then
        pass "Backend package.json has $script script"
    else
        warn "Backend package.json missing $script script"
    fi
done

cd ../frontend
if [ -f package.json ] && [ -d node_modules ]; then
    pass "Frontend dependencies are installed"
else
    warn "Frontend dependencies need installation"
fi

cd ../..

# Check test configuration
print_status "Checking test configuration..."

if [ -f apps/backend/jest.config.js ]; then
    pass "Jest configuration exists"
else
    warn "Jest configuration is missing"
fi

if [ -f apps/backend/jest.integration.config.js ]; then
    pass "Integration test configuration exists"
else
    warn "Integration test configuration is missing"
fi

# Final summary
echo ""
echo "📊 Verification Summary"
echo "======================"
echo -e "✅ Passed: ${GREEN}$PASSED${NC}"
echo -e "⚠️  Warnings: ${YELLOW}$WARNINGS${NC}"
echo -e "❌ Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        print_success "🎉 Perfect! All infrastructure components are properly configured."
    else
        print_warning "🔧 Good! Core infrastructure is working, but some optional components need attention."
    fi
    echo ""
    echo "✅ Ready for development! You can now:"
    echo "   • Start developing: docker-compose up -d"
    echo "   • View services at the URLs in DEV_INFRASTRUCTURE.md"
    echo "   • Run tests: cd apps/backend && npm test"
    echo "   • Deploy to staging: ./scripts/deploy-heroku.sh staging"
else
    print_error "🚨 Infrastructure setup incomplete. Please address the failed checks above."
    echo ""
    echo "🔧 Common fixes:"
    echo "   • Install Docker: https://www.docker.com/products/docker-desktop"
    echo "   • Run setup script: ./scripts/setup-dev.sh"
    echo "   • Install dependencies: cd apps/backend && npm install"
    exit 1
fi