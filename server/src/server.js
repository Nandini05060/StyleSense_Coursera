import app from './app.js';
import { config } from './config/env.js';
import { initDatabaseConnection } from './config/db.js';

async function startServer() {
  console.log('======================================================');
  console.log('  ✨ Starting StyleSense AI Backend Server');
  console.log('======================================================');

  // Attempt database connection (or initialize in-memory simulation)
  await initDatabaseConnection();

  const server = app.listen(config.port, () => {
    console.log(`[Server] StyleSense AI API running on http://localhost:${config.port}`);
    console.log(`[Server] Health check: http://localhost:${config.port}/api/health`);
    console.log(`[Server] Mode: ${config.nodeEnv}`);
    console.log('======================================================\n');
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server terminated.');
      process.exit(0);
    });
  });
}

startServer();
