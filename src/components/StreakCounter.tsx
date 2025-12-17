import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StreakCounterProps {
    className?: string;
}

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastPracticeDate: string | null;
    totalSessions: number;
}

const getStreakData = (): StreakData => {
    const stored = localStorage.getItem('yogaai-streak');
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: null,
        totalSessions: 0,
    };
};

const saveStreakData = (data: StreakData) => {
    localStorage.setItem('yogaai-streak', JSON.stringify(data));
};

const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

const isYesterday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
};

export function updateStreak(): StreakData {
    const data = getStreakData();
    const today = new Date().toISOString();

    if (data.lastPracticeDate && isToday(data.lastPracticeDate)) {
        // Already practiced today, just increment session count
        data.totalSessions += 1;
    } else if (data.lastPracticeDate && isYesterday(data.lastPracticeDate)) {
        // Practiced yesterday, extend streak
        data.currentStreak += 1;
        data.totalSessions += 1;
        if (data.currentStreak > data.longestStreak) {
            data.longestStreak = data.currentStreak;
        }
    } else if (!data.lastPracticeDate) {
        // First time practicing
        data.currentStreak = 1;
        data.longestStreak = 1;
        data.totalSessions = 1;
    } else {
        // Streak broken
        data.currentStreak = 1;
        data.totalSessions += 1;
    }

    data.lastPracticeDate = today;
    saveStreakData(data);
    return data;
}

export function StreakCounter({ className = '' }: StreakCounterProps) {
    const [streakData, setStreakData] = useState<StreakData>(getStreakData());
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const data = getStreakData();

        // Check if streak is still valid (practiced today or yesterday)
        if (data.lastPracticeDate) {
            if (!isToday(data.lastPracticeDate) && !isYesterday(data.lastPracticeDate)) {
                // Streak is broken
                data.currentStreak = 0;
                saveStreakData(data);
            }
        }

        setStreakData(data);
    }, []);

    const isActive = streakData.currentStreak > 0;

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setShowDetails(!showDetails)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-600 dark:text-amber-400'
                        : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500'
                    }`}
            >
                <span className={`text-xl ${isActive ? 'animate-streak-fire' : ''}`}>
                    {isActive ? '🔥' : '❄️'}
                </span>
                <span className="font-bold">{streakData.currentStreak}</span>
                <span className="text-sm font-medium hidden sm:inline">
                    {streakData.currentStreak === 1 ? 'day' : 'days'}
                </span>
            </button>

            {/* Details Popup */}
            {showDetails && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-amber-200 dark:border-gray-700 p-4 z-50"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-800 dark:text-white">Your Streak</h3>
                        <button
                            onClick={() => setShowDetails(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🔥</span>
                                <span className="text-gray-600 dark:text-gray-300">Current</span>
                            </div>
                            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {streakData.currentStreak}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🏆</span>
                                <span className="text-gray-600 dark:text-gray-300">Best</span>
                            </div>
                            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {streakData.longestStreak}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">📊</span>
                                <span className="text-gray-600 dark:text-gray-300">Sessions</span>
                            </div>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {streakData.totalSessions}
                            </span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-4 text-center">
                        Practice daily to keep your streak going!
                    </p>
                </motion.div>
            )}
        </div>
    );
}
