import { motion } from 'framer-motion';
import { useHashRoute } from '../hooks/useHashRoute';

export default function DashboardPage() {
    const { navigate } = useHashRoute();

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-emerald-200 dark:border-gray-700 rounded-3xl p-10 text-center shadow-2xl"
            >
                <div className="text-7xl mb-4">🎛️</div>
                <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 mb-3">
                    Instructor Dashboard
                </h1>
                <p className="text-amber-600 dark:text-amber-400 font-bold text-sm uppercase tracking-widest mb-6">
                    🚧 Coming Soon
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    Class scheduling, student rosters, pose analytics, custom pose libraries, and live class monitoring — all in one place. Available with the backend service.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                    {[
                        { icon: '📅', label: 'Class Scheduling' },
                        { icon: '👥', label: 'Student Roster' },
                        { icon: '📊', label: 'Pose Analytics' },
                        { icon: '🎯', label: 'Custom Poses' },
                        { icon: '📡', label: 'Live Monitoring' },
                        { icon: '💳', label: 'Subscriptions' },
                    ].map((f) => (
                        <div key={f.label} className="flex items-center gap-3 bg-emerald-50 dark:bg-gray-700/50 p-3 rounded-xl">
                            <span className="text-2xl">{f.icon}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{f.label}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate('home')}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105"
                >
                    ← Back to Home
                </button>
            </motion.div>
        </div>
    );
}
