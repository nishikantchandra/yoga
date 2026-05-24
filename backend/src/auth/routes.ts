/**
 * Authentication endpoints:
 *   POST /api/auth/register   create account
 *   POST /api/auth/login      issue access + refresh tokens
 *   POST /api/auth/refresh    exchange refresh for new access token (rotates refresh)
 *   POST /api/auth/logout     revoke refresh token
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { db, sanitizeUser, type UserRow } from '../db.js';
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
} from './jwt.js';

export const authRouter = Router();

const registerSchema = z.object({
    email: z.string().email().max(255).toLowerCase(),
    password: z.string().min(8).max(128),
    name: z.string().min(1).max(80),
});

const loginSchema = z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1),
});

const refreshSchema = z.object({
    refreshToken: z.string().min(1),
});

// ============== REGISTER ==============
authRouter.post('/register', async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', issues: parsed.error.issues });
    }
    const { email, password, name } = parsed.data;

    const existing = db
        .prepare<[string], UserRow>(`SELECT * FROM users WHERE email = ?`)
        .get(email);
    if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const id = randomUUID();
    const now = Date.now();

    db.prepare(
        `INSERT INTO users (id, email, password_hash, name, role, plan, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'student', 'free', ?, ?)`
    ).run(id, email, password_hash, name, now, now);

    const user = db
        .prepare<[string], UserRow>(`SELECT * FROM users WHERE id = ?`)
        .get(id)!;

    const accessToken = signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
    });
    const { token: refreshToken } = signRefreshToken(user.id);

    return res.status(201).json({
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
    });
});

// ============== LOGIN ==============
authRouter.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid input', issues: parsed.error.issues });
    }
    const { email, password } = parsed.data;

    const user = db
        .prepare<[string], UserRow>(`SELECT * FROM users WHERE email = ?`)
        .get(email);
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        plan: user.plan,
    });
    const { token: refreshToken } = signRefreshToken(user.id);

    return res.json({
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
    });
});

// ============== REFRESH ==============
authRouter.post('/refresh', (req, res) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Missing refreshToken' });
    }
    try {
        const payload = verifyRefreshToken(parsed.data.refreshToken);
        const user = db
            .prepare<[string], UserRow>(`SELECT * FROM users WHERE id = ?`)
            .get(payload.sub);
        if (!user) {
            return res.status(401).json({ error: 'User no longer exists' });
        }

        // Rotate: revoke old refresh, issue a new one + new access
        revokeRefreshToken(payload.jti);
        const accessToken = signAccessToken({
            sub: user.id,
            email: user.email,
            role: user.role,
            plan: user.plan,
        });
        const { token: refreshToken } = signRefreshToken(user.id);

        return res.json({ accessToken, refreshToken });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid refresh token';
        return res.status(401).json({ error: 'Invalid or expired refresh token', detail: message });
    }
});

// ============== LOGOUT ==============
authRouter.post('/logout', (req, res) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (parsed.success) {
        try {
            const payload = verifyRefreshToken(parsed.data.refreshToken);
            revokeRefreshToken(payload.jti);
        } catch {
            // already invalid - that's fine
        }
    }
    return res.json({ ok: true });
});
