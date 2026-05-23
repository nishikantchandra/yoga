import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface StudioCelebrationProps {
    show: boolean;
    title?: string;
    subtitle?: string;
    onClose?: () => void;
}

/**
 * Full-screen celebration moment for Studio Mode.
 * Triggers confetti + animated banner when class hits a milestone.
 */
export function StudioCelebration({ show, title = 'PERFECT POSE!', subtitle = 'Hold steady', onClose }: StudioCelebrationProps) {
    useEffect(() => {
        if (!show) return;

        // Big-screen-worthy confetti burst
        const fire = (particleRatio: number, opts: confetti.Options) => {
            confetti({
                ...opts,
                origin: { y: 0.6 },
                particleCount: Math.floor(300 * particleRatio),
                colors: ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
            });
        };

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });

        const timer = setTimeout(() => onClose?.(), 3500);
        return () => clearTimeout(timer);
    }, [show, onClose]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] pointer-events-none flex items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0.5, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 px-16 py-12 rounded-3xl shadow-2xl border-8 border-white/30 text-center"
                    >
                        <div className="text-9xl mb-4 drop-shadow-lg">🌟</div>
                        <h1 className="text-7xl font-black text-white drop-shadow-2xl tracking-tight">
                            {title}
                        </h1>
                        <p className="text-3xl text-white/90 font-bold mt-3 uppercase tracking-widest">
                            {subtitle}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
