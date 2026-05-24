/**
 * Session service - bridges the existing localStorage code with the optional
 * cloud backend.
 *
 * Behaviour:
 *  - Always writes to localStorage first (so the app works offline / pre-auth)
 *  - If backend configured AND user authed, also POSTs to /api/sessions
 *  - On API error, the data is still safe in localStorage and a queue retries
 *    later (best-effort)
 */
import { apiRequest, getAccessToken, isApiEnabled } from './api';
import type { SessionData } from '../utils/sessionAnalyzer';

const PENDING_KEY = 'yogaai-pending-sessions';

interface PendingSession {
    pose: string;
    startedAt: number;
    endedAt: number;
    avgScore: number;
    maxScore: number;
    minScore: number;
    totalFrames: number;
    perfectFrames: number;
    goodFrames: number;
    captureCount: number;
    metadata?: Record<string, unknown>;
}

function readPending(): PendingSession[] {
    try {
        return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    } catch {
        return [];
    }
}

function writePending(items: PendingSession[]): void {
    localStorage.setItem(PENDING_KEY, JSON.stringify(items));
}

function toPending(s: SessionData): PendingSession {
    return {
        pose: s.pose,
        startedAt: s.startTime,
        endedAt: s.endTime,
        avgScore: s.avgScore,
        maxScore: s.maxScore,
        minScore: s.minScore,
        totalFrames: s.totalFrames,
        perfectFrames: s.perfectFrames,
        goodFrames: s.goodFrames,
        captureCount: s.captures.length,
        // Don't send raw image data to backend (too large) - keep local only
        metadata: { sessionId: s.sessionId, scoreSampleCount: s.scores.length },
    };
}

/** Try to send a session to the backend. On success returns true. */
async function pushOne(payload: PendingSession): Promise<boolean> {
    if (!isApiEnabled() || !getAccessToken()) return false;
    try {
        await apiRequest('/api/sessions', { method: 'POST', body: payload });
        return true;
    } catch {
        return false;
    }
}

/**
 * Save a finished session. Always succeeds locally; cloud sync is best-effort.
 */
export async function saveSession(session: SessionData): Promise<void> {
    const payload = toPending(session);

    // Attempt cloud sync if possible
    const sent = await pushOne(payload);
    if (!sent && isApiEnabled()) {
        // Queue for later retry
        const pending = readPending();
        pending.push(payload);
        writePending(pending);
    }
}

/**
 * Try to flush queued sessions. Call after login or when network recovers.
 */
export async function flushPendingSessions(): Promise<{ sent: number; remaining: number }> {
    const pending = readPending();
    if (pending.length === 0) return { sent: 0, remaining: 0 };
    if (!isApiEnabled() || !getAccessToken()) {
        return { sent: 0, remaining: pending.length };
    }

    const stillFailing: PendingSession[] = [];
    let sent = 0;
    for (const p of pending) {
        const ok = await pushOne(p);
        if (ok) sent += 1;
        else stillFailing.push(p);
    }
    writePending(stillFailing);
    return { sent, remaining: stillFailing.length };
}

export interface CloudSession {
    id: string;
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
    created_at: number;
}

export async function fetchSessions(opts: { limit?: number; pose?: string } = {}): Promise<CloudSession[]> {
    if (!isApiEnabled() || !getAccessToken()) return [];
    const params = new URLSearchParams();
    if (opts.limit) params.set('limit', String(opts.limit));
    if (opts.pose) params.set('pose', opts.pose);
    const qs = params.toString() ? `?${params.toString()}` : '';
    try {
        const res = await apiRequest<{ sessions: CloudSession[] }>(`/api/sessions${qs}`);
        return res.sessions;
    } catch {
        return [];
    }
}
