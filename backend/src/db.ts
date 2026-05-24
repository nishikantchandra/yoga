/**
 * SQLite database setup using better-sqlite3 (synchronous, fast, zero-config).
 *
 * Schema:
 *  - users               account credentials + profile
 *  - sessions            individual yoga sessions saved by users
 *  - achievements        unlocked achievements per user
 *  - refresh_tokens      revocable refresh tokens (JWT rotation)
 *
 * To upgrade to PostgreSQL later, swap better-sqlite3 with pg/Drizzle while
 * keeping the same query shapes. The schema is portable.
 */
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from './config.js';

// Ensure the data directory exists
const dbDir = dirname(config.db.path);
if (dbDir && !existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(config.db.path);

// Use WAL mode for better concurrent reads
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

// =============== SCHEMA ===============

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT NOT NULL DEFAULT 'student',
    plan TEXT NOT NULL DEFAULT 'free',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    pose TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER NOT NULL,
    duration_sec INTEGER NOT NULL,
    avg_score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    min_score INTEGER NOT NULL,
    total_frames INTEGER NOT NULL DEFAULT 0,
    perfect_frames INTEGER NOT NULL DEFAULT 0,
    good_frames INTEGER NOT NULL DEFAULT 0,
    capture_count INTEGER NOT NULL DEFAULT 0,
    metadata_json TEXT,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_pose ON sessions(pose);

CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at INTEGER NOT NULL,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    issued_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    revoked INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
`);

// =============== TYPES ===============

export interface UserRow {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    avatar: string | null;
    role: 'student' | 'instructor' | 'studio_owner' | 'admin';
    plan: 'free' | 'personal' | 'studio' | 'enterprise';
    created_at: number;
    updated_at: number;
}

export interface SessionRow {
    id: string;
    user_id: string;
    pose: string;
    started_at: number;
    ended_at: number;
    duration_sec: number;
    avg_score: number;
    max_score: number;
    min_score: number;
    total_frames: number;
    perfect_frames: number;
    good_frames: number;
    capture_count: number;
    metadata_json: string | null;
    created_at: number;
}

export interface AchievementRow {
    id: number;
    user_id: string;
    achievement_id: string;
    unlocked_at: number;
}

export interface RefreshTokenRow {
    token_id: string;
    user_id: string;
    issued_at: number;
    expires_at: number;
    revoked: number;
}

// =============== HELPERS ===============

/**
 * Strip sensitive fields before sending a user back to the client.
 */
export function sanitizeUser(row: UserRow) {
    return {
        id: row.id,
        email: row.email,
        name: row.name,
        avatar: row.avatar,
        role: row.role,
        plan: row.plan,
        createdAt: row.created_at,
    };
}
