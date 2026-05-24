/**
 * User profile endpoints:
 *   GET    /api/users/me       current authed user
 *   PATCH  /api/users/me       update name / avatar
 *   DELETE /api/users/me       delete account (revokes all tokens, cascades data)
 */
import { Router } from 'express';
import { z } from 'zod';
import { db, sanitizeUser, type UserRow } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { revokeAllRefreshTokensForUser } from '../auth/jwt.js';

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get('/me', (req, res) => {
    const user = db
        .prepare<[string], UserRow>(`SELECT * FROM users WHERE id = ?`)
        .get(req.user!.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: sanitizeUser(user) });
});

const patchSchema = z.object({
    name: z.string().min(1).max(80).optional(),
    avatar: z.string().url().max(500).nullable().optional(),
});

usersRouter.patch('/me', (req, res) => {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', issues: parsed.error.issues });
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    if (parsed.data.name !== undefined) {
        fields.push('name = ?');
        values.push(parsed.data.name);
    }
    if (parsed.data.avatar !== undefined) {
        fields.push('avatar = ?');
        values.push(parsed.data.avatar);
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(req.user!.sub);

    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    const user = db
        .prepare<[string], UserRow>(`SELECT * FROM users WHERE id = ?`)
        .get(req.user!.sub)!;
    return res.json({ user: sanitizeUser(user) });
});

usersRouter.delete('/me', (req, res) => {
    const userId = req.user!.sub;

    // Revoke all tokens, then cascade delete via transaction
    const tx = db.transaction(() => {
        revokeAllRefreshTokensForUser(userId);
        db.prepare(`DELETE FROM achievements WHERE user_id = ?`).run(userId);
        db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(userId);
        db.prepare(`DELETE FROM refresh_tokens WHERE user_id = ?`).run(userId);
        db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
    });
    tx();

    return res.json({ ok: true });
});
