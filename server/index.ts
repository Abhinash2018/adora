import { config } from 'dotenv';
config({ path: '.env.server' });
// Load the app after server-only settings. Never import this module into app/ or src/.
async function start() {
  const { app, errorHandler } = await import('./app');
  app.use(errorHandler);
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, process.env.HOST ?? '127.0.0.1', () => console.log(`Adora API listening on port ${port}`));
}
void start();
