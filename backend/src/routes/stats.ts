/**
 * Aggregate stats for a user's progress dashboard.
 *
 *   GET /api/stats             overall summary
 *   GET /api/stats/weekly      last 7 days of activity
 *   GET /api/stats/poses       per-pose breakdown
 */
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const statsRouter = Router();
statsRouter.use(requireAuth);

statsRouter.get('/', (req, res) => {
    const userId = req.user!.sub;

    const summary = db
        .prepare<[string], {
            total_sessions: number;
            total_practice_sec: number;
            avg_score: number | null;
            max_score: number | null;
            unique_poses: number;
        }>(
            `SELECT
                COUNT(*) AS total_sessions,
                COALESCE(SUM(duration_sec), 0) AS total_practice_sec,
                AVG(avg_score) AS avg_score,
                MAX(max_score) AS max_score,
                COUNT(DISTINCT pose) AS unique_poses
             FROM sessions WHERE user_id = ?`
        )
        .get(userId)!;

    const lastSession = db
        .prepare<[string], { ended_at: number; pose: string; avg_score: number }>(
            `SELECT ended_at, pose, avg_score FROM sessions
             WHERE user_id = ? ORDER BY ended_at DESC LIMIT 1`
        )
        .get(userId);

    const achievements = db
        .prepare<[string], { c: number }>(
            `SELECT COUNT(*) AS c FROM achievements WHERE user_id = ?`
        )
        .get(userId)!;

    return res.json({
        totalSessions: summary.total_sessions,
        totalPracticeSec: summary.total_practice_sec,
        avgScore: summary.avg_score ? Math.round(summary.avg_score) : 0,
        maxScore: summary.max_score || 0,
        uniquePoses: summary.unique_poses,
        achievementsUnlocked: achievements.c,
        lastSession: lastSession || null,
    });
});

statsRouter.get('/weekly', (req, res) => {
    const userId = req.user!.sub;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Bucket sessions by day in JS (SQLite date math is fiddly)
    const rows = db
        .prepare<[string, number], { ended_at: number; avg_score: number }>(
            `SELECT ended_at, avg_score FROM sessions
             WHERE user_id = ? AND ended_at >= ?
             ORDER BY ended_at ASC`
        )
        .all(userId, sevenDaysAgo);

    const days: { date: string; sessions: number; avgScore: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const key = d.toISOString().split('T')[0];
        days.push({ date: key, sessions: 0, avgScore: 0 });
    }

    for (const row of rows) {
        const key = new Date(row.ended_at).toISOString().split('T')[0];
        const bucket = days.find((d) => d.date === key);
        if (bucket) {
            bucket.sessions += 1;
            // running average
            bucket.avgScore = Math.round(
                (bucket.avgScore * (bucket.sessions - 1) + row.avg_score) / bucket.sessions
            );
        }
    }

    return res.json({ days });
});

statsRouter.get('/poses', (req, res) => {
    const userId = req.user!.sub;
    const rows = db
        .prepare<[string], {
            pose: string;
            sessions: number;
            avg_score: number;
            max_score: number;
            total_sec: number;
        }>(
            `SELECT pose,
                    COUNT(*) AS sessions,
                    AVG(avg_score) AS avg_score,
                    MAX(max_score) AS max_score,
                    SUM(duration_sec) AS total_sec
             FROM sessions WHERE user_id = ?
             GROUP BY pose ORDER BY sessions DESC`
        )
        .all(userId);

    return res.json({
        poses: rows.map((r) => ({
            pose: r.pose,
            sessions: r.sessions,
            avgScore: Math.round(r.avg_score),
            maxScore: r.max_score,
            totalSec: r.total_sec,
        })),
    });
});
