import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: Date;
}

interface AchievementToastProps {
    achievement: Achievement | null;
    onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (achievement) {
            setIsVisible(true);

            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ec4899', '#8b5cf6', '#f59e0b', '#10b981'],
            });

            // Play sound if available
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(`Achievement unlocked! ${achievement.title}`);
                utterance.volume = 0.5;
                window.speechSynthesis.speak(utterance);
            }

            // Auto-close after 5 seconds
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [achievement, onClose]);

    if (!achievement) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]"
                >
                    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 p-1 rounded-2xl shadow-2xl shadow-orange-500/30">
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 flex items-center gap-4">
                            {/* Icon */}
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-3xl shadow-lg">
                                {achievement.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                        🏆 Achievement Unlocked!
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                                    {achievement.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {achievement.description}
                                </p>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={() => {
                                    setIsVisible(false);
                                    setTimeout(onClose, 300);
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Achievement Definitions
export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_session',
        title: 'First Steps',
        description: 'Complete your first yoga session',
        icon: '🌱',
    },
    {
        id: 'perfect_pose',
        title: 'Perfect Alignment',
        description: 'Achieve a 100% alignment score',
        icon: '⭐',
    },
    {
        id: 'five_sessions',
        title: 'Getting Started',
        description: 'Complete 5 yoga sessions',
        icon: '🎯',
    },
    {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day practice streak',
        icon: '🔥',
    },
    {
        id: 'streak_30',
        title: 'Monthly Master',
        description: 'Maintain a 30-day practice streak',
        icon: '🏆',
    },
    {
        id: 'all_poses',
        title: 'Pose Explorer',
        description: 'Try all available yoga poses',
        icon: '🧭',
    },
    {
        id: 'hold_60s',
        title: 'Steady as a Rock',
        description: 'Hold a pose with 80+ score for 60 seconds',
        icon: '🪨',
    },
    {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Practice before 7 AM',
        icon: '🌅',
    },
    {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Practice after 10 PM',
        icon: '🌙',
    },
    {
        id: 'hundred_sessions',
        title: 'Century Club',
        description: 'Complete 100 yoga sessions',
        icon: '💯',
    },
];

// Helper function to check and unlock achievements
export function checkAchievements(stats: {
    totalSessions: number;
    currentStreak: number;
    maxScore: number;
    posesAttempted: string[];
    holdDuration?: number;
}): Achievement | null {
    const unlockedIds = JSON.parse(localStorage.getItem('yogaai-achievements') || '[]');

    const checks: { id: string; condition: boolean }[] = [
        { id: 'first_session', condition: stats.totalSessions >= 1 },
        { id: 'perfect_pose', condition: stats.maxScore >= 100 },
        { id: 'five_sessions', condition: stats.totalSessions >= 5 },
        { id: 'streak_7', condition: stats.currentStreak >= 7 },
        { id: 'streak_30', condition: stats.currentStreak >= 30 },
        { id: 'all_poses', condition: stats.posesAttempted.length >= 5 },
        { id: 'hold_60s', condition: (stats.holdDuration || 0) >= 60 },
        { id: 'hundred_sessions', condition: stats.totalSessions >= 100 },
        { id: 'early_bird', condition: new Date().getHours() < 7 },
        { id: 'night_owl', condition: new Date().getHours() >= 22 },
    ];

    for (const check of checks) {
        if (check.condition && !unlockedIds.includes(check.id)) {
            // Unlock the achievement
            unlockedIds.push(check.id);
            localStorage.setItem('yogaai-achievements', JSON.stringify(unlockedIds));

            const achievement = ACHIEVEMENTS.find(a => a.id === check.id);
            if (achievement) {
                return { ...achievement, unlockedAt: new Date() };
            }
        }
    }

    return null;
}

// Get all unlocked achievements
export function getUnlockedAchievements(): Achievement[] {
    const unlockedIds = JSON.parse(localStorage.getItem('yogaai-achievements') || '[]');
    return ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id)).map(a => ({
        ...a,
        unlockedAt: new Date(),
    }));
}
