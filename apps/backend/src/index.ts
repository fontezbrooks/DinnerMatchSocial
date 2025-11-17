import { createServer } from 'http';
import app from './app';
import { env } from './config/env';
import { testDatabaseConnection } from './config/database';
import { DinnerMatchSocketServer } from './socket/socketServer';

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

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.io server
    const socketServer = new DinnerMatchSocketServer(httpServer);
    console.log('⚡ Socket.io server initialized');

    // Start the server
    httpServer.listen(PORT, () => {
      console.log(`🚀 DinnerMatch server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔌 Socket.io server ready for connections`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async () => {
      console.log('📴 Received shutdown signal, starting graceful shutdown...');

      try {
        await socketServer.shutdown();
        httpServer.close(() => {
          console.log('✅ HTTP server closed');
          process.exit(0);
        });
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Override existing shutdown handlers
    process.removeAllListeners('SIGTERM');
    process.removeAllListeners('SIGINT');

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

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