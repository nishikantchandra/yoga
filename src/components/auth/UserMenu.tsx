/**
 * Header pill that either invites the user to sign in or shows a small
 * dropdown with their account info + sign-out.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../store/AuthContext';
import { AuthModal } from './AuthModal';

const PLAN_BADGE: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    personal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    studio: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    enterprise: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export function UserMenu() {
    const { user, loading, apiEnabled, logout } = useAuth();
    const [authOpen, setAuthOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

    if (loading) {
        return (
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        );
    }

    if (!user) {
        return (
            <>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setAuthTab('login'); setAuthOpen(true); }}
                        className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 px-3 py-2 transition-colors"
                    >
                        Sign in
                    </button>
                    <button
                        onClick={() => { setAuthTab('register'); setAuthOpen(true); }}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-sm font-bold rounded-xl shadow-md shadow-pink-300/30 transition-all hover:scale-105"
                        title={apiEnabled ? 'Create an account' : 'Cloud sync disabled - app still works offline'}
                    >
                        Get started
                    </button>
                </div>
                <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialTab={authTab} />
            </>
        );
    }

    const initials = user.name
        ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : user.email[0].toUpperCase();

    return (
        <div className="relative">
            <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-pink-50 dark:hover:bg-gray-700 border border-pink-200 dark:border-gray-700 transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 via-rose-500 to-red-400 flex items-center justify-center text-white font-bold text-sm">
                    {initials}
                </div>
                <span className="hidden sm:block text-sm font-bold text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
                    {user.name}
                </span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <AnimatePresence>
                {menuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50"
                        >
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 via-rose-500 to-red-400 flex items-center justify-center text-white font-bold">
                                        {initials}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{user.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${PLAN_BADGE[user.plan] || PLAN_BADGE.free}`}>
                                        {user.plan} plan
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        ☁️ Cloud sync on
                                    </span>
                                </div>
                            </div>

                            <div className="py-1">
                                <MenuItem icon="📊" label="Progress" onClick={() => {
                                    setMenuOpen(false);
                                    window.location.hash = '/practice';
                                }} />
                                <MenuItem icon="⚙️" label="Settings" onClick={() => setMenuOpen(false)} disabled />
                                <MenuItem
                                    icon="🚪"
                                    label="Sign out"
                                    onClick={async () => {
                                        setMenuOpen(false);
                                        await logout();
                                    }}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function MenuItem({
    icon,
    label,
    onClick,
    disabled,
}: {
    icon: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-left transition-colors ${disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700'
                }`}
        >
            <span className="text-base">{icon}</span>
            <span className="flex-1">{label}</span>
            {disabled && (
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Soon</span>
            )}
        </button>
    );
}
