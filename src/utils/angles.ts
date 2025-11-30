import type { Keypoint } from '@tensorflow-models/pose-detection';

export function calculateAngle(
    a: Keypoint,
    b: Keypoint,
    c: Keypoint
): number {
    if (!a || !b || !c) return 0;

    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);

    if (angle > 180.0) {
        angle = 360.0 - angle;
    }
    return angle;
}

export function getPoseAngles(keypoints: Keypoint[]) {
    // MoveNet Keypoints indices:
    // 5: left_shoulder, 6: right_shoulder
    // 7: left_elbow, 8: right_elbow
    // 9: left_wrist, 10: right_wrist
    // 11: left_hip, 12: right_hip
    // 13: left_knee, 14: right_knee
    // 15: left_ankle, 16: right_ankle

    const p = (index: number) => keypoints[index];

    const angles: { [key: string]: number } = {};

    // Elbows
    angles['left_elbow'] = calculateAngle(p(5), p(7), p(9));
    angles['right_elbow'] = calculateAngle(p(6), p(8), p(10));

    // Knees
    angles['left_knee'] = calculateAngle(p(11), p(13), p(15));
    angles['right_knee'] = calculateAngle(p(12), p(14), p(16));

    // Hip Flexion (Downdog) - Angle between torso and legs
    // Using mid-shoulder, mid-hip, mid-knee
    const midShoulder = { x: (p(5).x + p(6).x) / 2, y: (p(5).y + p(6).y) / 2, score: 1 };
    const midHip = { x: (p(11).x + p(12).x) / 2, y: (p(11).y + p(12).y) / 2, score: 1 };
    const midKnee = { x: (p(13).x + p(14).x) / 2, y: (p(13).y + p(14).y) / 2, score: 1 };

    // Note: calculateAngle expects Keypoint objects.
    angles['hip_flexion'] = calculateAngle(midShoulder as Keypoint, midHip as Keypoint, midKnee as Keypoint);

    // Body Alignment (Plank) - Shoulder, Hip, Ankle (straight line)
    // Using average of left/right for robustness
    const midAnkle = { x: (p(15).x + p(16).x) / 2, y: (p(15).y + p(16).y) / 2, score: 1 };
    angles['body_alignment'] = calculateAngle(midShoulder as Keypoint, midHip as Keypoint, midAnkle as Keypoint);

    // Arms Horizontal (Warrior 2)
    // Angle between left arm vector and right arm vector
    angles['arms_horizontal'] = calculateAngle(p(9), midShoulder as Keypoint, p(10));

    return angles;
}
