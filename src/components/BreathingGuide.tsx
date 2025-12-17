import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BreathingGuideProps {
  isActive: boolean;
  onToggle: () => void;
  pattern?: 'relaxed' | 'box' | 'energizing' | '4-7-8';
}

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

interface BreathingPattern {
  name: string;
  description: string;
  phases: { phase: BreathPhase; duration: number }[];
}

const BREATHING_PATTERNS: Record<string, BreathingPattern> = {
  relaxed: {
    name: 'Relaxed',
    description: 'Gentle 4-4 breathing',
    phases: [
      { phase: 'inhale', duration: 4000 },
      { phase: 'exhale', duration: 4000 },
    ],
  },
  box: {
    name: 'Box Breathing',
    description: '4-4-4-4 square pattern',
    phases: [
      { phase: 'inhale', duration: 4000 },
      { phase: 'hold-in', duration: 4000 },
      { phase: 'exhale', duration: 4000 },
      { phase: 'hold-out', duration: 4000 },
    ],
  },
  energizing: {
    name: 'Energizing',
    description: 'Quick 2-2 breath',
    phases: [
      { phase: 'inhale', duration: 2000 },
      { phase: 'exhale', duration: 2000 },
    ],
  },
  '4-7-8': {
    name: '4-7-8 Calm',
    description: 'Deep relaxation pattern',
    phases: [
      { phase: 'inhale', duration: 4000 },
      { phase: 'hold-in', duration: 7000 },
      { phase: 'exhale', duration: 8000 },
    ],
  },
};

const PHASE_LABELS: Record<BreathPhase, string> = {
  inhale: 'Breathe In',
  'hold-in': 'Hold',
  exhale: 'Breathe Out',
  'hold-out': 'Hold',
};

const PHASE_COLORS: Record<BreathPhase, string> = {
  inhale: 'from-blue-400 to-cyan-400',
  'hold-in': 'from-purple-400 to-indigo-400',
  exhale: 'from-pink-400 to-rose-400',
  'hold-out': 'from-amber-400 to-orange-400',
};

export function BreathingGuide({ isActive, onToggle, pattern = 'relaxed' }: BreathingGuideProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState<string>(pattern);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentPattern = BREATHING_PATTERNS[selectedPattern] || BREATHING_PATTERNS['relaxed'];
  const currentPhase = currentPattern.phases[currentPhaseIndex];

  const advancePhase = useCallback(() => {
    setCurrentPhaseIndex((prev) => (prev + 1) % currentPattern.phases.length);
    setProgress(0);
  }, [currentPattern.phases.length]);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setCurrentPhaseIndex(0);
      return;
    }

    const phaseDuration = currentPhase.duration;
    const intervalMs = 50;
    const progressIncrement = (intervalMs / phaseDuration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          advancePhase();
          return 0;
        }
        return prev + progressIncrement;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isActive, currentPhase.duration, advancePhase]);

  // Audio feedback for phase changes
  useEffect(() => {
    if (!isActive) return;

    if ('speechSynthesis' in window && progress === 0) {
      const utterance = new SpeechSynthesisUtterance(PHASE_LABELS[currentPhase.phase]);
      utterance.rate = 0.9;
      utterance.volume = 0.5;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentPhaseIndex, isActive, currentPhase.phase, progress]);

  const circleScale = currentPhase.phase === 'inhale'
    ? 0.6 + (progress / 100) * 0.4
    : currentPhase.phase === 'exhale'
      ? 1 - (progress / 100) * 0.4
      : 1;

  return (
    <div className="relative">
      {/* Minimized Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${isActive
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-300'
            : 'bg-white/80 dark:bg-gray-800/80 border border-pink-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700'
          }`}
      >
        <span className={`text-lg ${isActive ? 'animate-pulse' : ''}`}>🌬️</span>
        <span className="font-medium text-sm">Breathing</span>
        {isActive && (
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-pink-200 dark:border-gray-700 p-5 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-white">Breathing Guide</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Pattern Selector */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                Pattern
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(BREATHING_PATTERNS).map(([key, pat]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPattern(key)}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${selectedPattern === key
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    {pat.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">{currentPattern.description}</p>
            </div>

            {/* Breathing Circle */}
            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-32">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-gray-200 dark:border-gray-600"></div>

                {/* Inner breathing circle */}
                <motion.div
                  animate={{ scale: circleScale }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                  className={`absolute inset-2 rounded-full bg-gradient-to-br ${PHASE_COLORS[currentPhase.phase]} flex items-center justify-center shadow-lg`}
                >
                  <span className="text-white font-bold text-sm text-center px-2">
                    {PHASE_LABELS[currentPhase.phase]}
                  </span>
                </motion.div>

                {/* Progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-pink-200 dark:text-gray-600"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * progress) / 100}
                    className="text-pink-500 transition-all duration-100"
                  />
                </svg>
              </div>
            </div>

            {/* Control Button */}
            <button
              onClick={onToggle}
              className={`w-full py-3 rounded-xl font-bold transition-all ${isActive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white'
                }`}
            >
              {isActive ? 'Stop Breathing Guide' : 'Start Breathing Guide'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
