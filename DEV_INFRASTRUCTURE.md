# DinnerMatch Development Infrastructure

Complete development infrastructure setup for DinnerMatch including Docker environment, CI/CD pipeline, and deployment configuration.

## 🚀 Quick Start (< 10 minutes)

```bash
# 1. Clone the repository
git clone <repository-url>
cd DinnerMatchSocial

# 2. Run the development setup script
./scripts/setup-dev.sh

# 3. Access the application
# Frontend: http://localhost:8081
# Backend: http://localhost:3000
# API Docs: http://localhost:3000/api-docs
```

## 📁 Project Structure

```
DinnerMatchSocial/
├── apps/
│   ├── backend/           # Node.js API server
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── Dockerfile.dev
│   │   └── package.json
│   └── frontend/          # React Native Expo app
│       ├── app/
│       ├── Dockerfile
│       └── package.json
├── .github/
│   └── workflows/         # CI/CD pipeline configurations
├── scripts/               # Development and deployment scripts
├── monitoring/            # Monitoring configurations
├── docker-compose.yml     # Production Docker setup
├── docker-compose.dev.yml # Development overrides
└── .env.example          # Environment variables template
```

## 🐳 Docker Environment

### Services Included

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Caching and sessions |
| Backend API | 3000 | Node.js/Express API |
| Frontend | 8081 | Expo development server |
| PgAdmin | 5050 | Database admin interface |
| Redis Commander | 8082 | Redis admin interface |

### Development Commands

```bash
# Start all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Rebuild services
docker-compose build [service-name]

# Execute commands in containers
docker-compose exec backend npm run migrate:latest
docker-compose exec postgres psql -U postgres -d dinnermatch
```

### Service URLs

- **Frontend (Expo)**: http://localhost:8081
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **PgAdmin**: http://localhost:5050 (admin@dinnermatch.com / admin)
- **Redis Commander**: http://localhost:8082

## 🔧 Environment Configuration

### Required Environment Variables

Create `.env` file from `.env.example`:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dinnermatch
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Redis
REDIS_URL=redis://localhost:6379

# API
JWT_SECRET=your-jwt-secret-change-in-production
API_BASE_URL=http://localhost:3000

# Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Monitoring
SENTRY_DSN=your_sentry_dsn_url
```

### Environment-Specific Configuration

- **Development**: Uses `.env` file and Docker Compose
- **Staging**: Heroku with staging-specific config vars
- **Production**: Heroku with production-specific config vars

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### Continuous Integration (`ci.yml`)
Triggered on: Pull requests and pushes to main/develop

**Jobs:**
- **Backend Tests**: TypeScript, ESLint, Prettier, unit tests
- **Frontend Tests**: Type checking, linting, formatting, unit tests
- **Security Scan**: Dependency audit, vulnerability scanning
- **Build Test**: Docker image builds
- **Integration Tests**: Full application testing
- **Code Quality**: SonarCloud analysis

#### Continuous Deployment (`cd.yml`)
Triggered on: Successful CI completion on main branch

**Stages:**
1. **Deploy to Staging**: Automatic deployment to staging environment
2. **Smoke Tests**: Automated testing on staging
3. **Deploy to Production**: Manual approval required
4. **Rollback**: Automatic rollback on deployment failure

#### Security Scanning (`security.yml`)
Triggered on: Push, PR, and weekly schedule

**Scans:**
- Dependency vulnerabilities
- Code security analysis
- Secret detection
- Docker image vulnerabilities

### Branch Protection Rules

Configure in GitHub repository settings:

```yaml
Rules for main branch:
- Require pull request reviews (1 reviewer minimum)
- Require status checks to pass before merging
- Require CI workflow to complete successfully
- Dismiss stale PR approvals when new commits are pushed
- Require administrators to follow rules
```

## 🚀 Deployment

### Heroku Setup

```bash
# Initial Heroku setup
./scripts/heroku-setup.sh

# Deploy to staging
./scripts/deploy-heroku.sh staging

