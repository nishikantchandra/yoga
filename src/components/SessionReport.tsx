import { useRef } from 'react';
import type { SessionData } from '../utils/sessionAnalyzer';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SessionReportProps {
    sessionData: SessionData;
    onClose: () => void;
    onDownload: () => void; // Keeps the JSON download
}

export function SessionReport({ sessionData, onClose, onDownload }: SessionReportProps) {
    const reportRef = useRef<HTMLDivElement>(null);

    const duration = Math.round((sessionData.endTime - sessionData.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    const getPerformanceGrade = (score: number) => {
        if (score >= 90) return { grade: 'A', color: 'text-green-400', label: 'Excellent' };
        if (score >= 80) return { grade: 'B', color: 'text-blue-400', label: 'Good' };
        if (score >= 70) return { grade: 'C', color: 'text-yellow-400', label: 'Fair' };
        if (score >= 60) return { grade: 'D', color: 'text-orange-400', label: 'Needs Improvement' };
        return { grade: 'F', color: 'text-red-400', label: 'Poor' };
    };

    const performance = getPerformanceGrade(sessionData.avgScore);

    // Prepare chart data
    const chartData = sessionData.scores.map((score, index) => ({
        time: index,
        score: score
    }));

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;

        try {
            const element = reportRef.current;

            // Create a clone to render the full content without scrollbars
            const clone = element.cloneNode(true) as HTMLElement;

            // Style the clone to ensure it captures everything
            clone.style.position = 'fixed';
            clone.style.top = '-9999px';
            clone.style.left = '0';
            clone.style.width = '1000px'; // Fixed width for consistency
            clone.style.height = 'auto';
            clone.style.overflow = 'visible';
            clone.style.zIndex = '-1';

            // Remove any "no-print" elements from the clone
            const noPrintEls = clone.querySelectorAll('.no-print');
            noPrintEls.forEach(el => el.remove());

            document.body.appendChild(clone);

            // Wait a moment for images in clone to potentially re-render (though usually instant for clones)
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(clone, {
                scale: 2, // High quality
                backgroundColor: '#111827',
                logging: false,
                useCORS: true,
                allowTaint: true,
                windowWidth: 1000,
            });

            document.body.removeChild(clone);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`yoga_report_${sessionData.sessionId}.pdf`);
        } catch (err) {
            console.error("PDF generation failed:", err);
            // Fallback to print
            if (confirm("PDF generation failed. Would you like to try the browser's Print/Save as PDF option instead?")) {
                handlePrint();
            }
        }
    };

    // Find best capture
    const bestCapture = sessionData.captures.length > 0
        ? sessionData.captures.reduce((prev, current) => (prev.score > current.score) ? prev : current)
        : null;

    const referenceImageSrc = `${import.meta.env.BASE_URL}poses/${sessionData.pose.toLowerCase()}.jpg`;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="w-full max-w-5xl my-8">
                <div
                    ref={reportRef}
                    className="bg-gray-900 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.2 17.6l-2.8-7.8c-.4-1.1-1.4-1.8-2.6-1.8h-5.6c-1.2 0-2.2.7-2.6 1.8l-2.8 7.8c-.3.8.3 1.6 1.1 1.6h1.4c.5 0 .9-.3 1.1-.7l.8-2.5h7.6l.8 2.5c.2.4.6.7 1.1.7h1.4c.8 0 1.4-.8 1.1-1.6zM9.9 12.4l1.6-4.4h1l1.6 4.4h-4.2z" />
                            </svg>
                        </div>

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h2 className="text-4xl font-extrabold mb-2 tracking-tight">Session Analysis</h2>
                                <div className="flex items-center gap-3 text-indigo-100">
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                        {sessionData.pose}
                                    </span>
                                    <span className="text-sm">
                                        {new Date(sessionData.startTime).toLocaleDateString()} • {new Date(sessionData.startTime).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 no-print" data-html2canvas-ignore>
                                <button
                                    onClick={onClose}
                                    className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Comparison Section: Reference vs Best */}
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Reference Pose */}
                            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-blue-400">🎯</span> Reference Pose
                                </h3>
                                <div className="aspect-video bg-black rounded-xl overflow-hidden border-2 border-blue-500/30 relative">
                                    <img
                                        src={referenceImageSrc}
                                        alt="Reference Pose"
                                        className="w-full h-full object-contain"
                                        crossOrigin="anonymous" // Important for CORS
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-center text-sm text-gray-300">
                                        Standard Form
                                    </div>
                                </div>
                            </div>

                            {/* Best Capture */}
                            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-green-400">🏆</span> Your Best Pose
                                </h3>
                                {bestCapture ? (
                                    <div className="aspect-video bg-black rounded-xl overflow-hidden border-2 border-green-500/50 relative shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                                        <img
                                            src={bestCapture.imageData}
                                            alt="Best Capture"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 bg-green-500 text-white font-bold px-3 py-1 rounded-full shadow-lg">
                                            Score: {bestCapture.score}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-700">
                                        No captures recorded
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
                                <div className="text-gray-400 text-sm font-medium mb-1">Performance Grade</div>
                                <div className={`text-5xl font-black ${performance.color}`}>{performance.grade}</div>
                                <div className="text-white/60 text-sm mt-1">{performance.label}</div>
                            </div>

                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
                                <div className="text-gray-400 text-sm font-medium mb-1">Average Score</div>
                                <div className="text-4xl font-bold text-white">{sessionData.avgScore}</div>
                                <div className="w-full bg-gray-700 h-1.5 mt-3 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full" style={{ width: `${sessionData.avgScore}%` }}></div>
                                </div>
                            </div>

                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
                                <div className="text-gray-400 text-sm font-medium mb-1">Consistency</div>
                                <div className="text-4xl font-bold text-purple-400">
                                    {sessionData.maxScore - sessionData.minScore < 20 ? 'High' : 'Med'}
                                </div>
                                <div className="text-white/60 text-sm mt-1">
                                    Range: {sessionData.minScore}-{sessionData.maxScore}
                                </div>
                            </div>

                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm">
                                <div className="text-gray-400 text-sm font-medium mb-1">Duration</div>
                                <div className="text-4xl font-bold text-pink-400">
                                    {minutes}:{seconds.toString().padStart(2, '0')}
                                </div>
                                <div className="text-white/60 text-sm mt-1">
                                    {sessionData.totalFrames} frames
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Main Chart */}
                            <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-inner">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                    Performance Timeline
                                </h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                            <XAxis hide />
                                            <YAxis domain={[0, 100]} stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                                                itemStyle={{ color: '#60A5FA' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#3B82F6"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorScore)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Stats & Recommendations */}
                            <div className="space-y-6">
                                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                                    <h3 className="text-lg font-bold text-white mb-4">Frame Analysis</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Perfect (90+)</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-700 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-green-500 h-full"
                                                        style={{ width: `${(sessionData.perfectFrames / sessionData.totalFrames) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-white font-mono">{sessionData.perfectFrames}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400">Good (80+)</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-gray-700 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-blue-500 h-full"
                                                        style={{ width: `${(sessionData.goodFrames / sessionData.totalFrames) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-white font-mono">{sessionData.goodFrames}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-6 rounded-2xl border border-indigo-500/30">
                                    <h3 className="text-lg font-bold text-white mb-3">AI Coach Tips</h3>
                                    <ul className="space-y-2 text-sm text-indigo-200">
                                        {sessionData.avgScore >= 80 ? (
                                            <>
                                                <li className="flex gap-2">✨ Amazing form! Try holding the pose longer.</li>
                                                <li className="flex gap-2">💪 Focus on deep breathing now.</li>
                                            </>
                                        ) : (
                                            <>
                                                <li className="flex gap-2">🎯 Check the reference image alignment.</li>
                                                <li className="flex gap-2">🧘‍♀️ Move slower to find stability.</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Captured Moments Gallery */}
                        {sessionData.captures.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span className="text-pink-500">📸</span> All Captures
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {sessionData.captures.map((capture, idx) => (
                                        <div key={idx} className="group relative aspect-video bg-gray-800 rounded-xl overflow-hidden border-2 border-transparent hover:border-pink-500 transition-all shadow-lg hover:shadow-pink-500/20">
                                            <img
                                                src={capture.imageData}
                                                alt={`Capture ${idx}`}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                <div className="text-white font-bold text-lg">Score: {capture.score}</div>
                                                <div className="text-gray-300 text-xs">{new Date(capture.timestamp).toLocaleTimeString()}</div>
                                            </div>
                                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                                                {capture.score}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-800 p-6 border-t border-gray-700 flex flex-col sm:flex-row gap-4 justify-end no-print">
                        <button
                            onClick={handlePrint}
                            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Report
                        </button>

                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-pink-500/25"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </button>

                        <button
                            onClick={onDownload}
                            className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download JSON
                        </button>

                        <button
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 px-6 rounded-xl border border-gray-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
