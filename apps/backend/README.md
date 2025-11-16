# DinnerMatch Backend API

Express.js API server for DinnerMatch Social app with PostgreSQL and Redis.

## Quick Start

```bash
# Run setup script
node setup.js

# Install dependencies (if not done by setup)
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
# Generate JWT secrets with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Start PostgreSQL and Redis
# macOS with Homebrew:
brew services start postgresql
brew services start redis

# Create database
createdb dinnermatch

# Run migrations
npm run migrate:latest

# Seed database
npm run seed:run

# Start development server
npm run dev
```

## API Documentation

Once the server is running, visit: http://localhost:3001/api-docs

## Environment Variables

Copy `.env.example` to `.env` and configure:

- **Database**: PostgreSQL connection details
- **Redis**: Redis connection for session management
- **JWT**: Secrets for authentication (generate with crypto.randomBytes)
- **CORS**: Frontend URL for cross-origin requests

## Database Schema

### Core Tables

- **users**: User accounts with OAuth support
- **groups**: Dining groups with invite codes
- **group_members**: Group membership with roles
- **sessions**: Voting sessions with status tracking
- **session_votes**: Individual votes on restaurants/dishes
- **matches**: Final matched results from voting

### Key Features

- UUID primary keys
- Soft deletes with `is_active` flags
- JSON columns for flexible data (dietary restrictions, item data)
- Proper foreign key constraints and indexes
- Database-level enums for status values

## API Routes

### Authentication
- `POST /api/auth/login` - Login/register user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout (token blacklisting)

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `DELETE /api/users/me` - Deactivate account

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/join` - Join group with invite code
- `POST /api/groups/:id/leave` - Leave group

### Sessions
- `POST /api/sessions` - Create voting session
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions/:id/vote` - Submit vote
- `GET /api/sessions/:id/votes` - Get session votes
- `PUT /api/sessions/:id/status` - Update session status

## Redis Session Management

Sessions use Redis for real-time state:

```javascript
// Session state structure
{
  id: "session-uuid",
  group_id: "group-uuid",
  status: "active",
  participants: ["user-id-1", "user-id-2"],
  votes: {
    "user-id": {
      "restaurant-id": { vote: "like", timestamp: "..." }
    }
  },
  current_items: [...], // Current restaurants being voted on
  round_number: 1
}
```

## Security Features

- JWT-based authentication with refresh tokens
- Rate limiting on all endpoints
- Helmet.js security headers
- CORS configuration
- Input validation with Zod schemas
- SQL injection protection via Knex query builder

## Development

```bash
# Watch mode
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Database operations
npm run migrate:latest    # Run latest migrations
npm run migrate:rollback  # Rollback last migration
npm run seed:run         # Run seed data
npm run db:reset         # Reset DB and reseed
```

## Testing Endpoints

Use the seeded data to test the API:

1. **Login**: POST to `/api/auth/login` with any seeded user email
2. **Get Groups**: GET `/api/groups` with the returned JWT
3. **Create Session**: POST to `/api/sessions` with a group_id
4. **Submit Votes**: POST to `/api/sessions/:id/vote` with restaurant data

## Production Deployment

1. Set `NODE_ENV=production`
2. Use production database and Redis instances
3. Configure proper JWT secrets (32+ character strings)
4. Set up reverse proxy (nginx) for static assets and rate limiting
5. Enable database connection pooling
6. Configure logging and monitoring

## Project Structure

```
apps/backend/
├── src/
│   ├── config/          # Database and environment config
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route handlers
│   ├── app.ts          # Express app configuration
│   └── index.ts        # Server entry point
├── migrations/         # Database schema migrations
├── seeds/             # Sample data for development
├── package.json       # Dependencies and scripts
├── knexfile.js       # Database configuration
└── tsconfig.json     # TypeScript configuration
```