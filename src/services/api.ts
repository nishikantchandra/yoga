/**
 * Lightweight fetch wrapper for the YogaAI backend.
 *
 * Responsibilities:
 *  - prepend API base URL
 *  - attach JWT access token (Bearer) when available
 *  - on 401, attempt one silent refresh-token rotation and retry
 *  - return parsed JSON or throw a typed ApiError
 *
 * The base URL is configured via VITE_API_URL at build time.
 * If unset (default), the app runs in OFFLINE mode and the service layer
 * falls back to localStorage. This keeps the app working with zero backend
 * setup — opt-in cloud sync.
 */

export interface ApiErrorShape {
    error: string;
    detail?: string;
    issues?: unknown;
}

export class ApiError extends Error {
    status: number;
    body: ApiErrorShape;
    constructor(status: number, body: ApiErrorShape) {
        super(body.error || `Request failed (${status})`);
        this.status = status;
        this.body = body;
    }
}

// ============== Configuration ==============

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/** True when a backend is configured. UI uses this to gate cloud-only features. */
export const isApiEnabled = (): boolean => API_URL.length > 0;

// ============== Token storage ==============

const ACCESS_KEY = 'yogaai-access-token';
const REFRESH_KEY = 'yogaai-refresh-token';

export function getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
}
export function setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
}
export function clearTokens(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
}

// ============== Refresh-token coordination ==============
// If many requests fire and a 401 hits, only one refresh runs at a time.

let refreshInflight: Promise<string | null> | null = null;

async function tryRefreshAccessToken(): Promise<string | null> {
    if (refreshInflight) return refreshInflight;
    const refreshToken = getRefreshToken();
    if (!refreshToken || !API_URL) return null;

    refreshInflight = (async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            if (!res.ok) return null;
            const data = (await res.json()) as { accessToken: string; refreshToken: string };
            setTokens(data.accessToken, data.refreshToken);
            return data.accessToken;
        } catch {
            return null;
        } finally {
            refreshInflight = null;
        }
    })();

    return refreshInflight;
}

// ============== Core request helper ==============

interface ApiRequestOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    body?: unknown;
    auth?: boolean;     // attach Bearer token (default true)
    signal?: AbortSignal;
}

export async function apiRequest<T>(path: string, opts: ApiRequestOptions = {}): Promise<T> {
    if (!API_URL) {
        throw new ApiError(0, { error: 'API not configured (VITE_API_URL is unset)' });
    }

    const { method = 'GET', body, auth = true, signal } = opts;
    const url = `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;

    const buildInit = (token: string | null): RequestInit => {
        const headers: Record<string, string> = {};
        if (body !== undefined) headers['Content-Type'] = 'application/json';
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal,
        };
    };

    let res = await fetch(url, buildInit(auth ? getAccessToken() : null));

    // One-shot refresh + retry on 401
    if (res.status === 401 && auth && getRefreshToken()) {
        const fresh = await tryRefreshAccessToken();
        if (fresh) {
            res = await fetch(url, buildInit(fresh));
        }
    }

    if (!res.ok) {
        let errBody: ApiErrorShape = { error: `HTTP ${res.status}` };
        try {
            errBody = (await res.json()) as ApiErrorShape;
        } catch {
            // not JSON
        }
        throw new ApiError(res.status, errBody);
    }

    if (res.status === 204) return undefined as unknown as T;

    return (await res.json()) as T;
}
