import { motion } from 'framer-motion';

interface StudioControlsProps {
    isRunning: boolean;
    isPaused: boolean;
    isFullscreen: boolean;
    voiceEnabled: boolean;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onSkipNext: () => void;
    onStop: () => void;
    onToggleFullscreen: () => void;
    onToggleVoice: () => void;
    onExit: () => void;
}

/**
 * Large touch-friendly controls for Studio Mode.
 * All buttons are at least 64px tall for big-screen / remote control use.
 */
export function StudioControls({
    isRunning,
    isPaused,
    isFullscreen,
    voiceEnabled,
    onStart,
    onPause,
    onResume,
    onSkipNext,
    onStop,
    onToggleFullscreen,
    onToggleVoice,
    onExit,
}: StudioControlsProps) {
    return (
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-2xl">
            <div className="flex flex-wrap items-center gap-3 justify-between">
                {/* Primary controls */}
                <div className="flex items-center gap-3 flex-1 justify-center md:justify-start">
                    {!isRunning ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onStart}
                            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-500/30 min-h-[64px]"
                        >
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            START CLASS
                        </motion.button>
                    ) : (
                        <>
                            {isPaused ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onResume}
                                    className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-2xl shadow-lg min-h-[64px]"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    Resume
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onPause}
                                    className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg min-h-[64px]"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                    Pause
                                </motion.button>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onSkipNext}
                                className="flex items-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg min-h-[64px]"
                                title="Skip to next pose"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                                </svg>
                                Skip
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onStop}
                                className="flex items-center gap-2 px-6 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl shadow-lg min-h-[64px]"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 6h12v12H6z" />
                                </svg>
                                End Class
                            </motion.button>
                        </>
                    )}
                </div>

                {/* Secondary controls */}
                <div className="flex items-center gap-2">
                    <IconToggle
                        active={voiceEnabled}
                        onClick={onToggleVoice}
                        title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
                        activeIcon="🔊"
                        inactiveIcon="🔇"
                    />
                    <IconToggle
                        active={isFullscreen}
                        onClick={onToggleFullscreen}
                        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        activeIcon="⊟"
                        inactiveIcon="⛶"
                    />
                    <button
                        onClick={onExit}
                        className="w-14 h-14 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white font-bold flex items-center justify-center transition-colors"
                        title="Back to home"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

function IconToggle({
    active,
    onClick,
    title,
    activeIcon,
    inactiveIcon,
}: {
    active: boolean;
    onClick: () => void;
    title: string;
    activeIcon: string;
    inactiveIcon: string;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`w-14 h-14 rounded-2xl text-2xl flex items-center justify-center transition-all ${active
                    ? 'bg-pink-500/20 text-pink-300 border-2 border-pink-400/50'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border-2 border-transparent'
                }`}
        >
            {active ? activeIcon : inactiveIcon}
        </button>
    );
}
