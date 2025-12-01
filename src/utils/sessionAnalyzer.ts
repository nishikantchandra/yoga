export interface SessionCapture {
    timestamp: number;
    pose: string;
    score: number;
    imageData: string; // base64 image
    feedback: { [joint: string]: boolean };
    angles: { [joint: string]: number };
}

export interface SessionData {
    sessionId: string;
    startTime: number;
    endTime: number;
    pose: string;
    captures: SessionCapture[];
    scores: number[];
    avgScore: number;
    maxScore: number;
    minScore: number;
    totalFrames: number;
    perfectFrames: number; // score >= 90
    goodFrames: number; // score >= 80
}

export class SessionAnalyzer {
    private sessionData: SessionData;
    private scoreHistory: number[] = [];

    constructor(pose: string) {
        this.sessionData = {
            sessionId: `session_${Date.now()}`,
            startTime: Date.now(),
            endTime: 0,
            pose,
            captures: [],
            scores: [],
            avgScore: 0,
            maxScore: 0,
            minScore: 100,
            totalFrames: 0,
            perfectFrames: 0,
            goodFrames: 0
        };
    }

    addScore(score: number) {
        this.scoreHistory.push(score);
        this.sessionData.totalFrames++;

        if (score >= 90) this.sessionData.perfectFrames++;
        if (score >= 80) this.sessionData.goodFrames++;

        this.sessionData.maxScore = Math.max(this.sessionData.maxScore, score);
        this.sessionData.minScore = Math.min(this.sessionData.minScore, score);
    }

    addCapture(capture: SessionCapture) {
        this.sessionData.captures.push(capture);
    }

    endSession(): SessionData {
        this.sessionData.endTime = Date.now();
        this.sessionData.scores = this.scoreHistory;
        this.sessionData.avgScore = this.scoreHistory.length > 0
            ? Math.round(this.scoreHistory.reduce((a, b) => a + b, 0) / this.scoreHistory.length)
            : 0;

        return this.sessionData;
    }

    getSessionData(): SessionData {
        return this.sessionData;
    }
}

export function captureCanvasImage(
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement
): string {
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = videoElement.videoWidth;
    captureCanvas.height = videoElement.videoHeight;

    const ctx = captureCanvas.getContext('2d');
    if (!ctx) return '';

    // Draw video frame
    ctx.drawImage(videoElement, 0, 0);

    // Draw skeleton overlay from main canvas
    ctx.drawImage(canvasElement, 0, 0);

    // Convert to base64
    return captureCanvas.toDataURL('image/jpeg', 0.9);
}

export function downloadSessionReport(sessionData: SessionData) {
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], {
        type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yoga_session_${sessionData.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export function downloadCapture(capture: SessionCapture, index: number) {
    const a = document.createElement('a');
    a.href = capture.imageData;
    a.download = `capture_${capture.pose}_score${capture.score}_${index + 1}.jpg`;
    a.click();
}
