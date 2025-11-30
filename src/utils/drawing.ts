import type { Keypoint } from '@tensorflow-models/pose-detection';

const COLOR_ALIGNED = '#4ade80'; // green-400
const COLOR_MISALIGNED = '#f87171'; // red-400
const COLOR_NEUTRAL = '#ffffff';

export function drawSkeleton(
    ctx: CanvasRenderingContext2D,
    keypoints: Keypoint[],
    feedback: { [joint: string]: boolean }
) {
    // Define connections
    const connections = [
        [5, 7], [7, 9], // Left arm
        [6, 8], [8, 10], // Right arm
        [5, 6], // Shoulders
        [5, 11], [6, 12], // Torso
        [11, 12], // Hips
        [11, 13], [13, 15], // Left leg
        [12, 14], [14, 16] // Right leg
    ];

    // Draw lines
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';

    connections.forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];

        if (kp1 && kp2 && kp1.score && kp1.score > 0.3 && kp2.score && kp2.score > 0.3) {
            ctx.beginPath();
            ctx.moveTo(kp1.x, kp1.y);
            ctx.lineTo(kp2.x, kp2.y);
            ctx.stroke();
        }
    });

    // Draw joints
    keypoints.forEach((kp, index) => {
        if (kp && kp.score && kp.score > 0.3) {
            let color = COLOR_NEUTRAL;

            // Map keypoint index to joint name used in feedback
            const jointNames = getJointNamesFromIndex(index);

            // If any of the associated joint checks failed, mark as red
            let isMisaligned = false;
            let isChecked = false;

            jointNames.forEach(name => {
                if (feedback[name] !== undefined) {
                    isChecked = true;
                    if (feedback[name] === false) {
                        isMisaligned = true;
                    }
                }
            });

            if (isChecked) {
                color = isMisaligned ? COLOR_MISALIGNED : COLOR_ALIGNED;
            }

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#000';
            ctx.stroke();
        }
    });
}

function getJointNamesFromIndex(index: number): string[] {
    // Returns list of feedback keys that this joint participates in
    const map: { [key: number]: string[] } = {
        5: ['arms_horizontal', 'body_alignment'], // Left Shoulder
        6: ['arms_horizontal', 'body_alignment'], // Right Shoulder
        7: ['left_elbow'],
        8: ['right_elbow'],
        11: ['hip_flexion', 'body_alignment'], // Left Hip
        12: ['hip_flexion', 'body_alignment'], // Right Hip
        13: ['left_knee', 'hip_flexion'],
        14: ['right_knee', 'hip_flexion'],
        15: ['body_alignment'], // Left Ankle
        16: ['body_alignment']  // Right Ankle
    };
    return map[index] || [];
}
