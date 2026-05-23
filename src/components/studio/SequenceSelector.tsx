import { motion } from 'framer-motion';
import { SEQUENCES, getTotalDuration, type ClassSequence } from '../../data/sequences';

interface SequenceSelectorProps {
    onSelect: (sequence: ClassSequence) => void;
    onBack: () => void;
}

const formatDuration = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${mins} min`;
};

const DIFFICULTY_BADGE: Record<string, string> = {
    beginner: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    intermediate: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    advanced: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    mixed: 'bg-pink-500/20 text-pink-300 border-pink-400/40',
};

/**
 * Pre-class sequence picker shown in Studio Mode before camera turns on.
 * Designed for big-screen visibility and one-tap selection.
 */
export function SequenceSelector({ onSelect, onBack }: SequenceSelectorProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white p-8 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        title="Back to home"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <p className="text-pink-400 uppercase tracking-widest font-bold text-sm">Studio Mode</p>
                        <h1 className="text-4xl xl:text-5xl font-black">Pick a Class Sequence</h1>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-2 text-white/60 text-sm">
                    <span>💡 Tip: Use a TV / projector for the best class experience</span>
                </div>
            </header>

            {/* Sequence grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
                {SEQUENCES.map((seq, index) => (
                    <motion.button
                        key={seq.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onSelect(seq)}
                        className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-3xl p-6 text-left transition-all overflow-hidden"
                    >
                        {/* Gradient ribbon */}
                        <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${seq.color} rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity`}></div>

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${seq.color} flex items-center justify-center text-4xl shadow-lg`}>
                                    {seq.icon}
                                </div>
                                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${DIFFICULTY_BADGE[seq.difficulty]}`}>
                                    {seq.difficulty}
                                </span>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-2">{seq.name}</h3>
                            <p className="text-white/60 text-sm mb-4 line-clamp-2">{seq.description}</p>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3 text-white/70">
                                    <span className="flex items-center gap-1">
                                        <span>🧘</span>
                                        <span className="font-bold">{seq.steps.length}</span>
                                        <span className="opacity-60">poses</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span>⏱</span>
                                        <span className="font-bold">{formatDuration(getTotalDuration(seq))}</span>
                                    </span>
                                </div>
                                <span className={`bg-gradient-to-r ${seq.color} bg-clip-text text-transparent font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    Start →
                                </span>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            <p className="text-center text-white/40 text-sm mt-8">
                Each sequence auto-advances. Pause, skip, or end the class anytime from the controls.
            </p>
        </div>
    );
}
