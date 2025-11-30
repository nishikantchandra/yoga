export type JointAngleRange = {
    min: number;
    max: number;
};

export type PoseFeedback = {
    tooSmall: string;
    tooLarge: string;
};

export type PoseReference = {
    name: string;
    joints: {
        [jointName: string]: JointAngleRange;
    };
    feedback: {
        [jointName: string]: PoseFeedback;
    };
};

export const POSES: { [key: string]: PoseReference } = {
    Downdog: {
        name: "Downdog",
        joints: {
            left_elbow: { min: 160, max: 180 },
            right_elbow: { min: 160, max: 180 },
            left_knee: { min: 160, max: 180 },
            right_knee: { min: 160, max: 180 },
            hip_flexion: { min: 60, max: 100 },
        },
        feedback: {
            left_elbow: { tooSmall: "Straighten your left arm", tooLarge: "Don't hyperextend" },
            right_elbow: { tooSmall: "Straighten your right arm", tooLarge: "Don't hyperextend" },
            left_knee: { tooSmall: "Straighten your left leg", tooLarge: "Don't hyperextend" },
            right_knee: { tooSmall: "Straighten your right leg", tooLarge: "Don't hyperextend" },
            hip_flexion: { tooSmall: "Lift your hips higher", tooLarge: "Lower your hips slightly" },
        }
    },
    Goddess: {
        name: "Goddess",
        joints: {
            left_knee: { min: 80, max: 120 },
            right_knee: { min: 80, max: 120 },
            left_elbow: { min: 80, max: 110 },
            right_elbow: { min: 80, max: 110 },
        },
        feedback: {
            left_knee: { tooSmall: "Sink deeper", tooLarge: "Bend your knees more" },
            right_knee: { tooSmall: "Sink deeper", tooLarge: "Bend your knees more" },
            left_elbow: { tooSmall: "Open your arms", tooLarge: "Bend elbows to 90 degrees" },
            right_elbow: { tooSmall: "Open your arms", tooLarge: "Bend elbows to 90 degrees" },
        }
    },
    Plank: {
        name: "Plank",
        joints: {
            left_elbow: { min: 160, max: 180 },
            right_elbow: { min: 160, max: 180 },
            body_alignment: { min: 160, max: 180 },
        },
        feedback: {
            left_elbow: { tooSmall: "Straighten arms", tooLarge: "Don't lock elbows" },
            right_elbow: { tooSmall: "Straighten arms", tooLarge: "Don't lock elbows" },
            body_alignment: { tooSmall: "Raise your hips", tooLarge: "Lower your hips" },
        }
    },
    Tree: {
        name: "Tree",
        joints: {
            left_knee: { min: 160, max: 180 }, // Assuming left is standing for simplicity or need to detect
            right_knee: { min: 20, max: 60 },
        },
        feedback: {
            left_knee: { tooSmall: "Straighten standing leg", tooLarge: "Don't lock knee" },
            right_knee: { tooSmall: "Open hip more", tooLarge: "Place foot higher" },
        }
    },
    Warrior2: {
        name: "Warrior 2",
        joints: {
            left_knee: { min: 90, max: 110 }, // Front knee
            right_knee: { min: 160, max: 180 }, // Back knee
            arms_horizontal: { min: 160, max: 180 },
        },
        feedback: {
            left_knee: { tooSmall: "Don't overbend", tooLarge: "Bend front knee more" },
            right_knee: { tooSmall: "Straighten back leg", tooLarge: "Don't lock knee" },
            arms_horizontal: { tooSmall: "Raise arms", tooLarge: "Lower shoulders" },
        }
    }
};
