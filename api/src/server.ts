import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { sql } from 'drizzle-orm';
import { db } from './db';
import authRoutes from './routes/authRoutes';
import petRoutes from './routes/petRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import imageRoutes from './routes/imageRoutes';
import requestRoutes from './routes/requestRoutes';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 200, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/health/db', async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ db: 'connected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ db: 'failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/requests', requestRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON' });
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'Image is too large (max 10 MB)' });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});

app.listen(env.PORT, () => console.log(`API on http://localhost:${env.PORT}`));