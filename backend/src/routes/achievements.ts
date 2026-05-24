/**
 * Achievements:
 *   GET  /api/achievements          list user's unlocked achievements
 *   POST /api/achievements/unlock   mark an achievement as unlocked (idempotent)
 *
 * The full achievement catalog lives in the frontend (id + title + icon).
 * The backend only stores which ids are unlocked.
 */
import { Router } from 'express';
import { z } from 'zod';
import { db, type AchievementRow } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const achievementsRouter = Router();
achievementsRouter.use(requireAuth);

achievementsRouter.get('/', (req, res) => {
    const rows = db
        .prepare<[string], AchievementRow>(
            `SELECT * FROM achievements WHERE user_id = ? ORDER BY unlocked_at ASC`
        )
        .all(req.user!.sub);
    return res.json({
        achievements: rows.map((r) => ({
            achievementId: r.achievement_id,
            unlockedAt: r.unlocked_at,
        })),
    });
});

const unlockSchema = z.object({
    achievementId: z.string().min(1).max(64),
});

achievementsRouter.post('/unlock', (req, res) => {
    const parsed = unlockSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', issues: parsed.error.issues });
    }
    const { achievementId } = parsed.data;

    // Idempotent insert (UNIQUE constraint on user_id + achievement_id)
    try {
        db.prepare(
            `INSERT INTO achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?)`
        ).run(req.user!.sub, achievementId, Date.now());
        return res.status(201).json({ ok: true, alreadyUnlocked: false });
    } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('UNIQUE')) {
            return res.json({ ok: true, alreadyUnlocked: true });
        }
        throw err;
    }
});
