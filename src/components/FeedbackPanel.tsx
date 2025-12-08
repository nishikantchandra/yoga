import type { PoseReference } from '../utils/poseReferences';

interface FeedbackPanelProps {
    pose: PoseReference;
    feedback: { [joint: string]: boolean };
    messages: string[];
    currentScore: number;
    bestScore: number;
    isNewBest?: boolean;
}

export function FeedbackPanel({
    pose,
    feedback,
    messages,
    currentScore,
    bestScore,
    isNewBest = false
}: FeedbackPanelProps) {
    const totalJoints = Object.keys(pose.joints).length;
    const alignedJoints = Object.values(feedback).filter(v => v === true).length;

    // Determine performance level
    const getPerformanceLevel = (score: number) => {
        if (score >= 90) return { label: 'Excellent', color: 'text-emerald-400', bg: 'from-emerald-500 to-green-600', glow: 'glow-green' };
        if (score >= 75) return { label: 'Good', color: 'text-blue-400', bg: 'from-blue-500 to-cyan-600', glow: 'glow-blue' };
        if (score >= 60) return { label: 'Fair', color: 'text-amber-400', bg: 'from-amber-500 to-orange-600', glow: '' };
        return { label: 'Needs Work', color: 'text-red-400', bg: 'from-red-500 to-rose-600', glow: '' };
    };

    const performance = getPerformanceLevel(currentScore);
    const bestPerformance = getPerformanceLevel(bestScore);

    return (
        <div className="flex flex-col h-full glass p-6 rounded-2xl shadow-2xl overflow-y-auto">
            {/* Header */}
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-10 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                    {pose.name} Guide
                </span>
            </h2>

            <div className="flex-1 space-y-5">
                {/* Score Cards Container */}
                <div className="grid grid-cols-1 gap-4">

                    {/* Current Score Card */}
                    <div className="glass-light p-5 rounded-xl border border-gray-700/50 card-hover">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">⚡</span>
                                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                    Current Score
                                </h3>
                            </div>
                            <span className={`text-xs font-bold ${performance.color} px-3 py-1.5 rounded-full glass-light`}>
                                {performance.label}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <div className="h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full bg-gradient-to-r ${performance.bg} transition-all duration-300 ease-out progress-bar-animated`}
                                        style={{ width: `${currentScore}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-right min-w-[60px]">
                                <div className={`text-3xl font-bold ${performance.color} tabular-nums`}>
                                    {currentScore}
                                </div>
                            </div>
                        </div>

                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            {alignedJoints} of {totalJoints} joints aligned
                        </div>
                    </div>

                    {/* Best Score Card */}
                    <div className={`glass-light p-5 rounded-xl border border-emerald-700/30 card-hover relative overflow-hidden ${isNewBest ? 'celebrate' : ''}`}>
                        {/* Celebration overlay */}
                        {isNewBest && (
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-purple-500/10 pointer-events-none"></div>
                        )}

                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="flex items-center gap-2">
                                <span className={`text-lg ${isNewBest ? 'float' : ''}`}>🏆</span>
                                <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">
                                    Best Score
                                </h3>
                                {isNewBest && (
                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded-full animate-pulse">
                                        NEW!
                                    </span>
                                )}
                            </div>
                            <span className={`text-xs font-bold ${bestPerformance.color} px-3 py-1.5 rounded-full glass-light`}>
                                {bestPerformance.label}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="flex-1">
                                <div className="h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out ${bestScore > 0 ? 'progress-bar-animated' : ''}`}
                                        style={{ width: `${bestScore}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-right min-w-[60px]">
                                <div className={`text-3xl font-bold text-emerald-400 tabular-nums ${isNewBest ? 'scale-110 transition-transform' : ''}`}>
                                    {bestScore}
                                </div>
                            </div>
                        </div>

                        <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            Highest achieved this session
                        </div>
                    </div>
                </div>

                {/* Joint Status */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span>🎯</span> Alignment Check
                    </h3>
                    <div className="grid gap-2">
                        {Object.keys(pose.joints).map((joint) => {
                            const isAligned = feedback[joint];
                            return (
                                <div
                                    key={joint}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${isAligned === true
                                            ? 'bg-emerald-900/20 border-emerald-700/50'
                                            : isAligned === false
                                                ? 'bg-red-900/20 border-red-700/50'
                                                : 'bg-gray-800/50 border-gray-700/50'
                                        }`}
                                >
                                    <span className="text-gray-200 capitalize font-medium text-sm">
                                        {joint.replace(/_/g, ' ')}
                                    </span>
                                    {isAligned === undefined ? (
                                        <span className="text-gray-500 text-sm">—</span>
                                    ) : isAligned ? (
                                        <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-sm">
                                            <span className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center">✓</span>
                                            Good
                                        </span>
                                    ) : (
                                        <span className="text-red-400 font-bold flex items-center gap-1.5 text-sm">
                                            <span className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center">!</span>
                                            Adjust
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Corrections */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <span>💡</span> Corrections
                    </h3>
                    {messages.length === 0 ? (
                        <div className="p-4 bg-emerald-900/20 border border-emerald-700/50 rounded-xl text-emerald-400 flex items-center gap-3">
                            <span className="text-2xl float">🎉</span>
                            <span className="font-medium">Perfect! Hold this pose.</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {messages.slice(0, 3).map((msg, i) => (
                                <div
                                    key={i}
                                    className="p-3 bg-red-900/20 border border-red-700/50 rounded-xl text-red-200 flex items-start gap-3"
                                >
                                    <span className="mt-0.5 w-2 h-2 bg-red-500 rounded-full shrink-0 animate-pulse"></span>
                                    <span className="text-sm font-medium">{msg}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
