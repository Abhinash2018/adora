import { config } from 'dotenv';
config({ path: '.env.server' });
// Load the app after server-only settings. Never import this module into app/ or src/.
async function start() {
const { app, errorHandler, database } = await import('./app');
const { registerAI } = await import('./ai');
registerAI(app, database);
const { registerCampaigns } = await import('./campaigns');
registerCampaigns(app, database);
  app.use(errorHandler);
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, process.env.HOST ?? '127.0.0.1', () => console.log(`Adora API listening on port ${port}`));
}
void start();
