import { motion } from 'framer-motion';
import type { ClassSequence, SequenceStep } from '../../data/sequences';
import { POSES } from '../../utils/poseReferences';

interface StudioSequenceTimerProps {
    sequence: ClassSequence;
    currentStepIndex: number;
    timeRemainingSec: number;
    isTransition: boolean;
    isPaused: boolean;
}

/**
 * Big visible timer for the current pose in a class sequence.
 * Displays current pose name + remaining seconds + next pose preview.
 */
export function StudioSequenceTimer({
    sequence,
    currentStepIndex,
    timeRemainingSec,
    isTransition,
    isPaused,
}: StudioSequenceTimerProps) {
    const currentStep: SequenceStep | undefined = sequence.steps[currentStepIndex];
    const nextStep: SequenceStep | undefined = sequence.steps[currentStepIndex + 1];

    if (!currentStep) return null;

    const currentPose = POSES[currentStep.poseKey];
    const nextPose = nextStep ? POSES[nextStep.poseKey] : null;
    const totalDuration = isTransition
        ? (currentStep.transitionSec || 0)
        : currentStep.durationSec;
    const progress = totalDuration > 0
        ? Math.max(0, Math.min(100, ((totalDuration - timeRemainingSec) / totalDuration) * 100))
        : 0;

    const mins = Math.floor(timeRemainingSec / 60);
    const secs = timeRemainingSec % 60;
    const timeStr = mins > 0
        ? `${mins}:${secs.toString().padStart(2, '0')}`
        : `${secs}s`;

    return (
        <div className="relative bg-gray-900/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 border-4 border-white/10 shadow-2xl overflow-hidden">
            {/* Progress bar background */}
            <div className="absolute inset-0">
                <motion.div
                    className={`absolute left-0 top-0 bottom-0 ${isTransition
                            ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30'
                            : 'bg-gradient-to-r from-pink-500/30 to-purple-500/30'
                        }`}
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: 'linear' }}
                />
            </div>

            <div className="relative z-10">
                {/* Step number + total */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/60 uppercase tracking-widest text-sm font-bold">
                        Pose {currentStepIndex + 1} of {sequence.steps.length}
                    </span>
                    {isPaused && (
                        <span className="bg-amber-500/20 border border-amber-400/50 text-amber-300 text-sm font-bold px-3 py-1 rounded-full">
                            ⏸ PAUSED
                        </span>
                    )}
                    {isTransition && !isPaused && (
                        <span className="bg-orange-500/20 border border-orange-400/50 text-orange-300 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            ⏱ Transition
                        </span>
                    )}
                </div>

                {/* Pose name + timer */}
                <div className="flex items-end justify-between gap-6">
                    <div className="flex-1 min-w-0">
                        <p className="text-white/60 text-lg uppercase tracking-wider font-bold mb-1">
                            {isTransition ? 'Transition to next' : 'Hold this pose'}
                        </p>
                        <h2 className="text-5xl xl:text-6xl font-black text-white truncate">
                            {currentPose?.name || currentStep.poseKey}
                        </h2>
                        <p className="text-white/70 text-base mt-2 line-clamp-2">
                            {currentPose?.description}
                        </p>
                    </div>

                    {/* Big timer */}
                    <motion.div
                        key={timeRemainingSec}
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="text-right"
                    >
                        <div className={`text-7xl xl:text-9xl font-black tabular-nums leading-none drop-shadow-2xl ${timeRemainingSec <= 5 ? 'text-rose-400' : isTransition ? 'text-orange-300' : 'text-pink-300'
                            }`}>
                            {timeStr}
                        </div>
                        <div className="text-white/60 text-sm uppercase tracking-widest font-bold mt-1">
                            remaining
                        </div>
                    </motion.div>
                </div>

                {/* Next pose preview */}
                {nextPose && (
                    <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-4">
                        <span className="text-white/60 uppercase tracking-widest text-xs font-bold">
                            Next
                        </span>
                        <span className="text-white text-xl font-bold">
                            {nextPose.name}
                        </span>
                        <span className="text-white/50 text-sm">
                            · {nextStep!.durationSec}s
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