# Deploy to production
./scripts/deploy-heroku.sh production
```

### Heroku Applications

- **Staging**: dinnermatch-staging.herokuapp.com
- **Production**: dinnermatch-production.herokuapp.com

### Required Heroku Addons

| Addon | Staging | Production |
|-------|---------|------------|
| PostgreSQL | mini | standard-0 |
| Redis | mini | premium-0 |
| Papertrail | choklad | choklad |
| New Relic | - | wayne |

### Heroku Configuration Variables

Set via Heroku dashboard or CLI:

```bash
# Required secrets
heroku config:set JWT_SECRET=your-production-jwt-secret --app dinnermatch-production
heroku config:set CLERK_SECRET_KEY=your-clerk-secret --app dinnermatch-production
heroku config:set SENTRY_DSN=your-sentry-dsn --app dinnermatch-production
```

## 📊 Monitoring & Observability

### Sentry Integration

**Features:**
- Error tracking and alerting
- Performance monitoring
- User session tracking
- Release tracking

**Setup:**
```bash
./scripts/monitoring-setup.sh
```

**Configuration:**
- Create Sentry account at https://sentry.io
- Update `.env` with your Sentry DSN
- Configure alerts in Sentry dashboard

### Monitoring Dashboards

- **Sentry Dashboard**: Error tracking and performance
- **Heroku Metrics**: Application performance metrics
- **Papertrail**: Centralized logging
- **New Relic** (Production): APM and infrastructure monitoring

### Key Metrics Tracked

- API response times
- Error rates and types
- Database query performance
- Cache hit rates
- User authentication flows
- Memory and CPU usage

## 🔒 Security

### Implemented Security Measures

- **Dependency Scanning**: Automated vulnerability detection
- **Secret Scanning**: Prevent credential leaks
- **Docker Security**: Container vulnerability scanning
- **Code Analysis**: Static security analysis
- **HTTPS Enforcement**: SSL/TLS for all communications
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Request sanitization

### Security Workflows

- Weekly automated security scans
- Dependency update notifications
- Security alert notifications via Slack

## 🛠️ Development Workflow

### Local Development

1. **Setup**: Run `./scripts/setup-dev.sh`
2. **Code**: Make changes in `apps/backend/` or `apps/frontend/`
3. **Test**: Services auto-reload on file changes
4. **Debug**: Use Docker logs and IDE debuggers

### Git Workflow

1. **Create Feature Branch**: `git checkout -b feature/your-feature`
2. **Develop**: Make changes with frequent commits
3. **Test Locally**: Ensure all services work
4. **Push**: `git push origin feature/your-feature`
5. **Create PR**: GitHub pull request with CI checks
6. **Review**: Code review and approval
7. **Merge**: Automatic deployment to staging

### Code Quality

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Tests**: Unit and integration tests
- **Coverage**: Test coverage reporting

## 🚨 Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Services won't start
docker-compose down -v && docker-compose build && docker-compose up -d

# Database connection issues
docker-compose exec postgres pg_isready -U postgres

# Permission issues
sudo chown -R $USER:$USER .
```

#### Development Issues
```bash
# Node modules issues
rm -rf apps/*/node_modules && ./scripts/setup-dev.sh

# Port conflicts
docker-compose down && sudo lsof -ti:5432,6379,3000,8081 | xargs kill

# Environment variables
cp .env.example .env && edit .env
```

#### Deployment Issues
```bash
# Heroku deployment fails
heroku logs --tail --app your-app-name
heroku ps --app your-app-name

# CI/CD pipeline fails
Check GitHub Actions logs for specific error details
```

### Getting Help

1. **Check logs**: Docker Compose logs or Heroku logs
2. **Review documentation**: This file and README files
3. **GitHub Issues**: Create issue with error details
4. **Team Slack**: #dinnermatch-dev channel

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [Sentry Documentation](https://docs.sentry.io/)

## ✅ Success Criteria

- [ ] `docker-compose up` starts entire stack in < 2 minutes
- [ ] GitHub Actions runs successfully on every PR
- [ ] Staging deployment completes automatically on main merge
- [ ] Production deployment requires manual approval
- [ ] Monitoring captures and reports errors
- [ ] Developer can onboard in < 10 minutes
- [ ] All health checks pass
- [ ] API documentation is accessible
- [ ] Security scans run without critical issues