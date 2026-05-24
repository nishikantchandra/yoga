/**
 * Auth service - register / login / logout / current user.
 * Returns null when API is not configured (offline mode).
 */
import { apiRequest, clearTokens, isApiEnabled, setTokens } from './api';

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    role: 'student' | 'instructor' | 'studio_owner' | 'admin';
    plan: 'free' | 'personal' | 'studio' | 'enterprise';
    createdAt: number;
}

interface AuthResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}

export async function register(email: string, password: string, name: string): Promise<AuthUser> {
    const res = await apiRequest<AuthResponse>('/api/auth/register', {
        method: 'POST',
        auth: false,
        body: { email, password, name },
    });
    setTokens(res.accessToken, res.refreshToken);
    return res.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
    const res = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: { email, password },
    });
    setTokens(res.accessToken, res.refreshToken);
    return res.user;
}

export async function logout(): Promise<void> {
    if (!isApiEnabled()) {
        clearTokens();
        return;
    }
    const refreshToken = localStorage.getItem('yogaai-refresh-token');
    try {
        await apiRequest<{ ok: true }>('/api/auth/logout', {
            method: 'POST',
            auth: false,
            body: { refreshToken },
        });
    } catch {
        // best-effort - clear locally regardless
    } finally {
        clearTokens();
    }
}

/** Returns the current user, or null if not authed or API not configured. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
    if (!isApiEnabled()) return null;
    const access = localStorage.getItem('yogaai-access-token');
    const refresh = localStorage.getItem('yogaai-refresh-token');
    if (!access && !refresh) return null;
    try {
        const res = await apiRequest<{ user: AuthUser }>('/api/users/me');
        return res.user;
    } catch {
        return null;
    }
}
