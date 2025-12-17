import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PoseHoldTimerProps {
    isAligned: boolean;  // True when score >= threshold
    threshold?: number;  // Minimum score to count as "holding"
    onMilestone?: (seconds: number) => void;  // Callback when reaching milestones
}

export function PoseHoldTimer({
    isAligned,
    threshold = 80,
    onMilestone
}: PoseHoldTimerProps) {
    const [holdTime, setHoldTime] = useState(0);
    const [bestHoldTime, setBestHoldTime] = useState(0);
    const [currentMilestone, setCurrentMilestone] = useState(0);

    // Load best hold time from storage
    useEffect(() => {
        const stored = localStorage.getItem('yogaai-best-hold');
        if (stored) {
            setBestHoldTime(parseInt(stored, 10));
        }
    }, []);

    // Timer logic
    useEffect(() => {
        if (!isAligned) {
            // Reset current hold but keep best
            if (holdTime > bestHoldTime) {
                setBestHoldTime(holdTime);
                localStorage.setItem('yogaai-best-hold', holdTime.toString());
            }
            setHoldTime(0);
            setCurrentMilestone(0);
            return;
        }

        const interval = setInterval(() => {
            setHoldTime((prev) => {
                const newTime = prev + 1;

                // Check for milestones (every 15 seconds)
                const milestone = Math.floor(newTime / 15) * 15;
                if (milestone > currentMilestone && milestone > 0) {
                    setCurrentMilestone(milestone);
                    onMilestone?.(milestone);
                }

                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isAligned, currentMilestone, holdTime, bestHoldTime, onMilestone]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
    };

    const getProgressColor = (): string => {
        if (holdTime >= 60) return 'from-emerald-400 to-green-500';
        if (holdTime >= 30) return 'from-blue-400 to-cyan-500';
        if (holdTime >= 15) return 'from-purple-400 to-pink-500';
        return 'from-pink-400 to-rose-500';
    };

    const getMilestoneLabel = (): string | null => {
        if (holdTime >= 60) return '🏆 Master Hold!';
        if (holdTime >= 45) return '⭐ Amazing!';
        if (holdTime >= 30) return '💪 Great!';
        if (holdTime >= 15) return '👍 Good!';
        return null;
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border border-indigo-200 dark:border-gray-600 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">⏱️</span>
                    <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                        Pose Hold
                    </h3>
                </div>
                {getMilestoneLabel() && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-full"
                    >
                        {getMilestoneLabel()}
                    </motion.span>
                )}
            </div>

            {/* Current Hold Time */}
            <div className="flex items-center gap-4 mb-3">
                <div className="flex-1">
                    <div className="h-3 bg-indigo-100 dark:bg-gray-600 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full bg-gradient-to-r ${getProgressColor()} progress-bar-animated`}
                            style={{ width: `${Math.min((holdTime / 60) * 100, 100)}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
                <div className="text-right min-w-[50px]">
                    <motion.div
                        key={holdTime}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className={`text-2xl font-bold tabular-nums ${isAligned ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'
                            }`}
                    >
                        {formatTime(holdTime)}
                    </motion.div>
                </div>
            </div>

            {/* Status and Best */}
            <div className="flex items-center justify-between text-xs">
                <div className={`flex items-center gap-1 ${isAligned ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                    <span className={`w-2 h-2 rounded-full ${isAligned ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></span>
                    <span>{isAligned ? `Holding at ${threshold}%+` : 'Not aligned'}</span>
                </div>
                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                    <span>🏅 Best: {formatTime(bestHoldTime)}</span>
                </div>
            </div>
        </div>
    );
}
