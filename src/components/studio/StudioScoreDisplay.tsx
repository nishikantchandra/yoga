import { motion } from 'framer-motion';

interface StudioScoreDisplayProps {
    score: number;
    bestScore: number;
}

const getScoreColor = (score: number): string => {
    if (score >= 90) return 'from-emerald-400 to-green-500';
    if (score >= 75) return 'from-blue-400 to-cyan-500';
    if (score >= 60) return 'from-yellow-400 to-amber-500';
    if (score >= 40) return 'from-orange-400 to-orange-500';
    return 'from-rose-400 to-red-500';
};

const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'PERFECT';
    if (score >= 75) return 'GREAT';
    if (score >= 60) return 'GOOD';
    if (score >= 40) return 'KEEP GOING';
    return 'ADJUST';
};

const getScoreEmoji = (score: number): string => {
    if (score >= 90) return '🌟';
    if (score >= 75) return '💪';
    if (score >= 60) return '👍';
    if (score >= 40) return '🎯';
    return '💫';
};

/**
 * Massive score panel for big-screen Studio Mode.
 * Designed to be readable from 20+ feet away.
 */
export function StudioScoreDisplay({ score, bestScore }: StudioScoreDisplayProps) {
    const color = getScoreColor(score);
    const label = getScoreLabel(score);
    const emoji = getScoreEmoji(score);

    return (
        <div className={`relative bg-gradient-to-br ${color} rounded-3xl p-8 text-white overflow-hidden shadow-2xl border-4 border-white/20`}>
            {/* Decorative blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{emoji}</span>
                    <span className="text-xl uppercase tracking-widest font-bold opacity-90">
                        {label}
                    </span>
                </div>

                <motion.div
                    key={score}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="leading-none"
                >
                    <span className="text-[10rem] xl:text-[14rem] font-black tabular-nums tracking-tighter drop-shadow-2xl">
                        {score}
                    </span>
                    <span className="text-6xl xl:text-7xl font-black opacity-80">%</span>
                </motion.div>

                <div className="mt-4 flex items-center justify-between text-lg opacity-90">
                    <span className="flex items-center gap-2">
                        <span>🏆</span>
                        <span className="font-bold">Best:</span>
                        <span className="font-black">{bestScore}%</span>
                    </span>
                    <span className="text-sm uppercase tracking-wider opacity-75">
                        Live Score
                    </span>
                </div>
            </div>
        </div>
    );
}
