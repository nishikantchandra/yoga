/**
 * Stats service - cloud aggregates with localStorage fallback.
 * The local fallback reads from yogaai-stats (the existing format).
 */
import { apiRequest, getAccessToken, isApiEnabled } from './api';

export interface StatsSummary {
    totalSessions: number;
    totalPracticeSec: number;
    avgScore: number;
    maxScore: number;
    uniquePoses: number;
    achievementsUnlocked: number;
    lastSession: { ended_at: number; pose: string; avg_score: number } | null;
}

export interface WeeklyDay {
    date: string;
    sessions: number;
    avgScore: number;
}

export interface PoseStats {
    pose: string;
    sessions: number;
    avgScore: number;
    maxScore: number;
    totalSec: number;
}

export async function fetchStatsSummary(): Promise<StatsSummary | null> {
    if (!isApiEnabled() || !getAccessToken()) return null;
    try {
        return await apiRequest<StatsSummary>('/api/stats');
    } catch {
        return null;
    }
}

export async function fetchWeekly(): Promise<WeeklyDay[]> {
    if (!isApiEnabled() || !getAccessToken()) return [];
    try {
        const res = await apiRequest<{ days: WeeklyDay[] }>('/api/stats/weekly');
        return res.days;
    } catch {
        return [];
    }
}

export async function fetchPoseStats(): Promise<PoseStats[]> {
    if (!isApiEnabled() || !getAccessToken()) return [];
    try {
        const res = await apiRequest<{ poses: PoseStats[] }>('/api/stats/poses');
        return res.poses;
    } catch {
        return [];
    }
}

export async function unlockAchievement(achievementId: string): Promise<void> {
    if (!isApiEnabled() || !getAccessToken()) return;
    try {
        await apiRequest('/api/achievements/unlock', {
            method: 'POST',
            body: { achievementId },
        });
    } catch {
        // best-effort
    }
}
