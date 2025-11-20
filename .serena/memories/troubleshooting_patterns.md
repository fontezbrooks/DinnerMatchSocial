# DinnerMatchSocial - Troubleshooting Patterns & Solutions

## Authentication Issues

### "You are already logged in" Error
**Symptoms**: User gets error despite not being logged in
**Root Cause**: Auth state inconsistency between Clerk and navigation
**Solution Pattern**:
```typescript
// 1. Dual validation in navigation
const shouldShowAuth = !isSignedIn || !user;

// 2. Auto-cleanup on component mount
useEffect(() => {
  const clearAuthState = async () => {
    try {
      await signOut();
    } catch (error) {
      console.log('Auth cleanup completed');
    }
  };
  clearAuthState();
}, [signOut]);

// 3. Smart error handling with recovery
if (errorMessage.toLowerCase().includes("already signed in")) {
  try {
    await signOut();
    setError("Please try signing in again");
  } catch (signOutError) {
    setError("Authentication state error. Please restart the app.");
  }
}

// 4. Manual recovery button
<Button
  title="Clear Auth State & Retry"
  onPress={async () => {
    try {
      await signOut();
      setError(null);
    } catch (e) {
      setError("Please restart the app to clear auth state");
    }
  }}
/>
```

### AuthStateManager Component Pattern
```typescript
// Proactive auth consistency monitoring
export const AuthStateManager = () => {
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn, user } = useAuth();

  useEffect(() => {
    const checkAuthConsistency = async () => {
      if (!isLoaded) return;
      
      // If Clerk says signed in but no user object
      if (isSignedIn && !user) {
        try {
          await signOut();
          await SecureStore.deleteItemAsync('socket_token');
        } catch (error) {
          console.error('Failed to clear auth state:', error);
        }
      }
    };

    checkAuthConsistency();
  }, [isLoaded, isSignedIn, user, signOut]);

  return null;
};
```

## Backend Configuration Issues

### Environment Variable Validation Errors
**Symptoms**: ZodError on server startup
**Root Cause**: Missing required environment variables
**Solution Pattern**:
```typescript
// Make external API keys optional in development
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  YELP_API_KEY: z.string().min(10).optional().default('dev_placeholder_yelp_key_minimum_10_chars'),
  SPOONACULAR_API_KEY: z.string().min(10).optional().default('dev_placeholder_spoonacular_key_minimum_10_chars'),
  // Required keys remain strict
  JWT_SECRET: z.string().min(32),
});
```

### Middleware Import Errors
**Symptoms**: "Router.use() requires a middleware function"
**Root Cause**: Incorrect import/export names
**Solution Pattern**:
```typescript
// Verify export matches import
// auth.ts
export const authenticateToken = (req, res, next) => { ... };

// routes/discovery.ts  
import { authenticateToken } from '../middleware/auth';
router.use(authenticateToken); // Not just 'auth'
```

### Port Conflicts
**Symptoms**: EADDRINUSE error
**Root Cause**: Previous server instances still running
**Solution**:
```bash
# Kill existing processes
lsof -ti:3000 | xargs kill -9
# Or restart with process cleanup
npm run dev
```

## Development Environment Issues

### Database Connection Failures
**Symptoms**: Connection timeout or authentication failed
**Solution Pattern**:
```bash
# Check Docker services
docker-compose ps

# Restart services if needed
docker-compose down postgres redis
docker-compose up -d postgres redis

# Verify connectivity
docker exec dinnermatch-postgres pg_isready -U postgres
docker exec dinnermatch-redis redis-cli ping
```

### Frontend Build Issues
**Symptoms**: Metro bundler errors, import failures
**Solution Pattern**:
```bash
# Clear Metro cache
npx expo start --clear

# Clear node_modules if persistent
rm -rf node_modules .expo
bun install

# Check TypeScript configuration
bun run type-check
```

## Real-time Communication Issues

### Socket.io Connection Failures
**Symptoms**: WebSocket connection errors
**Diagnostic Steps**:
```typescript
// Check authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('Socket auth failed:', err);
    next(new Error('Authentication failed'));
  }
});

// Verify Redis connectivity for scaling
const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  retryDelayOnFailover: 100,
});
```

## Performance Issues

### Slow API Responses
**Diagnostic Pattern**:
1. Check rate limiting configuration
2. Verify database query performance
3. Monitor external API response times
4. Review middleware stack overhead

### Memory Leaks
**Common Causes**:
- Unclosed database connections
- Event listeners not cleaned up
- Socket.io connections not properly disconnected
- Timers/intervals not cleared

## Prevention Strategies

### Health Monitoring
```typescript
// Health endpoint with dependency checks
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      redis: 'unknown'
    }
  };

  try {
    await db.raw('SELECT 1');
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  res.json(health);
});
```

### Graceful Error Recovery
```typescript
// Process-level error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  gracefulShutdown();
});
```

### Development Best Practices
1. Always use environment validation schemas
2. Implement health checks for all external dependencies
3. Add comprehensive error handling with user recovery options
4. Use TypeScript strict mode to catch type issues early
5. Implement graceful degradation for external service failures