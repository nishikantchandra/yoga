/**
 * Express middleware that requires a valid JWT access token.
 * Attaches the decoded payload to req.user.
 */
import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type AccessTokenPayload } from '../auth/jwt.js';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: AccessTokenPayload;
        }
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = auth.slice('Bearer '.length).trim();
    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid token';
        return res.status(401).json({ error: 'Invalid or expired access token', detail: message });
    }
}

/**
 * Soft-auth: attaches user if a valid token is present, but does not reject.
 * Useful for endpoints that have both authed and anonymous behaviour.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
        const token = auth.slice('Bearer '.length).trim();
        try {
            req.user = verifyAccessToken(token);
        } catch {
            // ignore - treat as anonymous
        }
    }
    next();
}
