import { useRef, useEffect } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import type { PoseReference } from '../utils/poseReferences';
import { getPoseAngles } from '../utils/angles';
import { drawSkeleton } from '../utils/drawing';

interface WebcamCanvasProps {
    stream: MediaStream | null;
    detector: poseDetection.PoseDetector | null;
    pose: PoseReference;
    isRunning: boolean;
    onFeedbackUpdate: (
        feedback: { [joint: string]: boolean },
        messages: string[],
        angles: { [joint: string]: number }
    ) => void;
    videoRef?: React.RefObject<HTMLVideoElement | null>;
    canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export function WebcamCanvas({
    stream,
    detector,
    pose,
    isRunning,
    onFeedbackUpdate,
    videoRef: externalVideoRef,
    canvasRef: externalCanvasRef
}: WebcamCanvasProps) {
    const internalVideoRef = useRef<HTMLVideoElement>(null);
    const internalCanvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    const lastFeedbackTime = useRef<number>(0);

    // Use external refs if provided, otherwise use internal refs
    const videoRef = externalVideoRef || internalVideoRef;
    const canvasRef = externalCanvasRef || internalCanvasRef;

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
    }, [stream, videoRef]);

    const runPoseDetection = async () => {
        if (
            !detector ||
            !videoRef.current ||
            !canvasRef.current ||
            videoRef.current.readyState !== 4
        ) {
            requestRef.current = requestAnimationFrame(runPoseDetection);
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Match canvas internal resolution to video source resolution
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        try {
            const poses = await detector.estimatePoses(video);

            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (poses.length > 0) {
                    const keypoints = poses[0].keypoints;

                    // Calculate angles
                    const angles = getPoseAngles(keypoints);

                    // Compare with reference
                    const feedback: { [joint: string]: boolean } = {};
                    const messages: string[] = [];

                    Object.entries(pose.joints).forEach(([jointName, range]) => {
                        const angle = angles[jointName];
                        if (angle !== undefined) {
                            if (angle < range.min) {
                                feedback[jointName] = false;
                                messages.push(pose.feedback[jointName].tooSmall);
                            } else if (angle > range.max) {
                                feedback[jointName] = false;
                                messages.push(pose.feedback[jointName].tooLarge);
                            } else {
                                feedback[jointName] = true;
                            }
                        }
                    });

                    // Draw
                    drawSkeleton(ctx, keypoints, feedback);

                    // Update feedback (throttle to avoid UI flickering, e.g., every 200ms)
                    const now = Date.now();
                    if (now - lastFeedbackTime.current > 200) {
                        onFeedbackUpdate(feedback, messages, angles);
                        lastFeedbackTime.current = now;
                    }
                }
            }
        } catch (e) {
            console.error("Pose detection error:", e);
        }

        if (isRunning) {
            requestRef.current = requestAnimationFrame(runPoseDetection);
        }
    };

    useEffect(() => {
        if (isRunning && detector && stream) {
            requestRef.current = requestAnimationFrame(runPoseDetection);
        } else {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            // Clear canvas when stopped
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isRunning, detector, stream, pose]);

    return (
        <div className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
            <video
                ref={videoRef}
                className="absolute w-full h-full object-contain transform -scale-x-100"
                playsInline
                muted
            />
            <canvas
                ref={canvasRef}
                className="absolute w-full h-full object-contain transform -scale-x-100"
            />
            {!stream && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                        <p className="text-xl font-semibold">Camera inactive</p>
                        <p className="text-sm">Press Start Session to begin</p>
                    </div>
                </div>
            )}
        </div>
    );
}
