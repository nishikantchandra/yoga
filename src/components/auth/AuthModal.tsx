/**
 * Login + Register modal. Tabbed UI, used app-wide for sign-in flows.
 * Closes itself after successful auth.
 */
import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../store/AuthContext';
import { ApiError } from '../../services/api';

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    initialTab?: 'login' | 'register';
}

export function AuthModal({ open, onClose, initialTab = 'login' }: AuthModalProps) {
    const { login, register, apiEnabled } = useAuth();
    const [tab, setTab] = useState<'login' | 'register'>(initialTab);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reset = () => {
        setEmail('');
        setPassword('');
        setName('');
        setError(null);
        setSubmitting(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            if (tab === 'login') {
                await login(email.trim(), password);
            } else {
                await register(email.trim(), password, name.trim() || email.split('@')[0]);
            }
            handleClose();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.body.error || err.message);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Something went wrong. Please try again.');
            }
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: 'spring', damping: 22 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-400 p-6 text-white relative overflow-hidden">
                            <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        {tab === 'login' ? '👋 Welcome back' : '🌱 Create account'}
                                    </h2>
                                    <p className="text-pink-100 text-sm mt-1">
                                        {tab === 'login'
                                            ? 'Sign in to sync your progress'
                                            : 'Sign up to track your journey across devices'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    aria-label="Close"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => { setTab('login'); setError(null); }}
                                className={`flex-1 py-3 font-bold text-sm transition-colors ${tab === 'login'
                                        ? 'text-pink-600 border-b-2 border-pink-500'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                Sign in
                            </button>
                            <button
                                type="button"
                                onClick={() => { setTab('register'); setError(null); }}
                                className={`flex-1 py-3 font-bold text-sm transition-colors ${tab === 'register'
                                        ? 'text-pink-600 border-b-2 border-pink-500'
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                Create account
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="p-6 space-y-4">
                            {!apiEnabled && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm rounded-xl p-3">
                                    ⚠️ Cloud sync is not configured. The app still works offline using localStorage.
                                    Set <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">VITE_API_URL</code> to enable accounts.
                                </div>
                            )}

                            {tab === 'register' && (
                                <Field
                                    label="Your name"
                                    type="text"
                                    value={name}
                                    onChange={setName}
                                    placeholder="Anika"
                                    autoComplete="name"
                                />
                            )}

                            <Field
                                label="Email"
                                type="email"
                                value={email}
                                onChange={setEmail}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />

                            <Field
                                label="Password"
                                type="password"
                                value={password}
                                onChange={setPassword}
                                placeholder={tab === 'register' ? 'At least 8 characters' : 'Your password'}
                                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                                required
                                minLength={tab === 'register' ? 8 : undefined}
                            />

                            {error && (
                                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm rounded-xl p-3">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting || !apiEnabled}
                                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-pink-300/30 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {submitting ? '...' : tab === 'login' ? 'Sign in' : 'Create account'}
                            </button>

                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                {tab === 'login' ? (
                                    <>
                                        New here?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setTab('register')}
                                            className="text-pink-600 dark:text-pink-400 font-bold hover:underline"
                                        >
                                            Create an account
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setTab('login')}
                                            className="text-pink-600 dark:text-pink-400 font-bold hover:underline"
                                        >
                                            Sign in
                                        </button>
                                    </>
                                )}
                            </p>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function Field(props: {
    label: string;
    type: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    autoComplete?: string;
    required?: boolean;
    minLength?: number;
}) {
    return (
        <label className="block">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">
                {props.label}
            </span>
            <input
                type={props.type}
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                placeholder={props.placeholder}
                autoComplete={props.autoComplete}
                required={props.required}
                minLength={props.minLength}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-pink-400 dark:focus:border-pink-500 focus:ring-0 focus:outline-none rounded-xl text-gray-800 dark:text-gray-100 transition-colors"
            />
        </label>
    );
}
