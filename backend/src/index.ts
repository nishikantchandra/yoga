/**
 * Express application entry point. Wires together:
 *  - CORS, JSON body parsing
 *  - /api/health         readiness probe
 *  - /api/auth/*         register / login / refresh / logout
 *  - /api/users/me       authed user profile
 *  - /api/sessions/*     yoga session storage
 *  - /api/stats/*        aggregate stats
 *  - /api/achievements/* unlocked achievements
 *  - WebSocket /ws/studio for live class sync
 */
import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { config } from './config.js';
import { authRouter } from './auth/routes.js';
import { usersRouter } from './routes/users.js';
import { sessionsRouter } from './routes/sessions.js';
import { statsRouter } from './routes/stats.js';
import { achievementsRouter } from './routes/achievements.js';
import { attachStudioWebSocket } from './ws/studio.js';

const app = express();

app.use(
    cors({
        origin: (origin, cb) => {
            // Allow same-origin / curl (no Origin header) and configured origins
            if (!origin || config.corsOrigins.includes(origin)) {
                return cb(null, true);
            }
            return cb(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
    })
);
app.use(express.json({ limit: '256kb' }));

// Tiny request log in dev
if (config.isDev) {
    app.use((req, _res, next) => {
        const t = Date.now();
        _res.on('finish', () => {
            console.log(`${req.method} ${req.path} ${_res.statusCode} ${Date.now() - t}ms`);
        });
        next();
    });
}

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'yoga-backend', time: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/achievements', achievementsRouter);

// 404
app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Centralised error handler
app.use(
    (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[error]', err);
        res.status(500).json({ error: 'Internal server error', detail: config.isDev ? message : undefined });
    }
);

const server = createServer(app);
attachStudioWebSocket(server);

server.listen(config.port, () => {
    console.log(`🧘 YogaAI backend listening on http://localhost:${config.port}`);
    console.log(`   env: ${config.nodeEnv}`);
    console.log(`   db:  ${config.db.path}`);
    console.log(`   cors: ${config.corsOrigins.join(', ')}`);
});
