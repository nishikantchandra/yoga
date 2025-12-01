import type { PoseReference } from '../utils/poseReferences';

interface FeedbackPanelProps {
    pose: PoseReference;
    feedback: { [joint: string]: boolean }; // true = aligned, false = misaligned
    messages: string[];
}

export function FeedbackPanel({ pose, feedback, messages }: FeedbackPanelProps) {
    // Calculate score based on aligned joints
    const totalJoints = Object.keys(pose.joints).length;
    const alignedJoints = Object.values(feedback).filter(v => v === true).length;
    const score = totalJoints > 0 ? Math.round((alignedJoints / totalJoints) * 100) : 0;

    // Determine performance level
    const getPerformanceLevel = (score: number) => {
        if (score >= 90) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-500' };
        if (score >= 75) return { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-500' };
        if (score >= 60) return { label: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500' };
        return { label: 'Needs Work', color: 'text-red-400', bg: 'bg-red-500' };
    };

    const performance = getPerformanceLevel(score);

    return (
        <div className="flex flex-col h-full bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                {pose.name} Guide
            </h2>

            <div className="flex-1 space-y-6">
                {/* Score Display */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Performance Score</h3>
                        <span className={`text-xs font-bold ${performance.color} px-3 py-1 rounded-full bg-gray-800`}>
                            {performance.label}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            {/* Progress bar */}
                            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${performance.bg} transition-all duration-500 ease-out`}
                                    style={{ width: `${score}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-4xl font-bold ${performance.color}`}>{score}</div>
                            <div className="text-xs text-gray-500">/ 100</div>
                        </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                        {alignedJoints} of {totalJoints} joints aligned
                    </div>
                </div>

                {/* Joint Status */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Alignment Check</h3>
                    {Object.keys(pose.joints).map((joint) => {
                        const isAligned = feedback[joint];
                        return (
                            <div key={joint} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                                <span className="text-gray-200 capitalize font-medium">{joint.replace(/_/g, ' ')}</span>
                                {isAligned === undefined ? (
                                    <span className="text-gray-500">-</span>
                                ) : isAligned ? (
                                    <span className="text-green-400 font-bold flex items-center gap-1">
                                        ✓ <span className="text-xs">Good</span>
                                    </span>
                                ) : (
                                    <span className="text-red-400 font-bold flex items-center gap-1">
                                        ⚠ <span className="text-xs">Adjust</span>
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Actionable Feedback */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Corrections</h3>
                    {messages.length === 0 ? (
                        <div className="p-4 bg-green-900/20 border border-green-800/50 rounded-lg text-green-400 flex items-center gap-3">
                            <span className="text-2xl">🎉</span>
                            <span className="font-medium">Perfect! Hold this pose.</span>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className="p-4 bg-red-900/20 border border-red-800/50 rounded-lg text-red-200 flex items-start gap-3 animate-pulse">
                                <span className="mt-1 text-red-500">●</span>
                                <span className="font-medium">{msg}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
