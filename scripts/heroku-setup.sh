#!/bin/bash

# Heroku Initial Setup Script
# This script sets up Heroku applications and required addons

set -e

print_status() {
    echo -e "\033[0;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[0;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[0;31m[ERROR]\033[0m $1"
}

# Check prerequisites
if ! command -v heroku &> /dev/null; then
    print_error "Heroku CLI not found. Please install: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

if ! heroku auth:whoami &> /dev/null; then
    print_error "Please login to Heroku first: heroku login"
    exit 1
fi

print_status "Setting up Heroku applications for DinnerMatch..."

# Create staging app
STAGING_APP="dinnermatch-staging"
print_status "Creating staging app: $STAGING_APP"

if ! heroku apps:info $STAGING_APP &> /dev/null; then
    heroku create $STAGING_APP --region us
    heroku stack:set container --app $STAGING_APP
    print_success "Created staging app"
else
    print_success "Staging app already exists"
fi

# Create production app
PRODUCTION_APP="dinnermatch-production"
print_status "Creating production app: $PRODUCTION_APP"

if ! heroku apps:info $PRODUCTION_APP &> /dev/null; then
    heroku create $PRODUCTION_APP --region us
    heroku stack:set container --app $PRODUCTION_APP
    print_success "Created production app"
else
    print_success "Production app already exists"
fi

# Setup staging addons
print_status "Setting up staging addons..."
heroku addons:create heroku-postgresql:mini --app $STAGING_APP || true
heroku addons:create heroku-redis:mini --app $STAGING_APP || true
heroku addons:create papertrail:choklad --app $STAGING_APP || true

# Setup production addons
print_status "Setting up production addons..."
heroku addons:create heroku-postgresql:standard-0 --app $PRODUCTION_APP || true
heroku addons:create heroku-redis:premium-0 --app $PRODUCTION_APP || true
heroku addons:create papertrail:choklad --app $PRODUCTION_APP || true
heroku addons:create newrelic:wayne --app $PRODUCTION_APP || true

# Set basic config vars
print_status "Setting basic configuration variables..."

# Staging config
heroku config:set NODE_ENV=staging --app $STAGING_APP
heroku config:set PORT=\$PORT --app $STAGING_APP

# Production config
heroku config:set NODE_ENV=production --app $PRODUCTION_APP
heroku config:set PORT=\$PORT --app $PRODUCTION_APP

print_success "Heroku setup completed!"
print_status "Next steps:"
echo "1. Set secrets using: heroku config:set KEY=value --app APP_NAME"
echo "2. Required secrets:"
echo "   - JWT_SECRET"
echo "   - CLERK_SECRET_KEY"
echo "   - SENTRY_DSN"
echo ""
echo "Applications created:"
echo "- Staging: https://$STAGING_APP.herokuapp.com"
echo "- Production: https://$PRODUCTION_APP.herokuapp.com"