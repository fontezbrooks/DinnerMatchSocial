import { Request, Response, NextFunction } from 'express';
import { addBreadcrumb, startTransaction, captureException } from './sentry.js';

/**
 * Request monitoring middleware that adds breadcrumbs and performance tracking
 */
export function requestMonitoring() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Start performance transaction
    const transaction = startTransaction(
      `${req.method} ${req.route?.path || req.path}`,
      'http.server'
    );

    // Add request breadcrumb
    addBreadcrumb(
      `${req.method} ${req.url}`,
      'http',
      'info',
      {
        url: req.url,
        method: req.method,
        headers: req.headers,
        query: req.query,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      }
    );

    // Track response time
    const startTime = Date.now();

    // Override res.json to capture response data
    const originalJson = res.json;
    res.json = function(data: any) {
      const responseTime = Date.now() - startTime;

      // Add response breadcrumb
      addBreadcrumb(
        `Response ${res.statusCode}`,
        'http.response',
        res.statusCode >= 400 ? 'error' : 'info',
        {
          statusCode: res.statusCode,
          responseTime,
          dataSize: JSON.stringify(data).length,
        }
      );

      // Set transaction tags
      transaction.setTag('http.status_code', res.statusCode.toString());
      transaction.setTag('http.method', req.method);
      transaction.setData('http.response_time', responseTime);

      // Finish transaction
      transaction.finish();

      // Call original json method
      return originalJson.call(this, data);
    };

    // Handle errors in middleware chain
    const originalNext = next;
    next = (error?: any) => {
      if (error) {
        transaction.setTag('error', true);
        transaction.setStatus('internal_error');
        captureException(error, {
          request: {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body,
          },
        });
      }
      transaction.finish();
      return originalNext(error);
    };

    next();
  };
}

/**
 * Health check monitoring middleware
 */
export function healthCheckMonitoring() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip monitoring for health checks to reduce noise
    if (req.path === '/health' || req.path === '/api/health') {
      return next();
    }
    return requestMonitoring()(req, res, next);
  };
}

/**
 * Error rate monitoring
 */
let errorCount = 0;
let requestCount = 0;
let lastReset = Date.now();

export function errorRateMonitoring() {
  return (req: Request, res: Response, next: NextFunction) => {
    requestCount++;

    // Reset counters every hour
    if (Date.now() - lastReset > 3600000) {
      errorCount = 0;
      requestCount = 0;
      lastReset = Date.now();
    }

    const originalNext = next;
    next = (error?: any) => {
      if (error) {
        errorCount++;

        // Alert if error rate exceeds threshold (>5% error rate)
        const errorRate = errorCount / requestCount;
        if (errorRate > 0.05 && requestCount > 50) {
          addBreadcrumb(
            `High error rate detected: ${(errorRate * 100).toFixed(2)}%`,
            'monitoring.alert',
            'error',
            {
              errorRate,
              errorCount,
              requestCount,
              timeWindow: '1 hour',
            }
          );
        }
      }
      return originalNext(error);
    };

    next();
  };
}

/**
 * Database query monitoring
 */
export function addDatabaseBreadcrumb(
  query: string,
  duration: number,
  error?: Error
) {
  addBreadcrumb(
    `Database query ${error ? 'failed' : 'completed'}`,
    'database',
    error ? 'error' : 'info',
    {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      duration,
      error: error?.message,
    }
  );
}

/**
 * Redis operation monitoring
 */
export function addRedisBreadcrumb(
  operation: string,
  key: string,
  duration: number,
  error?: Error
) {
  addBreadcrumb(
    `Redis ${operation} ${error ? 'failed' : 'completed'}`,
    'cache',
    error ? 'error' : 'info',
    {
      operation,
      key,
      duration,
      error: error?.message,
    }
  );
}