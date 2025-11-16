import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Express } from 'express';

/**
 * Initialize Sentry monitoring for the backend application
 */
export function initSentry(app: Express): void {
  if (!process.env.SENTRY_DSN) {
    console.warn('SENTRY_DSN not configured. Sentry monitoring disabled.');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      // Enable profiling
      new ProfilingIntegration(),
    ],
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Release tracking
    release: process.env.HEROKU_SLUG_COMMIT || process.env.npm_package_version,
    // User context
    beforeSend(event, hint) {
      // Filter out noisy errors in development
      if (process.env.NODE_ENV === 'development') {
        const error = hint.originalException;
        if (error && error.toString().includes('ECONNRESET')) {
          return null; // Don't send connection reset errors in dev
        }
      }
      return event;
    },
    // Additional options
    maxBreadcrumbs: 50,
    debug: process.env.NODE_ENV === 'development',
  });

  // Request handler must be the first middleware
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

  console.log(`✅ Sentry initialized for ${process.env.NODE_ENV} environment`);
}

/**
 * Add Sentry error handler middleware (must be after all routes)
 */
export function addSentryErrorHandler(app: Express): void {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  // Error handler must be after all other middleware and routes
  app.use(Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Send all errors to Sentry in production
      if (process.env.NODE_ENV === 'production') {
        return true;
      }
      // In development, only send 5xx errors
      return error.status ? error.status >= 500 : true;
    },
  }));
}

/**
 * Manually capture an exception with additional context
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional', context);
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture a message with level and context
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
): void {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional', context);
    }
    scope.setLevel(level);
    Sentry.captureMessage(message);
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Create a transaction for performance monitoring
 */
export function startTransaction(name: string, op: string): Sentry.Transaction {
  return Sentry.startTransaction({
    name,
    op,
  });
}

export { Sentry };