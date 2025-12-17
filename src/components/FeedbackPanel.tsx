import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PoseReference } from '../utils/poseReferences';

interface FeedbackPanelProps {
    pose: PoseReference;
    feedback: { [joint: string]: boolean };
    messages: string[];
    currentScore: number;
    bestScore: number;
    isNewBest?: boolean;
}

const PERFORMANCE_LEVELS = [
    { min: 90, label: 'Excellent', color: 'from-emerald-400 to-green-500', textColor: 'text-emerald-500', icon: '🌟' },
    { min: 70, label: 'Good', color: 'from-blue-400 to-cyan-500', textColor: 'text-blue-500', icon: '💪' },
    { min: 50, label: 'Fair', color: 'from-yellow-400 to-amber-500', textColor: 'text-amber-500', icon: '👍' },
    { min: 0, label: 'Needs Work', color: 'from-rose-400 to-red-500', textColor: 'text-rose-500', icon: '🎯' },
];

const YOGA_TIPS = [
    "Focus on your breath - inhale through the nose, exhale through the mouth",
    "Keep your core engaged for better stability",
    "Don't forget to relax your shoulders away from your ears",
    "Ground through your feet for better balance",
    "Maintain a soft gaze to help with focus",
    "Every practice makes you stronger and more flexible",
    "Listen to your body - never force a pose",
    "Stay present and mindful throughout your practice",
];

// Approximate calorie burn per minute for yoga based on difficulty
const CALORIES_PER_MINUTE: Record<string, number> = {
    beginner: 3,
    intermediate: 4.5,
    advanced: 6,
};

export function FeedbackPanel({
    pose,
    feedback,
    messages,
    currentScore,
    bestScore,
    isNewBest = false
}: FeedbackPanelProps) {
    const [showTip, setShowTip] = useState(false);
    const [currentTip, setCurrentTip] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Rotate tips every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % YOGA_TIPS.length);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    // Track elapsed time for calorie calculation
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const getPerformanceLevel = (score: number) => {
        return PERFORMANCE_LEVELS.find(level => score >= level.min) || PERFORMANCE_LEVELS[3];
    };

    const level = getPerformanceLevel(currentScore);
    const alignedCount = Object.values(feedback).filter(v => v === true).length;
    const totalJoints = Object.keys(feedback).length;

    // Calculate estimated calories
    const caloriesPerMin = CALORIES_PER_MINUTE[pose.difficulty] || 4;
    const estimatedCalories = Math.round((elapsedSeconds / 60) * caloriesPerMin);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-pink-200 dark:border-gray-700 rounded-xl shadow-lg shadow-pink-100 dark:shadow-none">
            {/* Score Section */}
            <div className="p-4 border-b border-pink-100 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-3">
                    {/* Current Score */}
                    <div className={`bg-gradient-to-br ${level.color} p-4 rounded-xl text-white relative overflow-hidden`}>
                        <div className="absolute -top-4 -right-4 text-6xl opacity-20">{level.icon}</div>
                        <p className="text-xs uppercase font-bold opacity-80 mb-1">Current</p>
                        <motion.div
                            key={currentScore}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-4xl font-bold tabular-nums"
                        >
                            {currentScore}%
                        </motion.div>
                        <p className="text-xs mt-1 font-medium">{level.label}</p>
                    </div>

                    {/* Best Score */}
                    <div className={`relative bg-gradient-to-br from-purple-400 to-indigo-500 p-4 rounded-xl text-white overflow-hidden ${isNewBest ? 'celebrate' : ''}`}>
                        <div className="absolute -top-4 -right-4 text-6xl opacity-20">🏆</div>
                        <p className="text-xs uppercase font-bold opacity-80 mb-1">Best</p>
                        <div className="text-4xl font-bold tabular-nums">{bestScore}%</div>
                        {isNewBest && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 text-xs bg-white/30 px-2 py-1 rounded-full font-bold"
                            >
                                NEW! 🎉
                            </motion.span>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between mt-3 px-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>🔥</span>
                        <span>{estimatedCalories} cal</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>⏱️</span>
                        <span>{Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>✓</span>
                        <span>{alignedCount}/{totalJoints} aligned</span>
                    </div>
                </div>
            </div>

            {/* Joint Alignment Status */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider flex items-center gap-2">
                        <span>🎯</span> Alignment Check
                    </h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${alignedCount === totalJoints
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                        {alignedCount}/{totalJoints}
                    </span>
                </div>

                <div className="space-y-2">
                    {Object.keys(pose.joints).map((joint) => {
                        const isAligned = feedback[joint];
                        const displayName = joint.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                        return (
                            <motion.div
                                key={joint}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${isAligned
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                                        : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${isAligned
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-rose-500 text-white'
                                    }`}>
                                    {isAligned ? '✓' : '!'}
                                </div>
                                <span className={`flex-1 font-medium text-sm ${isAligned
                                        ? 'text-emerald-700 dark:text-emerald-400'
                                        : 'text-rose-700 dark:text-rose-400'
                                    }`}>
                                    {displayName}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Corrections / Tips Section */}
            <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border-t border-pink-100 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider flex items-center gap-2">
                        <span>💡</span> {messages.length === 0 ? 'Yoga Tip' : 'Corrections'}
                    </h3>
                    {messages.length === 0 && (
                        <button
                            onClick={() => setCurrentTip((prev) => (prev + 1) % YOGA_TIPS.length)}
                            className="text-xs text-pink-500 hover:text-pink-600 dark:hover:text-pink-400"
                        >
                            Next tip →
                        </button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {messages.length === 0 ? (
                        <motion.div
                            key="tip"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-start gap-3"
                        >
                            <span className="text-2xl">🧘</span>
                            <div>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
                                    Perfect! Hold this pose.
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400 italic">
                                    {YOGA_TIPS[currentTip]}
                                </span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="corrections"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            {messages.slice(0, 3).map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-2 p-2 bg-white dark:bg-gray-700 rounded-lg"
                                >
                                    <span className="text-amber-500">⚠️</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{msg}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
