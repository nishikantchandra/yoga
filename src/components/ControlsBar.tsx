interface ControlsBarProps {
    isRunning: boolean;
    onStart: () => void;
    onStop: () => void;
    status: string;
    canStart: boolean;
}

export function ControlsBar({ isRunning, onStart, onStop, status, canStart }: ControlsBarProps) {
    return (
        <div className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-lg">
            <div className="flex items-center gap-4">
                {!isRunning ? (
                    <button
                        onClick={onStart}
                        disabled={!canStart}
                        className={`px-6 py-2 rounded-lg font-bold transition-all transform hover:scale-105 ${canStart
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50 shadow-lg'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Start Session
                    </button>
                ) : (
                    <button
                        onClick={onStop}
                        className="px-6 py-2 rounded-lg font-bold bg-red-600 hover:bg-red-500 text-white transition-all transform hover:scale-105 shadow-red-900/50 shadow-lg"
                    >
                        Stop
                    </button>
                )}
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Status</span>
                    <span className="text-white font-mono">{status}</span>
                </div>
            </div>
        </div>
    );
}
