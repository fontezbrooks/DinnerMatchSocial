module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.integration.ts', '**/?(*.)+(integration).test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/integration-setup.ts'],
  testTimeout: 60000,
  verbose: true,
  // Run integration tests sequentially to avoid database conflicts
  maxWorkers: 1,
  // Don't collect coverage for integration tests (they're more about flow than coverage)
  collectCoverage: false,
};