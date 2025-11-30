import { POSES } from '../utils/poseReferences';

interface PoseSelectorProps {
    selectedPose: string;
    onSelect: (pose: string) => void;
    disabled?: boolean;
}

export function PoseSelector({ selectedPose, onSelect, disabled }: PoseSelectorProps) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Target Pose</label>
            <select
                value={selectedPose}
                onChange={(e) => onSelect(e.target.value)}
                disabled={disabled}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            >
                {Object.keys(POSES).map((pose) => (
                    <option key={pose} value={pose}>
                        {POSES[pose].name}
                    </option>
                ))}
            </select>
        </div>
    );
}
