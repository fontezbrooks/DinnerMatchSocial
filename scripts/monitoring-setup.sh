#!/bin/bash

# Monitoring Setup Script
# Sets up Sentry monitoring and other monitoring tools

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

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

print_status "Setting up monitoring for DinnerMatch..."

# Install Sentry CLI
if ! command -v sentry-cli &> /dev/null; then
    print_status "Installing Sentry CLI..."
    curl -sL https://sentry.io/get-cli/ | bash
    print_success "Sentry CLI installed"
else
    print_success "Sentry CLI already installed"
fi

# Install monitoring dependencies
print_status "Installing monitoring dependencies..."

cd apps/backend

# Check if Sentry dependencies are installed
if ! npm list @sentry/node @sentry/profiling-node &> /dev/null; then
    print_status "Installing Sentry dependencies..."
    npm install @sentry/node @sentry/profiling-node
    print_success "Sentry dependencies installed"
else
    print_success "Sentry dependencies already installed"
fi

cd ../..

# Setup environment variables for monitoring
print_status "Setting up monitoring environment variables..."

if [ ! -f .env ]; then
    print_error ".env file not found. Please run setup-dev.sh first."
    exit 1
fi

# Check if SENTRY_DSN exists in .env
if ! grep -q "SENTRY_DSN" .env; then
    print_warning "SENTRY_DSN not found in .env file. Adding placeholder..."
    echo "" >> .env
    echo "# Sentry Configuration" >> .env
    echo "SENTRY_DSN=your_sentry_dsn_url" >> .env
    echo "SENTRY_AUTH_TOKEN=your_sentry_auth_token" >> .env
    echo "SENTRY_ORG=dinnermatch" >> .env
    echo "SENTRY_PROJECT=dinnermatch-backend" >> .env
fi

# Create monitoring dashboard configuration
print_status "Creating monitoring dashboard configuration..."

mkdir -p monitoring/dashboards

cat > monitoring/dashboards/sentry-dashboard.json << 'EOF'
{
  "title": "DinnerMatch Application Monitoring",
  "description": "Key metrics and error tracking for DinnerMatch application",
  "widgets": [
    {
      "title": "Error Rate",
      "type": "line",
      "queries": [
        {
          "name": "Error Rate",
          "query": "rate(errors) by (environment)"
        }
      ]
    },
    {
      "title": "Response Time",
      "type": "line",
      "queries": [
        {
          "name": "Average Response Time",
          "query": "avg(response_time) by (endpoint)"
        }
      ]
    },
    {
      "title": "Database Performance",
      "type": "line",
      "queries": [
        {
          "name": "Database Query Duration",
          "query": "avg(db_query_duration) by (query_type)"
        }
      ]
    },
    {
      "title": "Redis Performance",
      "type": "line",
      "queries": [
        {
          "name": "Redis Operation Duration",
          "query": "avg(redis_operation_duration) by (operation)"
        }
      ]
    }
  ]
}
EOF

# Create alerting rules
print_status "Creating monitoring alerts configuration..."

mkdir -p monitoring/alerts

cat > monitoring/alerts/error-rate.yml << 'EOF'
groups:
  - name: dinnermatch.errors
    rules:
      - alert: HighErrorRate
        expr: rate(errors[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}% over the last 5 minutes"

      - alert: CriticalErrorRate
        expr: rate(errors[5m]) > 0.10
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Critical error rate detected"
          description: "Error rate is {{ $value }}% over the last 2 minutes"

  - name: dinnermatch.performance
    rules:
      - alert: HighResponseTime
        expr: avg(response_time) > 2000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "Average response time is {{ $value }}ms over the last 5 minutes"

      - alert: DatabaseSlowQueries
        expr: avg(db_query_duration) > 1000
        for: 3m
        labels:
          severity: warning
        annotations:
          summary: "Slow database queries detected"
          description: "Average database query duration is {{ $value }}ms"
EOF

# Create monitoring documentation
print_status "Creating monitoring documentation..."

cat > monitoring/README.md << 'EOF'
# DinnerMatch Monitoring

This directory contains monitoring and observability configurations for DinnerMatch.

## Sentry Setup

1. Create a Sentry account at https://sentry.io
2. Create a new project for "dinnermatch-backend"
3. Copy the DSN and add it to your environment variables:
   ```
   SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

## Environment Variables

Required environment variables for monitoring:

- `SENTRY_DSN`: Sentry Data Source Name for error tracking
- `SENTRY_AUTH_TOKEN`: Sentry authentication token for CLI operations
- `SENTRY_ORG`: Your Sentry organization name
- `SENTRY_PROJECT`: Your Sentry project name

## Monitoring Features

### Error Tracking
- Automatic error capture and reporting
- Performance monitoring
- User context tracking
- Breadcrumb trails for debugging

### Performance Monitoring
- HTTP request/response tracking
- Database query performance
- Redis operation monitoring
- Custom transaction tracking

### Alerts
- High error rate alerts
- Performance degradation alerts
- Database slowdown notifications

## Dashboard Access

- **Sentry Dashboard**: https://sentry.io/organizations/dinnermatch/
- **Heroku Metrics**: Heroku dashboard for each app
- **Application Logs**: `heroku logs --tail --app your-app-name`

## Troubleshooting

1. **Sentry not receiving events**: Check DSN configuration
2. **Missing performance data**: Verify tracing is enabled
3. **High noise in errors**: Review error filtering in Sentry configuration
EOF

print_success "Monitoring setup completed!"

print_status "Next steps:"
echo "1. Create a Sentry account at https://sentry.io"
echo "2. Create a new project for 'dinnermatch-backend'"
echo "3. Update .env file with your Sentry DSN"
echo "4. Set up alerts in your Sentry project"
echo "5. Configure notification channels (email, Slack, etc.)"
echo ""
echo "Documentation available at: monitoring/README.md"