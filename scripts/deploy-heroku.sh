#!/bin/bash

# Heroku Deployment Script for DinnerMatch
# This script deploys the backend API to Heroku with proper configuration

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
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
STAGING_APP="dinnermatch-staging"
PRODUCTION_APP="dinnermatch-production"
ENVIRONMENT=${1:-staging}

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    print_error "Usage: $0 [staging|production]"
    exit 1
fi

APP_NAME=""
if [ "$ENVIRONMENT" = "staging" ]; then
    APP_NAME=$STAGING_APP
else
    APP_NAME=$PRODUCTION_APP
fi

print_status "Deploying to $ENVIRONMENT environment ($APP_NAME)..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    print_error "Heroku CLI is not installed. Please install it from https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    print_error "Please log in to Heroku first: heroku login"
    exit 1
fi

# Create Heroku app if it doesn't exist
print_status "Checking if Heroku app exists..."
if ! heroku apps:info $APP_NAME &> /dev/null; then
    print_status "Creating Heroku app: $APP_NAME"
    heroku create $APP_NAME --region us
    print_success "Created Heroku app: $APP_NAME"
else
    print_success "Heroku app already exists: $APP_NAME"
fi

# Set stack to container for Docker deployment
print_status "Setting Heroku stack to container..."
heroku stack:set container --app $APP_NAME

# Add PostgreSQL addon
print_status "Adding PostgreSQL addon..."
if ! heroku addons:info heroku-postgresql --app $APP_NAME &> /dev/null; then
    if [ "$ENVIRONMENT" = "staging" ]; then
        heroku addons:create heroku-postgresql:mini --app $APP_NAME
    else
        heroku addons:create heroku-postgresql:standard-0 --app $APP_NAME
    fi
    print_success "Added PostgreSQL addon"
else
    print_success "PostgreSQL addon already exists"
fi

# Add Redis addon
print_status "Adding Redis addon..."
if ! heroku addons:info heroku-redis --app $APP_NAME &> /dev/null; then
    if [ "$ENVIRONMENT" = "staging" ]; then
        heroku addons:create heroku-redis:mini --app $APP_NAME
    else
        heroku addons:create heroku-redis:premium-0 --app $APP_NAME
    fi
    print_success "Added Redis addon"
else
    print_success "Redis addon already exists"
fi

# Add monitoring addon (optional)
print_status "Adding monitoring addons..."
if ! heroku addons:info papertrail --app $APP_NAME &> /dev/null; then
    heroku addons:create papertrail:choklad --app $APP_NAME || print_warning "Could not add Papertrail addon"
fi

if ! heroku addons:info newrelic --app $APP_NAME &> /dev/null; then
    heroku addons:create newrelic:wayne --app $APP_NAME || print_warning "Could not add New Relic addon"
fi

# Set environment variables
print_status "Setting environment variables..."

heroku config:set NODE_ENV=$ENVIRONMENT --app $APP_NAME
heroku config:set PORT=\$PORT --app $APP_NAME

# Generate JWT secret if not provided
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    print_warning "Generated JWT_SECRET. Store this securely: $JWT_SECRET"
fi

heroku config:set JWT_SECRET="$JWT_SECRET" --app $APP_NAME

# Set other environment variables if provided
if [ -n "$CLERK_SECRET_KEY" ]; then
    heroku config:set CLERK_SECRET_KEY="$CLERK_SECRET_KEY" --app $APP_NAME
fi

if [ -n "$SENTRY_DSN" ]; then
    heroku config:set SENTRY_DSN="$SENTRY_DSN" --app $APP_NAME
fi

# Deploy the application
print_status "Deploying application..."

# Create a temporary directory for deployment
DEPLOY_DIR=$(mktemp -d)
cp -r . $DEPLOY_DIR
cd $DEPLOY_DIR

# Initialize git repository for Heroku deployment
git init
heroku git:remote --app $APP_NAME

# Add all files and commit
git add .
git commit -m "Deploy $ENVIRONMENT - $(date)"

# Push to Heroku
git push heroku main --force

# Clean up
cd - > /dev/null
rm -rf $DEPLOY_DIR

print_success "Deployment completed!"

# Wait for deployment to finish
print_status "Waiting for deployment to complete..."
sleep 30

# Run health check
print_status "Running health check..."
APP_URL="https://$APP_NAME.herokuapp.com"

if curl -f $APP_URL/health &> /dev/null; then
    print_success "Health check passed: $APP_URL/health"
else
    print_error "Health check failed: $APP_URL/health"
    print_error "Check the logs: heroku logs --tail --app $APP_NAME"
    exit 1
fi

# Display app information
print_success "Deployment Summary"
echo "=================="
echo "Environment: $ENVIRONMENT"
echo "App Name: $APP_NAME"
echo "App URL: $APP_URL"
echo "API Docs: $APP_URL/api-docs"
echo ""
echo "Useful commands:"
echo "heroku logs --tail --app $APP_NAME"
echo "heroku ps --app $APP_NAME"
echo "heroku config --app $APP_NAME"
echo ""
print_success "Deployment completed successfully!"