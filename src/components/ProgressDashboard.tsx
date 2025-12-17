import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUnlockedAchievements, ACHIEVEMENTS } from './AchievementToast';

interface ProgressDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SessionHistory {
    date: string;
    pose: string;
    avgScore: number;
    duration: number;
    bestScore: number;
}

interface StatsData {
    totalSessions: number;
    totalPracticeTime: number;
    averageScore: number;
    currentStreak: number;
    longestStreak: number;
    posesCompleted: string[];
    sessionHistory: SessionHistory[];
    weeklyData: { day: string; sessions: number; avgScore: number }[];
}

const getStatsData = (): StatsData => {
    const stored = localStorage.getItem('yogaai-stats');
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        totalSessions: 0,
        totalPracticeTime: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        posesCompleted: [],
        sessionHistory: [],
        weeklyData: generateWeeklyData([]),
    };
};

const generateWeeklyData = (history: SessionHistory[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const daySessions = history.filter(s => s.date.startsWith(dateStr));
        const avgScore = daySessions.length > 0
            ? Math.round(daySessions.reduce((sum, s) => sum + s.avgScore, 0) / daySessions.length)
            : 0;

        weekData.push({
            day: days[date.getDay()],
            sessions: daySessions.length,
            avgScore,
        });
    }

    return weekData;
};

export function saveSessionToStats(session: {
    pose: string;
    avgScore: number;
    duration: number;
    bestScore: number;
}) {
    const stats = getStatsData();

    const newSession: SessionHistory = {
        date: new Date().toISOString(),
        ...session,
    };

    stats.sessionHistory.push(newSession);
    stats.totalSessions += 1;
    stats.totalPracticeTime += session.duration;

    // Recalculate average
    const allScores = stats.sessionHistory.map(s => s.avgScore);
    stats.averageScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

    // Track unique poses
    if (!stats.posesCompleted.includes(session.pose)) {
        stats.posesCompleted.push(session.pose);
    }

    // Update streak data from streak storage
    const streakData = JSON.parse(localStorage.getItem('yogaai-streak') || '{}');
    stats.currentStreak = streakData.currentStreak || 0;
    stats.longestStreak = streakData.longestStreak || 0;

    // Regenerate weekly data
    stats.weeklyData = generateWeeklyData(stats.sessionHistory);

    localStorage.setItem('yogaai-stats', JSON.stringify(stats));
}

export function ProgressDashboard({ isOpen, onClose }: ProgressDashboardProps) {
    const [stats, setStats] = useState<StatsData>(getStatsData());
    const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'history'>('overview');
    const unlockedAchievements = getUnlockedAchievements();

    useEffect(() => {
        if (isOpen) {
            setStats(getStatsData());
        }
    }, [isOpen]);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    📊 Your Progress
                                </h2>
                                <p className="text-pink-100 text-sm mt-1">Track your yoga journey</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mt-4">
                            {(['overview', 'achievements', 'history'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === tab
                                            ? 'bg-white text-purple-600'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard
                                        icon="🧘"
                                        label="Total Sessions"
                                        value={stats.totalSessions.toString()}
                                        color="pink"
                                    />
                                    <StatCard
                                        icon="⏱️"
                                        label="Practice Time"
                                        value={formatTime(stats.totalPracticeTime)}
                                        color="blue"
                                    />
                                    <StatCard
                                        icon="🎯"
                                        label="Avg Score"
                                        value={`${stats.averageScore}%`}
                                        color="emerald"
                                    />
                                    <StatCard
                                        icon="🔥"
                                        label="Best Streak"
                                        value={`${stats.longestStreak} days`}
                                        color="amber"
                                    />
                                </div>

                                {/* Weekly Activity */}
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                        📅 This Week
                                    </h3>
                                    <div className="flex justify-between items-end h-32 gap-2">
                                        {stats.weeklyData.map((day, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden h-20 flex items-end">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${Math.max(day.sessions * 25, 0)}%` }}
                                                        className="w-full bg-gradient-to-t from-pink-500 to-purple-500 rounded-lg"
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{day.day}</span>
                                                {day.sessions > 0 && (
                                                    <span className="text-xs font-bold text-pink-600 dark:text-pink-400">
                                                        {day.sessions}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Poses Practiced */}
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                        🎯 Poses Practiced
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {stats.posesCompleted.length > 0 ? (
                                            stats.posesCompleted.map((pose) => (
                                                <span
                                                    key={pose}
                                                    className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-sm font-medium"
                                                >
                                                    {pose}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-400">No poses practiced yet. Start a session!</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'achievements' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {ACHIEVEMENTS.map((achievement) => {
                                    const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
                                    return (
                                        <motion.div
                                            key={achievement.id}
                                            whileHover={{ scale: 1.02 }}
                                            className={`p-4 rounded-2xl border-2 transition-all ${isUnlocked
                                                    ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-700'
                                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                                                }`}
                                        >
                                            <div className="text-center">
                                                <div className={`text-4xl mb-2 ${isUnlocked ? '' : 'grayscale'}`}>
                                                    {achievement.icon}
                                                </div>
                                                <h4 className={`font-bold ${isUnlocked ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>
                                                    {achievement.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {achievement.description}
                                                </p>
                                                {isUnlocked && (
                                                    <span className="inline-block mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                                                        ✓ Unlocked
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-3">
                                {stats.sessionHistory.length > 0 ? (
                                    [...stats.sessionHistory].reverse().slice(0, 20).map((session, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                    {session.pose.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-800 dark:text-white">{session.pose}</h4>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(session.date).toLocaleDateString()} • {formatTime(session.duration)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-pink-600 dark:text-pink-400">
                                                    {session.avgScore}%
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Best: {session.bestScore}%
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <p className="text-4xl mb-4">📝</p>
                                        <p>No session history yet.</p>
                                        <p className="text-sm">Complete your first session to see it here!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
    const colorClasses: Record<string, string> = {
        pink: 'from-pink-400 to-rose-500',
        blue: 'from-blue-400 to-cyan-500',
        emerald: 'from-emerald-400 to-green-500',
        amber: 'from-amber-400 to-orange-500',
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl shadow-lg`}>
                {icon}
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
        </div>
    );
}
