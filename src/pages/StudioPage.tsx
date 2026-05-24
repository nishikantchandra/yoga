import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { WebcamCanvas } from '../components/WebcamCanvas';
import { useWebcam } from '../hooks/useWebcam';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { useHashRoute } from '../hooks/useHashRoute';
import { POSES } from '../utils/poseReferences';
import { SequenceSelector } from '../components/studio/SequenceSelector';
import { StudioScoreDisplay } from '../components/studio/StudioScoreDisplay';
import { StudioSequenceTimer } from '../components/studio/StudioSequenceTimer';
import { StudioControls } from '../components/studio/StudioControls';
import { StudioQRJoin } from '../components/studio/StudioQRJoin';
import { StudioCelebration } from '../components/studio/StudioCelebration';
import type { ClassSequence } from '../data/sequences';

const generateClassId = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export default function StudioPage() {
    const { navigate } = useHashRoute();
    const [sequence, setSequence] = useState<ClassSequence | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [timeRemainingSec, setTimeRemainingSec] = useState(0);
    const [isTransition, setIsTransition] = useState(false);
    const [smoothedScore, setSmoothedScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [showCelebration, setShowCelebration] = useState(false);
    const [classId] = useState(generateClassId());

    const { stream, error: cameraError, startCamera, stopCamera } = useWebcam();
    const { detector, isLoading: modelLoading } = usePoseDetection();

    const previousSmoothedScore = useRef(0);
    const lastCelebrationTime = useRef(0);
    const lastSpokenPose = useRef<string>('');
    const containerRef = useRef<HTMLDivElement>(null);

    const currentStep = sequence?.steps[currentStepIndex];
    const currentPose = currentStep ? POSES[currentStep.poseKey] : null;

    // Memoize the WebcamCanvas pose so it doesn't reload model effect on every render
    const cameraPose = useMemo(() => currentPose, [currentPose?.name]);

    // Voice utility
    const speak = useCallback((text: string) => {
        if (!voiceEnabled) return;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.volume = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    }, [voiceEnabled]);

    // Move to a step (or transition)
    const goToStep = useCallback((stepIndex: number, asTransition = false) => {
        if (!sequence) return;
        const step = sequence.steps[stepIndex];
        if (!step) return;

        setCurrentStepIndex(stepIndex);
        if (asTransition) {
            setIsTransition(true);
            setTimeRemainingSec(step.transitionSec || 0);
        } else {
            setIsTransition(false);
            setTimeRemainingSec(step.durationSec);
            const pose = POSES[step.poseKey];
            if (pose && pose.name !== lastSpokenPose.current) {
                speak(`Next pose: ${pose.name}`);
                lastSpokenPose.current = pose.name;
            }
        }
    }, [sequence, speak]);

    // Class lifecycle
    const handleStartClass = async () => {
        if (!sequence) return;
        await startCamera();
        setIsRunning(true);
        setIsPaused(false);
        setSmoothedScore(0);
        setBestScore(0);
        previousSmoothedScore.current = 0;
        goToStep(0, false);
        speak(`Starting ${sequence.name}. ${POSES[sequence.steps[0].poseKey]?.name || ''}`);
    };

    const handlePause = () => {
        setIsPaused(true);
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };

    const handleResume = () => {
        setIsPaused(false);
    };

    const handleSkipNext = () => {
        if (!sequence) return;
        const next = currentStepIndex + 1;
        if (next >= sequence.steps.length) {
            handleStop();
        } else {
            goToStep(next, false);
        }
    };

    const handleStop = useCallback(() => {
        stopCamera();
        setIsRunning(false);
        setIsPaused(false);
        setCurrentStepIndex(0);
        setTimeRemainingSec(0);
        setIsTransition(false);
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }, [stopCamera]);

    const handleExit = () => {
        handleStop();
        setSequence(null);
        navigate('home');
    };

    // Fullscreen API
    const handleToggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await containerRef.current?.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.warn('Fullscreen failed', err);
        }
    };

    // Listen to fullscreen changes
    useEffect(() => {
        const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!isRunning || isPaused || !sequence) return;

        const interval = setInterval(() => {
            setTimeRemainingSec((prev) => {
                if (prev <= 1) {
                    // Phase complete: either move to transition or next pose
                    if (!isTransition) {
                        const step = sequence.steps[currentStepIndex];
                        if (step.transitionSec && step.transitionSec > 0) {
                            // Enter transition
                            setIsTransition(true);
                            return step.transitionSec;
                        }
                    }
                    // Move to next step
                    const nextIndex = currentStepIndex + 1;
                    if (nextIndex >= sequence.steps.length) {
                        // Class complete!
                        speak(`Class complete. Wonderful job!`);
                        setTimeout(() => handleStop(), 500);
                        return 0;
                    }
                    setCurrentStepIndex(nextIndex);
                    setIsTransition(false);
                    const nextPose = POSES[sequence.steps[nextIndex].poseKey];
                    if (nextPose && voiceEnabled) {
                        const u = new SpeechSynthesisUtterance(`Next pose: ${nextPose.name}`);
                        u.rate = 0.95;
                        window.speechSynthesis.speak(u);
                    }
                    return sequence.steps[nextIndex].durationSec;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, isPaused, sequence, currentStepIndex, isTransition, voiceEnabled, speak, handleStop]);

    // Pose detection feedback handler
    const handleFeedbackUpdate = useCallback((
        feedback: { [joint: string]: boolean },
        _messages: string[],
        _angles: { [joint: string]: number }
    ) => {
        const totalJoints = Object.keys(feedback).length;
        const aligned = Object.values(feedback).filter(v => v === true).length;
        const rawScore = totalJoints > 0 ? Math.round((aligned / totalJoints) * 100) : 0;

        const alpha = 0.3;
        const next = Math.round(alpha * rawScore + (1 - alpha) * previousSmoothedScore.current);
        previousSmoothedScore.current = next;
        setSmoothedScore(next);

        if (rawScore > bestScore) setBestScore(rawScore);

        // Trigger celebration on perfect pose (max once every 8s)
        if (rawScore >= 95 && Date.now() - lastCelebrationTime.current > 8000 && !isTransition) {
            lastCelebrationTime.current = Date.now();
            setShowCelebration(true);
        }
    }, [bestScore, isTransition]);

    // ============== Render branches ==============

    // Step 1: Sequence picker (no sequence selected yet)
    if (!sequence) {
        return <SequenceSelector onSelect={setSequence} onBack={() => navigate('home')} />;
    }

    // Step 2: Pre-class (sequence chosen but class not started)
    if (!isRunning) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white p-8 flex flex-col">
                <header className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => setSequence(null)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        ← Change sequence
                    </button>
                    <button
                        onClick={() => navigate('home')}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        Back to Home
                    </button>
                </header>

                <div className="flex-1 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl"
                    >
                        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br ${sequence.color} text-7xl mb-8 shadow-2xl`}>
                            {sequence.icon}
                        </div>
                        <p className="text-pink-400 uppercase tracking-widest font-bold text-sm mb-2">Ready to start</p>
                        <h1 className="text-7xl font-black mb-4">{sequence.name}</h1>
                        <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">{sequence.description}</p>

                        <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-3xl font-black text-pink-300">{sequence.steps.length}</div>
                                <div className="text-xs uppercase tracking-wider text-white/60 mt-1">Poses</div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-3xl font-black text-purple-300">
                                    {Math.ceil(sequence.steps.reduce((s, st) => s + st.durationSec + (st.transitionSec || 0), 0) / 60)}
                                </div>
                                <div className="text-xs uppercase tracking-wider text-white/60 mt-1">Minutes</div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-3xl font-black text-emerald-300">{sequence.difficulty}</div>
                                <div className="text-xs uppercase tracking-wider text-white/60 mt-1">Level</div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStartClass}
                            disabled={modelLoading}
                            className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 disabled:opacity-50 text-white font-black text-2xl rounded-2xl shadow-2xl shadow-emerald-500/40"
                        >
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            {modelLoading ? 'Loading AI Model…' : 'START CLASS'}
                        </motion.button>

                        <p className="text-white/40 text-sm mt-6">
                            Tip: Switch to fullscreen for the best experience on a TV or projector.
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Step 3: Live class (running)
    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-black text-white overflow-hidden"
        >
            <StudioCelebration
                show={showCelebration}
                title="PERFECT POSE!"
                subtitle="Hold steady"
                onClose={() => setShowCelebration(false)}
            />

            {cameraError && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-rose-900/80 backdrop-blur-sm">
                    <div className="text-center">
                        <p className="text-3xl font-black mb-2">{cameraError}</p>
                        <p className="text-white/70">Please allow camera access to continue.</p>
                        <button
                            onClick={handleExit}
                            className="mt-6 px-6 py-3 bg-white text-rose-900 font-bold rounded-xl"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            )}

            <div className="h-screen w-screen p-4 grid grid-cols-12 grid-rows-12 gap-4">
                {/* Left: webcam (8 cols, full height minus controls) */}
                <div className="col-span-12 lg:col-span-8 row-span-10 bg-gray-900 rounded-3xl overflow-hidden relative shadow-2xl border border-white/10">
                    <WebcamCanvas
                        stream={stream}
                        detector={detector}
                        pose={cameraPose!}
                        isRunning={isRunning && !isPaused && !isTransition}
                        onFeedbackUpdate={handleFeedbackUpdate}
                    />

                    {/* Sequence + class info overlay - top */}
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10 pointer-events-auto">
                            <p className="text-pink-300 uppercase tracking-widest text-xs font-bold">{sequence.name}</p>
                            <p className="text-white text-2xl font-black">{currentPose?.name || ''}</p>
                        </div>

                        <div className="pointer-events-auto">
                            <StudioQRJoin classId={classId} studioName={sequence.name} />
                        </div>
                    </div>

                    {/* Sequence dots - bottom of camera */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
                        {sequence.steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all ${i < currentStepIndex
                                        ? 'w-3 bg-emerald-400'
                                        : i === currentStepIndex
                                            ? 'w-8 bg-pink-400'
                                            : 'w-3 bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right column: score + timer (4 cols stacked) */}
                <div className="col-span-12 lg:col-span-4 row-span-10 flex flex-col gap-4 min-h-0">
                    <StudioScoreDisplay score={smoothedScore} bestScore={bestScore} />
                    <div className="flex-1 min-h-0">
                        <StudioSequenceTimer
                            sequence={sequence}
                            currentStepIndex={currentStepIndex}
                            timeRemainingSec={timeRemainingSec}
                            isTransition={isTransition}
                            isPaused={isPaused}
                        />
                    </div>
                </div>

                {/* Bottom: controls (full width) */}
                <div className="col-span-12 row-span-2">
                    <StudioControls
                        isRunning={isRunning}
                        isPaused={isPaused}
                        isFullscreen={isFullscreen}
                        voiceEnabled={voiceEnabled}
                        onStart={handleStartClass}
                        onPause={handlePause}
                        onResume={handleResume}
                        onSkipNext={handleSkipNext}
                        onStop={handleStop}
                        onToggleFullscreen={handleToggleFullscreen}
                        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
                        onExit={handleExit}
                    />
                </div>
            </div>
        </div>
    );
}
