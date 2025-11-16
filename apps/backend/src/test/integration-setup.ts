// Test setup for integration tests
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout for integration tests
jest.setTimeout(60000);

// Setup test database connection
beforeAll(async () => {
  // This would typically connect to a test database
  console.log('Setting up integration test environment...');
});

// Cleanup after all tests
afterAll(async () => {
  // This would typically clean up database connections
  console.log('Cleaning up integration test environment...');
});

// Cleanup after each test
afterEach(async () => {
  // This would typically clean up test data
  // Example: await cleanupTestData();
});