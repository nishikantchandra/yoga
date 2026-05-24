/**
 * Centralised environment configuration. Reads from process.env.
 * Falls back to development-safe defaults when running locally.
 */
import 'dotenv/config';

function required(name: string, fallback?: string): string {
    const value = process.env[name] ?? fallback;
    if (!value) {
        throw new Error(`Missing required env var: ${name}`);
    }
    return value;
}

export const config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: (process.env.NODE_ENV || 'development') === 'development',

    jwt: {
        secret: required('JWT_SECRET', 'dev-only-secret-change-in-production'),
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },

    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),

    db: {
        path: process.env.DATABASE_PATH || './data/yoga.db',
    },
};

if (!config.isDev && config.jwt.secret === 'dev-only-secret-change-in-production') {
    throw new Error(
        'Refusing to start in non-dev environment with default JWT secret. ' +
        'Set JWT_SECRET to a strong random value (e.g. `openssl rand -base64 32`).'
    );
}
