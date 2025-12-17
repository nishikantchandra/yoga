import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingTutorialProps {
    onComplete: () => void;
}

interface TutorialStep {
    id: number;
    title: string;
    description: string;
    icon: string;
    image?: string;
    tips?: string[];
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 1,
        title: 'Welcome to YogaAI! 🧘',
        description: 'Your personal AI-powered yoga assistant that provides real-time pose correction and guidance.',
        icon: '👋',
        tips: [
            'All processing happens locally - your privacy is protected',
            'No video is ever uploaded or stored',
            'Works best in good lighting',
        ],
    },
    {
        id: 2,
        title: 'Camera Setup 📷',
        description: 'Position yourself so your full body is visible in the camera frame. Stand about 6-8 feet from the camera.',
        icon: '📷',
        tips: [
            'Wear fitted clothing for better detection',
            'Use a plain background if possible',
            'Ensure good lighting (avoid backlight)',
        ],
    },
    {
        id: 3,
        title: 'Choose Your Pose 🎯',
        description: 'Select a target pose from the dropdown menu. We recommend starting with easier poses like Downdog or Warrior 2.',
        icon: '🎯',
        tips: [
            'Reference images show the ideal form',
            'Start with beginner poses',
            'Each pose has specific alignment checks',
        ],
    },
    {
        id: 4,
        title: 'Real-Time Feedback 📊',
        description: 'Get instant visual and audio feedback. Green means aligned, red needs adjustment. Listen for voice corrections!',
        icon: '📊',
        tips: [
            'Score shows alignment percentage',
            'Watch the alignment indicators',
            'Audio guides your adjustments',
        ],
    },
    {
        id: 5,
        title: 'Track Your Progress 🏆',
        description: 'After each session, review your performance report with scores, captures, and AI coaching tips.',
        icon: '🏆',
        tips: [
            'Sessions auto-capture great poses (80+ score)',
            'Download PDF reports to track progress',
            'Use the breathing guide for better focus',
        ],
    },
];

export function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const step = TUTORIAL_STEPS[currentStep];
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
    const isFirstStep = currentStep === 0;

    useEffect(() => {
        // Check if user has seen the tutorial before
        const hasSeenTutorial = localStorage.getItem('yogaai-tutorial-completed');
        if (hasSeenTutorial) {
            setIsVisible(false);
            onComplete();
        }
    }, [onComplete]);

    const handleNext = () => {
        if (isLastStep) {
            handleComplete();
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        localStorage.setItem('yogaai-tutorial-completed', 'true');
        setIsVisible(false);
        onComplete();
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Progress Bar */}
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800">
                        <motion.div
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 text-white relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-4xl">{step.icon}</span>
                                <div>
                                    <p className="text-pink-100 text-sm">Step {step.id} of {TUTORIAL_STEPS.length}</p>
                                    <h2 className="text-2xl font-bold">{step.title}</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                                    {step.description}
                                </p>

                                {step.tips && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            💡 Tips
                                        </h4>
                                        {step.tips.map((tip, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-start gap-3 p-3 bg-pink-50 dark:bg-gray-800 rounded-xl"
                                            >
                                                <span className="text-pink-500 font-bold">✓</span>
                                                <span className="text-gray-700 dark:text-gray-300 text-sm">{tip}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="p-6 pt-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {TUTORIAL_STEPS.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentStep(index)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentStep
                                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 w-6'
                                            : index < currentStep
                                                ? 'bg-pink-300'
                                                : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            {!isFirstStep && (
                                <button
                                    onClick={handlePrev}
                                    className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors"
                                >
                                    Back
                                </button>
                            )}

                            <button
                                onClick={handleSkip}
                                className="px-4 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm transition-colors"
                            >
                                Skip
                            </button>

                            <button
                                onClick={handleNext}
                                className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-pink-300/30"
                            >
                                {isLastStep ? "Let's Start! 🚀" : 'Next'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
