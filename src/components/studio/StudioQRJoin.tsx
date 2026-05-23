import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface StudioQRJoinProps {
    classId: string;
    studioName?: string;
}

/**
 * Class join panel for students to scan a QR code with their phone.
 * QR rendered server-side via free api.qrserver.com (no library required).
 * The URL is the join page; the backend will resolve `classId` to a live session.
 */
export function StudioQRJoin({ classId, studioName = 'YogaAI Class' }: StudioQRJoinProps) {
    // The phones-side join URL. When backend exists this routes to /join?class=<id>.
    const joinUrl = useMemo(() => {
        const base = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
        return `${base}#/join?class=${classId}`;
    }, [classId]);

    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=2&format=svg&data=${encodeURIComponent(joinUrl)}`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-2xl border-2 border-white/30"
        >
            <div className="text-center mb-3">
                <p className="text-xs uppercase tracking-widest font-bold text-pink-600">
                    📲 Join This Class
                </p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{studioName}</p>
            </div>
            <div className="bg-white rounded-xl p-2 shadow-inner">
                <img
                    src={qrSrc}
                    alt="Scan to join class"
                    className="w-32 h-32 md:w-40 md:h-40 block mx-auto"
                    onError={(e) => {
                        // Fallback if QR API unreachable
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            </div>
            <p className="text-center mt-3 text-[10px] text-gray-500 font-mono break-all">
                Class: {classId}
            </p>
        </motion.div>
    );
}
