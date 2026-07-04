import { createApp } from './app.js';
import { env } from './config/env.js';
import { bootstrapDemoData } from './services/bootstrap.service.js';

const app = createApp();

const start = async () => {
  await bootstrapDemoData();

  app.listen(env.port, () => {
    console.log(`ParkWise backend listening on http://localhost:${env.port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start ParkWise backend:', error);
  process.exit(1);
});