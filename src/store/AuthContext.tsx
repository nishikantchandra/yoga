/**
 * Auth context — single source of truth for the current user.
 * Loads on mount (silent token refresh), exposes login/register/logout helpers.
 *
 * The app works fully offline when no API is configured; in that case
 * `user` is always null and `isApiEnabled()` returns false.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    fetchCurrentUser,
    login as loginCall,
    logout as logoutCall,
    register as registerCall,
    type AuthUser,
} from '../services/auth.service';
import { isApiEnabled } from '../services/api';
import { flushPendingSessions } from '../services/session.service';

interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    apiEnabled: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const apiEnabled = isApiEnabled();

    const refresh = useCallback(async () => {
        if (!apiEnabled) {
            setLoading(false);
            return;
        }
        const u = await fetchCurrentUser();
        setUser(u);
        setLoading(false);
        if (u) {
            // Best-effort flush of any sessions queued while offline
            void flushPendingSessions();
        }
    }, [apiEnabled]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const login = useCallback(async (email: string, password: string) => {
        const u = await loginCall(email, password);
        setUser(u);
        void flushPendingSessions();
    }, []);

    const register = useCallback(async (email: string, password: string, name: string) => {
        const u = await registerCall(email, password, name);
        setUser(u);
    }, []);

    const logout = useCallback(async () => {
        await logoutCall();
        setUser(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({ user, loading, apiEnabled, login, register, logout, refresh }),
        [user, loading, apiEnabled, login, register, logout, refresh]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
