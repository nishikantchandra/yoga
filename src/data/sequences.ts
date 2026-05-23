/**
 * Class sequences for Studio Mode.
 * Each sequence is a chain of (pose, duration in seconds) used to drive a guided yoga class
 * on a big-screen display.
 */

export interface SequenceStep {
    poseKey: string;          // matches a key in POSES from poseReferences.ts
    durationSec: number;      // how long to hold this pose
    transitionSec?: number;   // optional rest/transition time after the pose
}

export interface ClassSequence {
    id: string;
    name: string;
    icon: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
    color: string;            // tailwind gradient classes
    steps: SequenceStep[];
}

export const SEQUENCES: ClassSequence[] = [
    {
        id: 'morning-flow',
        name: 'Morning Flow',
        icon: '🌅',
        description: 'Gentle sun salutation to start your day with energy and focus.',
        difficulty: 'beginner',
        color: 'from-amber-400 to-orange-500',
        steps: [
            { poseKey: 'Mountain', durationSec: 20, transitionSec: 5 },
            { poseKey: 'Downdog', durationSec: 30, transitionSec: 5 },
            { poseKey: 'Cobra', durationSec: 25, transitionSec: 5 },
            { poseKey: 'Child', durationSec: 30, transitionSec: 5 },
            { poseKey: 'Warrior1', durationSec: 30, transitionSec: 5 },
            { poseKey: 'Warrior2', durationSec: 30, transitionSec: 5 },
            { poseKey: 'Triangle', durationSec: 25, transitionSec: 5 },
            { poseKey: 'Mountain', durationSec: 20, transitionSec: 0 },
        ],
    },
    {
        id: 'power-yoga',
        name: 'Power Yoga',
        icon: '⚡',
        description: 'High-intensity flow building strength, balance and endurance.',
        difficulty: 'intermediate',
        color: 'from-red-500 to-rose-600',
        steps: [
            { poseKey: 'Mountain', durationSec: 15, transitionSec: 3 },
            { poseKey: 'Chair', durationSec: 30, transitionSec: 5 },
            { poseKey: 'Warrior1', durationSec: 30, transitionSec: 5 },
            { poseKey: 'Warrior2', durationSec: 30, transitionSec: 5 },
            { poseKey: 'Triangle', durationSec: 25, transitionSec: 5 },
            { poseKey: 'Plank', durationSec: 45, transitionSec: 10 },
            { poseKey: 'SidePlank', durationSec: 30, transitionSec: 10 },
            { poseKey: 'Goddess', durationSec: 30, transitionSec: 5 },
            { poseKey: 'Tree', durationSec: 30, transitionSec: 5 },
            { poseKey: 'Child', durationSec: 30, transitionSec: 0 },
        ],
    },
    {
        id: 'restorative',
        name: 'Restorative',
        icon: '🌙',
        description: 'Slow, calming poses to release tension and prepare for rest.',
        difficulty: 'beginner',
        color: 'from-indigo-500 to-purple-600',
        steps: [
            { poseKey: 'Child', durationSec: 60, transitionSec: 10 },
            { poseKey: 'Cobra', durationSec: 30, transitionSec: 10 },
            { poseKey: 'Downdog', durationSec: 45, transitionSec: 10 },
            { poseKey: 'Bridge', durationSec: 60, transitionSec: 10 },
            { poseKey: 'Child', durationSec: 90, transitionSec: 0 },
        ],
    },
    {
        id: 'balance-master',
        name: 'Balance Master',
        icon: '⚖️',
        description: 'Build focus, stability and core strength through balance poses.',
        difficulty: 'intermediate',
        color: 'from-emerald-500 to-teal-600',
        steps: [
            { poseKey: 'Mountain', durationSec: 20, transitionSec: 5 },
            { poseKey: 'Tree', durationSec: 45, transitionSec: 10 },
            { poseKey: 'Warrior1', durationSec: 30, transitionSec: 5 },
            { poseKey: 'HalfMoon', durationSec: 30, transitionSec: 10 },
            { poseKey: 'Dancer', durationSec: 30, transitionSec: 10 },
            { poseKey: 'Crow', durationSec: 20, transitionSec: 10 },
            { poseKey: 'Child', durationSec: 30, transitionSec: 0 },
        ],
    },
    {
        id: 'core-strength',
        name: 'Core Strength',
        icon: '💪',
        description: 'Targeted core and upper body work for serious strength.',
        difficulty: 'advanced',
        color: 'from-fuchsia-500 to-pink-600',
        steps: [
            { poseKey: 'Plank', durationSec: 45, transitionSec: 10 },
            { poseKey: 'SidePlank', durationSec: 30, transitionSec: 10 },
            { poseKey: 'Plank', durationSec: 45, transitionSec: 10 },
            { poseKey: 'Crow', durationSec: 20, transitionSec: 15 },
            { poseKey: 'Chair', durationSec: 45, transitionSec: 10 },
            { poseKey: 'Goddess', durationSec: 45, transitionSec: 10 },
            { poseKey: 'Child', durationSec: 30, transitionSec: 0 },
        ],
    },
    {
        id: 'quick-break',
        name: 'Quick Break',
        icon: '⏱️',
        description: '5-minute desk break — perfect for office wellness sessions.',
        difficulty: 'beginner',
        color: 'from-sky-400 to-blue-500',
        steps: [
            { poseKey: 'Mountain', durationSec: 20, transitionSec: 5 },
            { poseKey: 'Chair', durationSec: 30, transitionSec: 5 },
            { poseKey: 'Tree', durationSec: 30, transitionSec: 5 },
            { poseKey: 'Cobra', durationSec: 30, transitionSec: 5 },
            { poseKey: 'Child', durationSec: 30, transitionSec: 0 },
        ],
    },
];

export const getSequenceById = (id: string): ClassSequence | undefined =>
    SEQUENCES.find(s => s.id === id);

export const getTotalDuration = (sequence: ClassSequence): number =>
    sequence.steps.reduce((sum, s) => sum + s.durationSec + (s.transitionSec || 0), 0);
