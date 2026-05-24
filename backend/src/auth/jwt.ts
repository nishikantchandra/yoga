/**
 * JWT helpers: sign / verify / refresh token rotation.
 *
 * Two token types:
 *   - access token  (short-lived, ~15min): sent on every API request
 *   - refresh token (long-lived, ~30d): used to obtain new access tokens
 *
 * Refresh tokens are tracked in the DB so they can be revoked (logout / password reset).
 */
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { config } from '../config.js';
import { db, type RefreshTokenRow } from '../db.js';

export interface AccessTokenPayload {
    sub: string;       // user id
    email: string;
    role: string;
    plan: string;
}

export interface RefreshTokenPayload {
    sub: string;
    jti: string;       // refresh token id (used for revocation lookup)
}

export function signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });
}

export function signRefreshToken(userId: string): { token: string; jti: string; expiresAt: number } {
    const jti = randomUUID();
    const expiresIn = config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'];
    const token = jwt.sign({ sub: userId, jti } satisfies RefreshTokenPayload, config.jwt.secret, {
        expiresIn,
    });

    // Decode to get exp timestamp for DB storage
    const decoded = jwt.decode(token) as { exp: number };
    const expiresAt = (decoded.exp || Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30) * 1000;

    db.prepare(
        `INSERT INTO refresh_tokens (token_id, user_id, issued_at, expires_at, revoked) VALUES (?, ?, ?, ?, 0)`
    ).run(jti, userId, Date.now(), expiresAt);

    return { token, jti, expiresAt };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, config.jwt.secret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
    const payload = jwt.verify(token, config.jwt.secret) as RefreshTokenPayload;

    // Verify the token exists in DB and isn't revoked
    const row = db
        .prepare<[string], RefreshTokenRow>(`SELECT * FROM refresh_tokens WHERE token_id = ?`)
        .get(payload.jti);

    if (!row) {
        throw new Error('Refresh token not recognized');
    }
    if (row.revoked) {
        throw new Error('Refresh token has been revoked');
    }
    if (row.expires_at < Date.now()) {
        throw new Error('Refresh token expired');
    }
    return payload;
}

export function revokeRefreshToken(jti: string): void {
    db.prepare(`UPDATE refresh_tokens SET revoked = 1 WHERE token_id = ?`).run(jti);
}

export function revokeAllRefreshTokensForUser(userId: string): void {
    db.prepare(`UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?`).run(userId);
}
