import { useState, useEffect, useCallback } from 'react';

/**
 * Lightweight hash-based router.
 * URLs look like: #/practice, #/studio, #/dashboard
 * Works perfectly with GitHub Pages (no server config needed).
 */
export type Route = 'home' | 'practice' | 'studio' | 'dashboard';

const parseHash = (): Route => {
    const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    if (hash === 'practice') return 'practice';
    if (hash === 'studio') return 'studio';
    if (hash === 'dashboard') return 'dashboard';
    return 'home';
};

export function useHashRoute() {
    const [route, setRoute] = useState<Route>(parseHash());

    useEffect(() => {
        const handler = () => setRoute(parseHash());
        window.addEventListener('hashchange', handler);
        return () => window.removeEventListener('hashchange', handler);
    }, []);

    const navigate = useCallback((to: Route) => {
        window.location.hash = to === 'home' ? '/' : `/${to}`;
    }, []);

    return { route, navigate };
}
