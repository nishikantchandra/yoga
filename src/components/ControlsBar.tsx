interface ControlsBarProps {
    isRunning: boolean;
    onStart: () => void;
    onStop: () => void;
    status: string;
    canStart: boolean;
}

export function ControlsBar({ isRunning, onStart, onStop, status, canStart }: ControlsBarProps) {
    return (
        <div className="flex items-center justify-between glass p-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-4">
                {!isRunning ? (
                    <button
                        onClick={onStart}
                        disabled={!canStart}
                        className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${canStart
                            ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-lg shadow-blue-900/50 glow-blue'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Start Session
                        </span>
                    </button>
                ) : (
                    <button
                        onClick={onStop}
                        className="px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-red-900/50"
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            </svg>
                            Stop Session
                        </span>
                    </button>
                )}
            </div>

            <div className="flex items-center gap-6">
                {/* Status Indicator */}
                <div className="flex items-center gap-3 glass-light px-4 py-2 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${status === 'Detecting...'
                            ? 'bg-green-500 animate-pulse'
                            : status === 'Ready'
                                ? 'bg-blue-500'
                                : status.includes('Error')
                                    ? 'bg-red-500'
                                    : 'bg-amber-500 animate-pulse'
                        }`}></div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Status</span>
                        <span className="text-white font-medium">{status}</span>
                    </div>
                </div>

                {/* Help hint */}
                <div className="hidden md:flex items-center gap-2 text-gray-500 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Stand in frame for detection</span>
                </div>
            </div>
        </div>
    );
}
