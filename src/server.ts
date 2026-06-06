import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';
import { syncSchedulerService } from './modules/scheduler/sync-scheduler.service';

const PORT = env.PORT ? Number(env.PORT) : 3000;
const SHUTDOWN_TIMEOUT_MS = 10_000;
let isShuttingDown = false;

const server = app.listen(PORT, () => {
  console.log(`API server is running on port ${PORT}`);
  syncSchedulerService.startScheduler();
});

async function shutdown(signal: NodeJS.Signals) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Received ${signal}. Shutting down...`);
  const forceShutdownTimer = setTimeout(() => {
    console.error("Shutdown timeout exceeded. Forcing exit.");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceShutdownTimer.unref();

  try {
    syncSchedulerService.stopScheduler();

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    await prisma.$disconnect();
    clearTimeout(forceShutdownTimer);
    console.log('Shutdown complete');
    process.exit(0);
  } catch (error) {
    clearTimeout(forceShutdownTimer);
    console.error('Shutdown failed', error);
    process.exit(1);
  }
}

process.on('SIGINT', (signal) => {
  void shutdown(signal);
});

process.on('SIGTERM', (signal) => {
  void shutdown(signal);
});
