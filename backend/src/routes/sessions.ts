/**
 * Session endpoints — save and retrieve yoga session records.
 *
 *   POST   /api/sessions           save a completed session
 *   GET    /api/sessions           list current user's sessions (paginated)
 *   GET    /api/sessions/:id       get one session
 *   DELETE /api/sessions/:id       delete a session
 *
 * The frontend posts a SessionData object after a session ends.
 */
import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { db, type SessionRow } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const sessionsRouter = Router();
sessionsRouter.use(requireAuth);

const saveSchema = z.object({
    pose: z.string().min(1).max(64),
    startedAt: z.number().int().positive(),
    endedAt: z.number().int().positive(),
    avgScore: z.number().int().min(0).max(100),
    maxScore: z.number().int().min(0).max(100),
    minScore: z.number().int().min(0).max(100),
    totalFrames: z.number().int().min(0).default(0),
    perfectFrames: z.number().int().min(0).default(0),
    goodFrames: z.number().int().min(0).default(0),
    captureCount: z.number().int().min(0).default(0),
    metadata: z.record(z.unknown()).optional(),
});

sessionsRouter.post('/', (req, res) => {
    const parsed = saveSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid session', issues: parsed.error.issues });
    }
    const data = parsed.data;
    if (data.endedAt < data.startedAt) {
        return res.status(400).json({ error: 'endedAt must be >= startedAt' });
    }

    const id = randomUUID();
    const duration = Math.round((data.endedAt - data.startedAt) / 1000);

    db.prepare(
        `INSERT INTO sessions (
            id, user_id, pose, started_at, ended_at, duration_sec,
            avg_score, max_score, min_score,
            total_frames, perfect_frames, good_frames, capture_count,
            metadata_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
        id, req.user!.sub, data.pose, data.startedAt, data.endedAt, duration,
        data.avgScore, data.maxScore, data.minScore,
        data.totalFrames, data.perfectFrames, data.goodFrames, data.captureCount,
        data.metadata ? JSON.stringify(data.metadata) : null,
        Date.now()
    );

    const row = db
        .prepare<[string], SessionRow>(`SELECT * FROM sessions WHERE id = ?`)
        .get(id);
    return res.status(201).json({ session: row });
});

const listSchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
    pose: z.string().optional(),
});

sessionsRouter.get('/', (req, res) => {
    const parsed = listSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid query', issues: parsed.error.issues });
    }
    const { limit, offset, pose } = parsed.data;

    const where: string[] = ['user_id = ?'];
    const params: unknown[] = [req.user!.sub];
    if (pose) {
        where.push('pose = ?');
        params.push(pose);
    }

    const sessions = db
        .prepare<unknown[], SessionRow>(
            `SELECT * FROM sessions WHERE ${where.join(' AND ')}
             ORDER BY created_at DESC LIMIT ? OFFSET ?`
        )
        .all(...params, limit, offset);

    const total = (db
        .prepare<unknown[], { c: number }>(
            `SELECT COUNT(*) AS c FROM sessions WHERE ${where.join(' AND ')}`
        )
        .get(...params) || { c: 0 }).c;

    return res.json({ sessions, total, limit, offset });
});

sessionsRouter.get('/:id', (req, res) => {
    const row = db
        .prepare<[string, string], SessionRow>(
            `SELECT * FROM sessions WHERE id = ? AND user_id = ?`
        )
        .get(req.params.id, req.user!.sub);
    if (!row) return res.status(404).json({ error: 'Session not found' });
    return res.json({ session: row });
});

sessionsRouter.delete('/:id', (req, res) => {
    const result = db
        .prepare(`DELETE FROM sessions WHERE id = ? AND user_id = ?`)
        .run(req.params.id, req.user!.sub);
    if (result.changes === 0) return res.status(404).json({ error: 'Session not found' });
    return res.json({ ok: true });
});
