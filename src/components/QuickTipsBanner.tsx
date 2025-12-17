import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickTipsBannerProps {
    className?: string;
}

const YOGA_TIPS = [
    {
        id: 1,
        category: 'Breathing',
        icon: '🌬️',
        tip: 'Ujjayi breathing: Breathe through your nose with a slight constriction in the throat for a calming effect.',
    },
    {
        id: 2,
        category: 'Alignment',
        icon: '🎯',
        tip: 'Keep your spine long - imagine a string pulling you up from the crown of your head.',
    },
    {
        id: 3,
        category: 'Focus',
        icon: '👁️',
        tip: 'Find a drishti (focal point) to improve your balance and concentration.',
    },
    {
        id: 4,
        category: 'Safety',
        icon: '🛡️',
        tip: 'Never push through sharp pain. Mild discomfort is okay, but pain is a signal to ease off.',
    },
    {
        id: 5,
        category: 'Progress',
        icon: '📈',
        tip: 'Flexibility improves with consistent practice. Aim for progress, not perfection.',
    },
    {
        id: 6,
        category: 'Mindfulness',
        icon: '🧠',
        tip: 'When your mind wanders, gently bring your attention back to your breath.',
    },
    {
        id: 7,
        category: 'Warm-up',
        icon: '🔥',
        tip: 'Start with gentle stretches to warm up your muscles before deeper poses.',
    },
    {
        id: 8,
        category: 'Recovery',
        icon: '💆',
        tip: "Always end your practice with Savasana (corpse pose) to allow your body to absorb the benefits.",
    },
];

export function QuickTipsBanner({ className = '' }: QuickTipsBannerProps) {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const currentTip = YOGA_TIPS[currentTipIndex];

    const nextTip = () => {
        setCurrentTipIndex((prev) => (prev + 1) % YOGA_TIPS.length);
    };

    const prevTip = () => {
        setCurrentTipIndex((prev) => (prev - 1 + YOGA_TIPS.length) % YOGA_TIPS.length);
    };

    return (
        <div className={`bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 border border-amber-200 dark:border-gray-600 rounded-xl overflow-hidden ${className}`}>
            <div className="flex items-center gap-3 p-3">
                {/* Icon */}
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-xl shrink-0 shadow-md">
                    {currentTip.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            💡 {currentTip.category} Tip
                        </span>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentTipIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2"
                        >
                            {currentTip.tip}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={prevTip}
                        className="p-1.5 text-amber-500 hover:bg-amber-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium w-8 text-center">
                        {currentTipIndex + 1}/{YOGA_TIPS.length}
                    </span>
                    <button
                        onClick={nextTip}
                        className="p-1.5 text-amber-500 hover:bg-amber-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
