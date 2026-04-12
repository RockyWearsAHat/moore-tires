import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import cors from 'cors';
import helmet from 'helmet';
import { connectDb } from '@moore-tires/db';
import { serviceRequestsRouter } from './routes/service-requests.js';
import { jobsRouter } from './routes/jobs.js';
import { webhooksRouter } from './routes/webhooks.js';
import { initSocket } from './socket.js';
import { startSmsWorker } from './workers/sms.worker.js';
import { startPushWorker } from './workers/push.worker.js';
import { errorHandler } from './middleware/error.js';

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

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
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
