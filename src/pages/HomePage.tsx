import { motion } from 'framer-motion';
import { useHashRoute } from '../hooks/useHashRoute';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { UserMenu } from '../components/auth/UserMenu';

interface ModeCard {
    id: 'practice' | 'studio' | 'dashboard';
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    gradient: string;
    features: string[];
    badge?: string;
    disabled?: boolean;
}

const MODES: ModeCard[] = [
    {
        id: 'studio',
        title: 'Studio Mode',
        subtitle: 'For yoga studios & instructors',
        description: 'Big-screen experience for guided classes. Run pre-built sequences on a TV or projector while students follow along.',
        icon: '🏟️',
        gradient: 'from-indigo-600 via-purple-600 to-pink-600',
        features: [
            'Full-screen 4K-ready layout',
            'Pre-built class sequences',
            'Auto-advance pose timer',
            'QR code class join',
            'Big visible score (200px)',
            'Instructor remote-friendly',
        ],
        badge: 'NEW',
    },
    {
        id: 'practice',
        title: 'Personal Practice',
        subtitle: 'For individual practitioners',
        description: 'Train at home with real-time AI pose correction, voice guidance, and detailed session reports.',
        icon: '🧘',
        gradient: 'from-pink-500 via-rose-500 to-red-400',
        features: [
            '15+ yoga poses',
            'Real-time skeleton overlay',
            'Voice corrections',
            'Auto-capture best moments',
            'Progress tracking & streaks',
            'PDF session reports',
        ],
    },
    {
        id: 'dashboard',
        title: 'Instructor Dashboard',
        subtitle: 'For studio owners & teachers',
        description: 'Manage classes, students, and analytics. Track which poses your students struggle with most.',
        icon: '🎛️',
        gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
        features: [
            'Class scheduling',
            'Student roster',
            'Pose analytics',
            'Live class monitoring',
            'Custom pose library',
            'Subscription management',
        ],
        badge: 'COMING SOON',
        disabled: true,
    },
];

export function HomePage() {
    const { navigate } = useHashRoute();

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-200/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto p-6">
                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 via-rose-500 to-red-400 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-pink-300 dark:shadow-pink-900">
                            Y
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-red-400">
                                YogaAI
                            </h1>
                            <p className="text-xs text-pink-600 dark:text-pink-400">AI-Powered Yoga Platform</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <UserMenu />
                        <DarkModeToggle />
                    </div>
                </header>

                {/* Hero */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-300/50 dark:border-pink-700/50 text-pink-600 dark:text-pink-400 text-sm font-bold px-4 py-1.5 rounded-full mb-6">
                        🧘 AI-Powered Pose Correction · 100% Private
                    </span>
                    <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-red-400">
                            Perfect Your Practice
                        </span>
                        <br />
                        <span className="text-gray-800 dark:text-gray-100">With Real-Time AI</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                        Pick how you want to use YogaAI today. From personal practice to studio classes, we've got you covered.
                    </p>
                </motion.section>

                {/* Mode Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {MODES.map((mode, index) => (
                        <motion.button
                            key={mode.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                            whileHover={mode.disabled ? {} : { scale: 1.03, y: -5 }}
                            whileTap={mode.disabled ? {} : { scale: 0.98 }}
                            onClick={() => !mode.disabled && navigate(mode.id)}
                            disabled={mode.disabled}
                            className={`group relative text-left bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-xl transition-all ${mode.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-transparent cursor-pointer'
                                }`}
                        >
                            {/* Badge */}
                            {mode.badge && (
                                <div className="absolute top-4 right-4 z-10">
                                    <span className={`text-xs font-black px-3 py-1 rounded-full ${mode.badge === 'NEW'
                                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}>
                                        {mode.badge}
                                    </span>
                                </div>
                            )}

                            {/* Header band */}
                            <div className={`bg-gradient-to-br ${mode.gradient} p-8 relative overflow-hidden`}>
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="relative z-[1]">
                                    <div className="text-7xl mb-4">{mode.icon}</div>
                                    <h3 className="text-2xl font-extrabold text-white mb-1">{mode.title}</h3>
                                    <p className="text-white/80 text-sm">{mode.subtitle}</p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <p className="text-gray-600 dark:text-gray-300 mb-5 text-sm leading-relaxed">
                                    {mode.description}
                                </p>
                                <ul className="space-y-2">
                                    {mode.features.map((feat) => (
                                        <li key={feat} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                {!mode.disabled && (
                                    <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <span className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${mode.gradient}`}>
                                            Open {mode.title}
                                        </span>
                                        <span className={`w-9 h-9 rounded-xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center text-white shadow-lg group-hover:translate-x-1 transition-transform`}>
                                            →
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Stats Strip */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-pink-200 dark:border-gray-700"
                >
                    {[
                        { label: 'Yoga Poses', value: '15+', icon: '🧘' },
                        { label: 'Class Sequences', value: '6', icon: '📋' },
                        { label: 'Joint Tracking', value: '17 pts', icon: '🦴' },
                        { label: 'Privacy', value: '100%', icon: '🔒' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-3xl mb-2">{stat.icon}</div>
                            <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                                {stat.value}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </motion.section>

                {/* Footer */}
                <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-8 border-t border-pink-200/50 dark:border-gray-700/50">
                    <p>Built with React, TensorFlow.js & MoveNet Thunder · All processing happens in your browser</p>
                </footer>
            </div>
        </div>
    );
}
