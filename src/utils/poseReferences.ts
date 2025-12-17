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
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: 'standing' | 'seated' | 'balance' | 'core' | 'inversion' | 'backbend';
    description: string;
    benefits: string[];
    joints: {
        [jointName: string]: JointAngleRange;
    };
    feedback: {
        [jointName: string]: PoseFeedback;
    };
};

export const POSES: { [key: string]: PoseReference } = {
    // === BEGINNER POSES ===

    Mountain: {
        name: "Mountain Pose",
        difficulty: 'beginner',
        category: 'standing',
        description: "The foundation of all standing poses. Stand tall with feet together, arms at sides.",
        benefits: ["Improves posture", "Strengthens thighs", "Increases awareness"],
        joints: {
            left_knee: { min: 170, max: 180 },
            right_knee: { min: 170, max: 180 },
            body_alignment: { min: 170, max: 180 },
        },
        feedback: {
            left_knee: { tooSmall: "Straighten your left leg", tooLarge: "Don't lock knee" },
            right_knee: { tooSmall: "Straighten your right leg", tooLarge: "Don't lock knee" },
            body_alignment: { tooSmall: "Stand up straight", tooLarge: "Align your spine" },
        }
    },

    Child: {
        name: "Child's Pose",
        difficulty: 'beginner',
        category: 'seated',
        description: "A restful pose that gently stretches the hips, thighs, and ankles.",
        benefits: ["Relieves stress", "Stretches spine", "Calms the mind"],
        joints: {
            left_knee: { min: 20, max: 50 },
            right_knee: { min: 20, max: 50 },
            hip_flexion: { min: 30, max: 60 },
        },
        feedback: {
            left_knee: { tooSmall: "Fold deeper", tooLarge: "Open knees wider" },
            right_knee: { tooSmall: "Fold deeper", tooLarge: "Open knees wider" },
            hip_flexion: { tooSmall: "Sit back more", tooLarge: "Relax forward" },
        }
    },

    Cobra: {
        name: "Cobra Pose",
        difficulty: 'beginner',
        category: 'backbend',
        description: "A gentle backbend that strengthens the spine and opens the chest.",
        benefits: ["Strengthens spine", "Opens chest", "Firms buttocks"],
        joints: {
            left_elbow: { min: 150, max: 175 },
            right_elbow: { min: 150, max: 175 },
            back_extension: { min: 20, max: 45 },
        },
        feedback: {
            left_elbow: { tooSmall: "Extend arms more", tooLarge: "Keep slight bend" },
            right_elbow: { tooSmall: "Extend arms more", tooLarge: "Keep slight bend" },
            back_extension: { tooSmall: "Lift chest higher", tooLarge: "Don't strain lower back" },
        }
    },

    Bridge: {
        name: "Bridge Pose",
        difficulty: 'beginner',
        category: 'backbend',
        description: "A gentle inversion that opens the chest and stretches the spine.",
        benefits: ["Stretches chest", "Strengthens legs", "Reduces anxiety"],
        joints: {
            left_knee: { min: 80, max: 100 },
            right_knee: { min: 80, max: 100 },
            hip_flexion: { min: 100, max: 140 },
        },
        feedback: {
            left_knee: { tooSmall: "Bend knees less", tooLarge: "Bend knees more" },
            right_knee: { tooSmall: "Bend knees less", tooLarge: "Bend knees more" },
            hip_flexion: { tooSmall: "Lift hips higher", tooLarge: "Lower hips slightly" },
        }
    },

    Downdog: {
        name: "Downdog",
        difficulty: 'beginner',
        category: 'standing',
        description: "An inverted V-shape that stretches and strengthens the whole body.",
        benefits: ["Energizes body", "Stretches hamstrings", "Strengthens arms"],
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

    // === INTERMEDIATE POSES ===

    Goddess: {
        name: "Goddess",
        difficulty: 'intermediate',
        category: 'standing',
        description: "A powerful standing squat that opens hips and strengthens legs.",
        benefits: ["Opens hips", "Strengthens legs", "Builds heat"],
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
        difficulty: 'intermediate',
        category: 'core',
        description: "A foundational core pose that builds strength and endurance.",
        benefits: ["Strengthens core", "Tones arms", "Improves posture"],
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
        difficulty: 'intermediate',
        category: 'balance',
        description: "A balancing pose that develops focus and concentration.",
        benefits: ["Improves balance", "Strengthens ankles", "Opens hips"],
        joints: {
            left_knee: { min: 160, max: 180 },
            right_knee: { min: 20, max: 60 },
        },
        feedback: {
            left_knee: { tooSmall: "Straighten standing leg", tooLarge: "Don't lock knee" },
            right_knee: { tooSmall: "Open hip more", tooLarge: "Place foot higher" },
        }
    },

    Warrior1: {
        name: "Warrior 1",
        difficulty: 'intermediate',
        category: 'standing',
        description: "A powerful standing pose that builds strength and focus.",
        benefits: ["Strengthens legs", "Opens chest", "Improves focus"],
        joints: {
            left_knee: { min: 85, max: 105 },
            right_knee: { min: 165, max: 180 },
            arms_up: { min: 160, max: 180 },
        },
        feedback: {
            left_knee: { tooSmall: "Don't overbend", tooLarge: "Bend front knee deeper" },
            right_knee: { tooSmall: "Straighten back leg", tooLarge: "Keep slight micro-bend" },
            arms_up: { tooSmall: "Reach arms higher", tooLarge: "Relax shoulders down" },
        }
    },

    Warrior2: {
        name: "Warrior 2",
        difficulty: 'intermediate',
        category: 'standing',
        description: "A strong standing pose with arms extended parallel to the ground.",
        benefits: ["Strengthens legs", "Opens hips", "Builds endurance"],
        joints: {
            left_knee: { min: 90, max: 110 },
            right_knee: { min: 160, max: 180 },
            arms_horizontal: { min: 160, max: 180 },
        },
        feedback: {
            left_knee: { tooSmall: "Don't overbend", tooLarge: "Bend front knee more" },
            right_knee: { tooSmall: "Straighten back leg", tooLarge: "Don't lock knee" },
            arms_horizontal: { tooSmall: "Raise arms", tooLarge: "Lower shoulders" },
        }
    },

    Triangle: {
        name: "Triangle Pose",
        difficulty: 'intermediate',
        category: 'standing',
        description: "A deep stretch for the sides of the body and hamstrings.",
        benefits: ["Stretches hamstrings", "Opens chest", "Strengthens legs"],
        joints: {
            left_knee: { min: 165, max: 180 },
            right_knee: { min: 165, max: 180 },
            side_bend: { min: 60, max: 90 },
        },
        feedback: {
            left_knee: { tooSmall: "Straighten front leg", tooLarge: "Keep micro-bend" },
            right_knee: { tooSmall: "Straighten back leg", tooLarge: "Don't lock knee" },
            side_bend: { tooSmall: "Reach down more", tooLarge: "Don't collapse chest" },
        }
    },

    Chair: {
        name: "Chair Pose",
        difficulty: 'intermediate',
        category: 'standing',
        description: "A powerful standing squat that builds heat and strength.",
        benefits: ["Strengthens thighs", "Tones core", "Builds endurance"],
        joints: {
            left_knee: { min: 90, max: 120 },
            right_knee: { min: 90, max: 120 },
            arms_up: { min: 160, max: 180 },
        },
        feedback: {
            left_knee: { tooSmall: "Don't over-bend", tooLarge: "Sit deeper" },
            right_knee: { tooSmall: "Don't over-bend", tooLarge: "Sit deeper" },
            arms_up: { tooSmall: "Reach arms up", tooLarge: "Relax shoulders" },
        }
    },

    // === ADVANCED POSES ===

    SidePlank: {
        name: "Side Plank",
        difficulty: 'advanced',
        category: 'core',
        description: "A challenging arm balance that strengthens the entire side body.",
        benefits: ["Strengthens arms", "Tones obliques", "Improves balance"],
        joints: {
            supporting_elbow: { min: 160, max: 180 },
            body_alignment: { min: 160, max: 180 },
            hip_alignment: { min: 160, max: 180 },
        },
        feedback: {
            supporting_elbow: { tooSmall: "Straighten bottom arm", tooLarge: "Don't lock elbow" },
            body_alignment: { tooSmall: "Lift hips higher", tooLarge: "Don't over-tilt" },
            hip_alignment: { tooSmall: "Stack hips", tooLarge: "Align body in line" },
        }
    },

    Crow: {
        name: "Crow Pose",
        difficulty: 'advanced',
        category: 'balance',
        description: "An arm balance that requires strength and concentration.",
        benefits: ["Strengthens arms", "Builds core strength", "Improves focus"],
        joints: {
            left_elbow: { min: 80, max: 110 },
            right_elbow: { min: 80, max: 110 },
            back_round: { min: 30, max: 60 },
        },
        feedback: {
            left_elbow: { tooSmall: "Bend elbows more", tooLarge: "Don't collapse" },
            right_elbow: { tooSmall: "Bend elbows more", tooLarge: "Don't collapse" },
            back_round: { tooSmall: "Round back more", tooLarge: "Don't over-round" },
        }
    },

    HalfMoon: {
        name: "Half Moon",
        difficulty: 'advanced',
        category: 'balance',
        description: "A challenging balance pose that opens the hips and stretches the body.",
        benefits: ["Improves balance", "Opens hips", "Strengthens legs"],
        joints: {
            standing_knee: { min: 160, max: 180 },
            lifted_leg: { min: 80, max: 100 },
            torso_rotation: { min: 80, max: 100 },
        },
        feedback: {
            standing_knee: { tooSmall: "Straighten standing leg", tooLarge: "Keep micro-bend" },
            lifted_leg: { tooSmall: "Lift leg higher", tooLarge: "Lower leg parallel" },
            torso_rotation: { tooSmall: "Open chest more", tooLarge: "Don't over-rotate" },
        }
    },

    Dancer: {
        name: "King Dancer",
        difficulty: 'advanced',
        category: 'balance',
        description: "A graceful standing backbend and balance pose.",
        benefits: ["Improves balance", "Opens chest", "Stretches shoulders"],
        joints: {
            standing_knee: { min: 160, max: 180 },
            back_leg_lift: { min: 60, max: 90 },
            arm_reach: { min: 140, max: 170 },
        },
        feedback: {
            standing_knee: { tooSmall: "Straighten standing leg", tooLarge: "Keep micro-bend" },
            back_leg_lift: { tooSmall: "Lift back leg higher", tooLarge: "Don't over-extend" },
            arm_reach: { tooSmall: "Reach forward more", tooLarge: "Keep arm aligned" },
        }
    },
};

// Helper functions
export const getPosesByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): string[] => {
    return Object.entries(POSES)
        .filter(([_, pose]) => pose.difficulty === difficulty)
        .map(([key]) => key);
};

export const getPosesByCategory = (category: string): string[] => {
    return Object.entries(POSES)
        .filter(([_, pose]) => pose.category === category)
        .map(([key]) => key);
};

export const getAllCategories = (): string[] => {
    const categories = new Set(Object.values(POSES).map(p => p.category));
    return Array.from(categories);
};

export const getAllDifficulties = (): string[] => ['beginner', 'intermediate', 'advanced'];
