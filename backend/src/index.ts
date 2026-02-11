import express from 'express';
import cors from 'cors';
import { appsRouter } from './routes/apps';
import { authRouter } from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Dashboard API (no auth — local only)
app.use('/api/apps', appsRouter);

// Auth API (used by consuming apps, requires x-api-key)
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`\n🔐 LocalAuth server running on http://localhost:${PORT}`);
    console.log(`📋 Dashboard API: http://localhost:${PORT}/api/apps`);
    console.log(`🔑 Auth API:      http://localhost:${PORT}/api/auth\n`);
});
