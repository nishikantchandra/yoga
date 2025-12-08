import { useRef, useState } from 'react';
import type { SessionData } from '../utils/sessionAnalyzer';
import { POSES } from '../utils/poseReferences';
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
    onDownload: () => void;
    onContinue?: (poseKey: string) => void; // New prop for continuing with selected pose
}

export function SessionReport({ sessionData, onClose, onDownload, onContinue }: SessionReportProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const [selectedNextPose, setSelectedNextPose] = useState(sessionData.pose);

    const duration = Math.round((sessionData.endTime - sessionData.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    const getPerformanceGrade = (score: number) => {
        if (score >= 90) return { grade: 'A+', color: 'text-emerald-400', bgColor: 'bg-emerald-500', label: 'Excellent', emoji: '🏆' };
        if (score >= 80) return { grade: 'A', color: 'text-green-400', bgColor: 'bg-green-500', label: 'Great', emoji: '⭐' };
        if (score >= 70) return { grade: 'B', color: 'text-blue-400', bgColor: 'bg-blue-500', label: 'Good', emoji: '👍' };
        if (score >= 60) return { grade: 'C', color: 'text-yellow-400', bgColor: 'bg-yellow-500', label: 'Fair', emoji: '💪' };
        if (score >= 50) return { grade: 'D', color: 'text-orange-400', bgColor: 'bg-orange-500', label: 'Needs Work', emoji: '📈' };
        return { grade: 'F', color: 'text-red-400', bgColor: 'bg-red-500', label: 'Keep Practicing', emoji: '🧘' };
    };

    const performance = getPerformanceGrade(sessionData.avgScore);
    const bestPerformance = getPerformanceGrade(sessionData.maxScore);

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
            const clone = element.cloneNode(true) as HTMLElement;
            clone.style.position = 'fixed';
            clone.style.top = '-9999px';
            clone.style.left = '0';
            clone.style.width = '1000px';
            clone.style.height = 'auto';
            clone.style.overflow = 'visible';
            clone.style.zIndex = '-1';

            const noPrintEls = clone.querySelectorAll('.no-print');
            noPrintEls.forEach(el => el.remove());
            document.body.appendChild(clone);
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(clone, {
                scale: 2,
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
            if (confirm("PDF generation failed. Would you like to try the browser's Print/Save as PDF option instead?")) {
                handlePrint();
            }
        }
    };

    const handleContinue = () => {
        if (onContinue) {
            onContinue(selectedNextPose);
        }
    };

    const bestCapture = sessionData.captures.length > 0
        ? sessionData.captures.reduce((prev, current) => (prev.score > current.score) ? prev : current)
        : null;

    const referenceImageSrc = `${import.meta.env.BASE_URL}poses/${sessionData.pose.toLowerCase()}.jpg`;

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="w-full max-w-6xl my-4">
                <div
                    ref={reportRef}
                    className="glass rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50"
                >
                    {/* Enhanced Header */}
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-4xl">{performance.emoji}</span>
                                        <h2 className="text-4xl font-extrabold tracking-tight">Session Complete!</h2>
                                    </div>
                                    <div className="flex items-center gap-3 text-indigo-100">
                                        <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm flex items-center gap-2">
                                            🧘 {sessionData.pose}
                                        </span>
                                        <span className="text-sm opacity-80">
                                            {new Date(sessionData.startTime).toLocaleDateString()} • {new Date(sessionData.startTime).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all hover:rotate-90 duration-300 no-print"
                                    data-html2canvas-ignore
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Quick Stats Banner */}
                            <div className="grid grid-cols-4 gap-4 mt-6 no-print" data-html2canvas-ignore>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                                    <div className="text-3xl font-black">{performance.grade}</div>
                                    <div className="text-xs opacity-80 mt-1">Grade</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                                    <div className="text-3xl font-black">{sessionData.maxScore}</div>
                                    <div className="text-xs opacity-80 mt-1">Best Score</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                                    <div className="text-3xl font-black">{sessionData.avgScore}</div>
                                    <div className="text-xs opacity-80 mt-1">Average</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                                    <div className="text-3xl font-black">{minutes}:{seconds.toString().padStart(2, '0')}</div>
                                    <div className="text-xs opacity-80 mt-1">Duration</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Comparison Section: Reference vs Best */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Reference Pose */}
                            <div className="glass-light p-6 rounded-2xl border border-gray-700/50">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-blue-400">🎯</span> Reference Pose
                                </h3>
                                <div className="aspect-video bg-black rounded-xl overflow-hidden border-2 border-blue-500/30 relative group">
                                    <img
                                        src={referenceImageSrc}
                                        alt="Reference Pose"
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                        crossOrigin="anonymous"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-center">
                                        <span className="text-sm text-gray-300 font-medium">Standard Form</span>
                                    </div>
                                </div>
                            </div>

                            {/* Best Capture */}
                            <div className="glass-light p-6 rounded-2xl border border-emerald-700/30">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-emerald-400">🏆</span> Your Best Pose
                                    {bestCapture && (
                                        <span className="ml-auto text-sm font-normal bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
                                            Score: {bestCapture.score}
                                        </span>
                                    )}
                                </h3>
                                {bestCapture ? (
                                    <div className="aspect-video bg-black rounded-xl overflow-hidden border-2 border-emerald-500/50 relative shadow-lg shadow-emerald-500/10 group">
                                        <img
                                            src={bestCapture.imageData}
                                            alt="Best Capture"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-gray-900/50 rounded-xl flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-700 gap-3">
                                        <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="text-sm">Score 80+ to auto-capture</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass-light p-5 rounded-2xl border border-gray-700/50 text-center">
                                <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Performance</div>
                                <div className={`text-5xl font-black ${performance.color}`}>{performance.grade}</div>
                                <div className="text-gray-500 text-sm mt-1">{performance.label}</div>
                            </div>

                            <div className="glass-light p-5 rounded-2xl border border-emerald-700/30 text-center">
                                <div className="text-emerald-400 text-xs font-medium uppercase tracking-wider mb-2">Best Score</div>
                                <div className="text-5xl font-black text-emerald-400">{sessionData.maxScore}</div>
                                <div className="text-gray-500 text-sm mt-1">{bestPerformance.label}</div>
                            </div>

                            <div className="glass-light p-5 rounded-2xl border border-blue-700/30 text-center">
                                <div className="text-blue-400 text-xs font-medium uppercase tracking-wider mb-2">Average</div>
                                <div className="text-5xl font-black text-blue-400">{sessionData.avgScore}</div>
                                <div className="w-full bg-gray-700 h-1.5 mt-3 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${sessionData.avgScore}%` }}></div>
                                </div>
                            </div>

                            <div className="glass-light p-5 rounded-2xl border border-purple-700/30 text-center">
                                <div className="text-purple-400 text-xs font-medium uppercase tracking-wider mb-2">Duration</div>
                                <div className="text-5xl font-black text-purple-400">
                                    {minutes}:{seconds.toString().padStart(2, '0')}
                                </div>
                                <div className="text-gray-500 text-sm mt-1">{sessionData.totalFrames} frames</div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Performance Timeline */}
                            <div className="lg:col-span-2 glass-light p-6 rounded-2xl border border-gray-700/50">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                                    Performance Timeline
                                </h3>
                                <div className="h-56 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                            <XAxis hide />
                                            <YAxis domain={[0, 100]} stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', borderRadius: '12px', color: '#fff' }}
                                                itemStyle={{ color: '#A78BFA' }}
                                                labelStyle={{ display: 'none' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#8B5CF6"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorScore)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Side Stats */}
                            <div className="space-y-4">
                                <div className="glass-light p-5 rounded-2xl border border-gray-700/50">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        📊 Frame Analysis
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm">Perfect (90+)</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-gray-700 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-emerald-500 h-full" style={{ width: `${(sessionData.perfectFrames / Math.max(sessionData.totalFrames, 1)) * 100}%` }}></div>
                                                </div>
                                                <span className="text-white font-mono text-sm w-8 text-right">{sessionData.perfectFrames}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm">Good (80+)</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-gray-700 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-blue-500 h-full" style={{ width: `${(sessionData.goodFrames / Math.max(sessionData.totalFrames, 1)) * 100}%` }}></div>
                                                </div>
                                                <span className="text-white font-mono text-sm w-8 text-right">{sessionData.goodFrames}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm">Consistency</span>
                                            <span className={`font-bold text-sm ${sessionData.maxScore - sessionData.minScore < 20 ? 'text-emerald-400' : sessionData.maxScore - sessionData.minScore < 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                {sessionData.maxScore - sessionData.minScore < 20 ? 'High' : sessionData.maxScore - sessionData.minScore < 40 ? 'Medium' : 'Low'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-5 rounded-2xl border border-indigo-500/30">
                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">💡 AI Coach Tips</h3>
                                    <ul className="space-y-2 text-sm text-indigo-200">
                                        {sessionData.avgScore >= 80 ? (
                                            <>
                                                <li className="flex gap-2">✨ Amazing form! Try holding longer.</li>
                                                <li className="flex gap-2">💪 Focus on deep breathing.</li>
                                            </>
                                        ) : sessionData.avgScore >= 60 ? (
                                            <>
                                                <li className="flex gap-2">📈 Good progress! Keep practicing.</li>
                                                <li className="flex gap-2">🎯 Watch the reference pose closely.</li>
                                            </>
                                        ) : (
                                            <>
                                                <li className="flex gap-2">🧘 Take it slow and steady.</li>
                                                <li className="flex gap-2">👀 Focus on one joint at a time.</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Captures Gallery */}
                        {sessionData.captures.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-pink-500">📸</span> Session Captures
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {sessionData.captures.map((capture, idx) => (
                                        <div key={idx} className="group relative aspect-video bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-pink-500 transition-all">
                                            <img
                                                src={capture.imageData}
                                                alt={`Capture ${idx}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                                {capture.score}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Footer with Continue Option */}
                    <div className="bg-gray-800/80 backdrop-blur-sm p-6 border-t border-gray-700/50 no-print">
                        {/* Continue Section */}
                        {onContinue && (
                            <div className="mb-6 p-5 glass-light rounded-2xl border border-blue-500/30">
                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    🚀 Continue Practicing
                                </h4>
                                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                    <div className="flex-1">
                                        <label className="text-sm text-gray-400 mb-2 block">Select next pose:</label>
                                        <select
                                            value={selectedNextPose}
                                            onChange={(e) => setSelectedNextPose(e.target.value)}
                                            className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all cursor-pointer"
                                        >
                                            {Object.keys(POSES).map((pose) => (
                                                <option key={pose} value={pose}>
                                                    {POSES[pose].name} {pose === sessionData.pose ? '(Same)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleContinue}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Start New Session
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 justify-between items-center">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleDownloadPDF}
                                    className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold py-2.5 px-5 rounded-xl transition-all hover:shadow-lg hover:shadow-pink-500/25"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF
                                </button>

                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 px-5 rounded-xl transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print
                                </button>

                                <button
                                    onClick={onDownload}
                                    className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-semibold py-2.5 px-5 rounded-xl transition-all border border-gray-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    JSON Data
                                </button>
                            </div>

                            <button
                                onClick={onClose}
                                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2.5 px-6 rounded-xl border border-gray-600 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
