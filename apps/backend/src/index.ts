import app from './app';
import { env } from './config/env';
import { testDatabaseConnection } from './config/database';

const PORT = env.PORT;

async function startServer() {
  try {
    // Test database connections
    console.log('🔍 Testing database connections...');
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
      console.error('❌ Failed to connect to PostgreSQL');
      process.exit(1);
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 DinnerMatch API server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('🔥 Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('🔥 Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();