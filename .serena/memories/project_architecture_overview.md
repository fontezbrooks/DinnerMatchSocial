# DinnerMatchSocial - Project Architecture Overview

## Project Structure
```
DinnerMatchSocial/
├── apps/
│   ├── frontend/          # React Native + Expo app
│   └── backend/           # Express.js API server
├── docker-compose.yml     # Infrastructure services
└── .claude/              # Claude Code configuration
```

## Technology Stack

### Frontend (React Native + Expo)
- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand for real-time state
- **Authentication**: Clerk integration with secure storage
- **UI**: Custom components with theme system
- **TypeScript**: Strict configuration with path aliases

### Backend (Express.js)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with comprehensive middleware
- **Real-time**: Socket.io with Redis scaling
- **Database**: PostgreSQL with Knex.js ORM
- **Authentication**: JWT tokens with Clerk integration
- **API**: RESTful design with OpenAPI documentation

### Infrastructure
- **Containerization**: Docker Compose for development
- **Database**: PostgreSQL with Redis for caching/sessions
- **Monitoring**: Health checks and logging
- **Development**: Hot reload for both frontend/backend

## Key Configuration Patterns

### Environment Management
```typescript
// Zod validation with development fallbacks
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  JWT_SECRET: z.string().min(32),
  CLERK_PUBLISHABLE_KEY: z.string(),
  YELP_API_KEY: z.string().min(10).optional().default('dev_placeholder_yelp_key_minimum_10_chars'),
  SPOONACULAR_API_KEY: z.string().min(10).optional().default('dev_placeholder_spoonacular_key_minimum_10_chars'),
});
```

### Authentication Flow
```typescript
// Frontend: Clerk + Expo Router integration
const { isLoaded, isSignedIn, user } = useAuth();
const shouldShowAuth = !isSignedIn || !user; // Dual validation

// Backend: JWT middleware with Socket.io
export const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const decoded = jwt.verify(token, env.JWT_SECRET);
  req.user = decoded;
  next();
};
```

### Real-time Architecture
```typescript
// Socket.io with authentication and Redis scaling
io.use(async (socket, next) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});
```

## Development Workflow

### Prerequisites
```bash
# Install dependencies
cd apps/frontend && bun install
cd apps/backend && npm install

# Start infrastructure
docker-compose up -d postgres redis

# Environment setup
cp .env.example .env
```

### Development Commands
```bash
# Frontend development
cd apps/frontend
bun start          # Start Expo dev server
bun ios           # iOS simulator
bun android       # Android emulator
bun web           # Web development

# Backend development
cd apps/backend
npm run dev       # Start with hot reload
npm run migrate   # Database migrations
npm run test      # Run test suite
```

### Quality Assurance
```bash
# Code quality
npm run lint      # ESLint validation
npm run type-check # TypeScript validation
npm run format    # Prettier formatting

# Testing
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e         # End-to-end tests
```

## External Integrations

### Authentication (Clerk)
- User management and authentication flows
- Secure token storage with expo-secure-store
- Social login support (Google, Facebook)

### Restaurant Discovery (Yelp API)
- Restaurant search and details
- Location-based filtering
- Review and rating integration

### Recipe Discovery (Spoonacular API)
- Recipe search and details
- Ingredient-based search
- Nutritional information

## Security Implementation

### Rate Limiting
```typescript
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 auth attempts per IP
});
```

### CORS Configuration
```typescript
app.use(cors({
  origin: [env.FRONTEND_URL, 'http://localhost:19006'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Common Troubleshooting Patterns

### Backend Startup Issues
1. Check environment variables with Zod validation
2. Verify database connectivity
3. Validate middleware imports and exports
4. Check port availability and conflicts

### Authentication State Issues
1. Implement dual validation (isSignedIn && user)
2. Add auto-cleanup on mount/unmount
3. Provide manual recovery options
4. Monitor token expiration and refresh

### Real-time Connection Issues
1. Verify Socket.io authentication middleware
2. Check Redis connectivity for scaling
3. Validate CORS configuration
4. Monitor connection lifecycle events