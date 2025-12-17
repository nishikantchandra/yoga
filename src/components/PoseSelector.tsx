import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { POSES } from '../utils/poseReferences';

interface PoseSelectorProps {
    selectedPose: string;
    onSelect: (pose: string) => void;
    disabled?: boolean;
}

type Difficulty = 'all' | 'beginner' | 'intermediate' | 'advanced';

const DIFFICULTY_COLORS: Record<string, string> = {
    beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    advanced: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const CATEGORY_ICONS: Record<string, string> = {
    standing: '🧍',
    seated: '🧘',
    balance: '⚖️',
    core: '💪',
    inversion: '🙃',
    backbend: '🌉',
};

export function PoseSelector({ selectedPose, onSelect, disabled }: PoseSelectorProps) {
    const [difficultyFilter, setDifficultyFilter] = useState<Difficulty>('all');
    const [showDetails, setShowDetails] = useState(false);

    const filteredPoses = Object.entries(POSES).filter(([_, pose]) => {
        if (difficultyFilter === 'all') return true;
        return pose.difficulty === difficultyFilter;
    });

    const currentPose = POSES[selectedPose];

    return (
        <div className="space-y-4">
            {/* Header with label and filters */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider flex items-center gap-2">
                    🎯 Target Pose
                </label>

                {/* Difficulty Filter Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    {(['all', 'beginner', 'intermediate', 'advanced'] as Difficulty[]).map((diff) => (
                        <button
                            key={diff}
                            onClick={() => setDifficultyFilter(diff)}
                            disabled={disabled}
                            className={`px-2 py-1 text-xs rounded font-medium transition-all ${difficultyFilter === diff
                                ? 'bg-white dark:bg-gray-700 text-pink-600 dark:text-pink-400 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pose Dropdown */}
            <div className="relative">
                <select
                    value={selectedPose}
                    onChange={(e) => onSelect(e.target.value)}
                    disabled={disabled}
                    className={`w-full bg-white dark:bg-gray-800 border-2 border-pink-200 dark:border-gray-600 rounded-xl px-4 py-3 text-lg font-semibold text-gray-800 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-pink-400'
                        }`}
                >
                    {filteredPoses.map(([key, pose]) => (
                        <option key={key} value={key}>
                            {CATEGORY_ICONS[pose.category]} {pose.name} ({pose.difficulty})
                        </option>
                    ))}
                </select>

                {/* Custom dropdown arrow */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Pose Info Card */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-pink-200 dark:border-gray-600">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{CATEGORY_ICONS[currentPose.category]}</span>
                        <h3 className="font-bold text-gray-800 dark:text-white">{currentPose.name}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${DIFFICULTY_COLORS[currentPose.difficulty]}`}>
                        {currentPose.difficulty}
                    </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {currentPose.description}
                </p>

                {/* Toggle for benefits */}
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-pink-600 dark:text-pink-400 font-medium flex items-center gap-1 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
                >
                    {showDetails ? '▼' : '▶'} {showDetails ? 'Hide' : 'Show'} Benefits
                </button>

                <AnimatePresence>
                    {showDetails && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-2 mt-3">
                                {currentPose.benefits.map((benefit, i) => (
                                    <span
                                        key={i}
                                        className="text-xs bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg border border-pink-200 dark:border-gray-600"
                                    >
                                        ✓ {benefit}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick pose count */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {filteredPoses.length} poses available
                {difficultyFilter !== 'all' && ` in ${difficultyFilter} level`}
            </div>
        </div>
    );
}
