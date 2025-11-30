import { useEffect, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

export function usePoseDetection() {
    const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const model = poseDetection.SupportedModels.MoveNet;
                const detectorConfig = {
                    modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
                };
                const detector = await poseDetection.createDetector(model, detectorConfig);
                setDetector(detector);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to load MoveNet:", err);
                setError("Failed to load AI model");
                setIsLoading(false);
            }
        };

        loadModel();
    }, []);

    return { detector, isLoading, error };
}
