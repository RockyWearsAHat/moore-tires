import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import cors from 'cors';
import helmet from 'helmet';
import { connectDb } from '@moore-tires/db';
import { authRouter } from './routes/auth.js';
import { productsRouter } from './routes/products.js';
import { ordersRouter } from './routes/orders.js';
import { inventoryRouter } from './routes/inventory.js';
import { checkoutRouter } from './routes/checkout.js';
import { distributionCenterRouter } from './routes/distribution-centers.js';
import { serviceRequestsRouter } from './routes/service-requests.js';
import { jobsRouter } from './routes/jobs.js';
import { webhooksRouter } from './routes/webhooks.js';
import { initSocket } from './socket.js';
import { startSmsWorker } from './workers/sms.worker.js';
import { startPushWorker } from './workers/push.worker.js';
import { errorHandler } from './middleware/error.js';
import { strictSanitize } from './middleware/sanitize.js';

const app = express();
const httpServer = createServer(app);

// ── Security middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
// Raw body needed for Twilio webhook signature validation
app.use('/api/v1/webhooks', express.urlencoded({ extended: false }));
app.use(express.json({ limit: '1mb' }));
app.use(strictSanitize);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/checkout', checkoutRouter);
app.use('/api/v1/distribution-centers', distributionCenterRouter);
app.use('/api/v1/service-requests', serviceRequestsRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/webhooks', webhooksRouter);

// ── Global error handler — must be last ───────────────────────────────────────
app.use(errorHandler);

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const PORT = Number(process.env['API_PORT'] ?? 3001);

async function main(): Promise<void> {
  await connectDb();
  initSocket(httpServer);
  startSmsWorker();
  startPushWorker();

  httpServer.listen(PORT, () => {
    console.warn(`✅ Moore Tires API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
