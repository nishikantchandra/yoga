import { useState, useCallback } from 'react';

export function useWebcam() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            });
            setStream(stream);
            setIsReady(true);
            setError(null);
        } catch (err) {
            console.error("Error accessing webcam:", err);
            setError("Camera blocked or not found");
            setIsReady(false);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsReady(false);
        }
    }, [stream]);

    return { stream, error, isReady, startCamera, stopCamera };
}
