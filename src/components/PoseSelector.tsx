import { POSES } from '../utils/poseReferences';

interface PoseSelectorProps {
    selectedPose: string;
    onSelect: (pose: string) => void;
    disabled?: boolean;
}

export function PoseSelector({ selectedPose, onSelect, disabled }: PoseSelectorProps) {
    return (
        <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-pink-700 flex items-center gap-2">
                <span className="text-lg">🧘</span>
                Target Pose
            </label>
            <div className="relative">
                <select
                    value={selectedPose}
                    onChange={(e) => onSelect(e.target.value)}
                    disabled={disabled}
                    className="w-full appearance-none bg-white text-gray-700 border border-pink-300 rounded-xl p-3 pr-10 focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer hover:border-pink-400 font-medium shadow-sm"
                >
                    {Object.keys(POSES).map((pose) => (
                        <option key={pose} value={pose} className="bg-white py-2">
                            {POSES[pose].name}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                        className="w-5 h-5 text-pink-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {disabled && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Stop session to change pose
                </p>
            )}
        </div>
    );
}
