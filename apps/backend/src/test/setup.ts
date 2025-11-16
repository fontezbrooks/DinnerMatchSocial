// Test setup for unit tests
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock external dependencies
jest.mock('../middleware/sentry', () => ({
  initSentry: jest.fn(),
  addSentryErrorHandler: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUserContext: jest.fn(),
  addBreadcrumb: jest.fn(),
  startTransaction: jest.fn(() => ({
    setTag: jest.fn(),
    setData: jest.fn(),
    setStatus: jest.fn(),
    finish: jest.fn(),
  })),
}));

// Global test timeout
jest.setTimeout(30000);

// Suppress console output during tests (unless debugging)
if (!process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}