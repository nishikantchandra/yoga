import { useState, useRef } from 'react';
import { WebcamCanvas } from './components/WebcamCanvas';
import { PoseSelector } from './components/PoseSelector';
import { FeedbackPanel } from './components/FeedbackPanel';
import { ControlsBar } from './components/ControlsBar';
import { SessionReport } from './components/SessionReport';
import { useWebcam } from './hooks/useWebcam';
import { usePoseDetection } from './hooks/usePoseDetection';
import { POSES } from './utils/poseReferences';
import { MusicPlayer } from './components/MusicPlayer';
import { SessionAnalyzer, captureCanvasImage, downloadSessionReport, type SessionCapture } from './utils/sessionAnalyzer';

export default function App() {
  const [selectedPoseKey, setSelectedPoseKey] = useState<string>('Downdog');
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState<{ [joint: string]: boolean }>({});
  const [messages, setMessages] = useState<string[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  const { stream, error: cameraError, startCamera, stopCamera } = useWebcam();
  const { detector, isLoading: modelLoading, error: modelError } = usePoseDetection();

  const lastSpokenMessage = useRef<string>("");
  const lastSpokenTime = useRef<number>(0);
  const sessionAnalyzer = useRef<SessionAnalyzer | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastCaptureScore = useRef<number>(0);

  const handleStart = async () => {
    await startCamera();
    setIsRunning(true);
    sessionAnalyzer.current = new SessionAnalyzer(selectedPoseKey);
    lastCaptureScore.current = 0;
  };

  const handleStop = () => {
    stopCamera();
    setIsRunning(false);
    setFeedback({});
    setMessages([]);

    // Generate and show session report
    if (sessionAnalyzer.current) {
      const sessionData = sessionAnalyzer.current.endSession();

      // Only show report if there was actual activity
      if (sessionData.totalFrames > 0) {
        setShowReport(true);
      }
    }
  };

  const handleFeedbackUpdate = (
    newFeedback: { [joint: string]: boolean },
    newMessages: string[],
    angles: { [joint: string]: number }
  ) => {
    setFeedback(newFeedback);
    setMessages(newMessages);

    // Calculate score
    const totalJoints = Object.keys(newFeedback).length;
    const alignedJoints = Object.values(newFeedback).filter(v => v === true).length;
    const score = totalJoints > 0 ? Math.round((alignedJoints / totalJoints) * 100) : 0;
    setCurrentScore(score);

    // Track score in session analyzer
    if (sessionAnalyzer.current) {
      sessionAnalyzer.current.addScore(score);

      // Auto-capture when score > 80 and hasn't captured at this score level recently
      if (score >= 80 && score > lastCaptureScore.current + 5) {
        if (videoRef.current && canvasRef.current) {
          const imageData = captureCanvasImage(videoRef.current, canvasRef.current);

          if (imageData) {
            const capture: SessionCapture = {
              timestamp: Date.now(),
              pose: selectedPoseKey,
              score,
              imageData,
              feedback: newFeedback,
              angles
            };

            sessionAnalyzer.current.addCapture(capture);
            lastCaptureScore.current = score;

            // Visual feedback for capture
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance("Great pose captured!");
              window.speechSynthesis.speak(utterance);
            }
          }
        }
      }
    }

    // Audio feedback for corrections
    if (newMessages.length > 0) {
      const now = Date.now();
      const msg = newMessages[0];
      // Speak if it's a new message or 5 seconds have passed since last speech
      if (msg !== lastSpokenMessage.current || now - lastSpokenTime.current > 5000) {
        if ('speechSynthesis' in window) {
          // Cancel previous
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(msg);
          window.speechSynthesis.speak(utterance);
        }
        lastSpokenMessage.current = msg;
        lastSpokenTime.current = now;
      }
    }
  };

  const handleDownloadReport = () => {
    if (sessionAnalyzer.current) {
      const sessionData = sessionAnalyzer.current.getSessionData();
      downloadSessionReport(sessionData);
    }
  };

  const currentPose = POSES[selectedPoseKey];
  const statusText = modelLoading
    ? "Loading AI Model..."
    : modelError
      ? "Model Error"
      : cameraError
        ? "Camera Error"
        : isRunning
          ? "Detecting..."
          : "Ready";

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-blue-500 selection:text-white">
      <div className="container mx-auto p-4 h-screen flex flex-col gap-4">

        {/* Header */}
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">
              Y
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              YogaAI Assistant
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isRunning && currentScore >= 80 && (
              <div className="flex items-center gap-2 bg-green-900/30 border border-green-700 rounded-lg px-3 py-1 animate-pulse">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-sm text-green-400 font-medium">Auto-Capture Active</span>
              </div>
            )}
            <div className="text-sm text-gray-400">
              Client-side Privacy • No Video Uploaded
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">

          {/* Left: Video Area (60%) */}
          <div className="lg:w-[60%] flex flex-col gap-4">
            <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-800 relative overflow-hidden">
              {modelLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900/80">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-blue-400 font-medium">Loading MoveNet Thunder...</p>
                  </div>
                </div>
              )}
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-red-900/80">
                  <p className="text-white font-bold">{cameraError}</p>
                </div>
              )}
              <WebcamCanvas
                stream={stream}
                detector={detector}
                pose={currentPose}
                isRunning={isRunning}
                onFeedbackUpdate={handleFeedbackUpdate}
                videoRef={videoRef}
                canvasRef={canvasRef}
              />
            </div>

            <ControlsBar
              isRunning={isRunning}
              onStart={handleStart}
              onStop={handleStop}
              status={statusText}
              canStart={!modelLoading && !modelError}
            />
          </div>

          {/* Right: Feedback & Reference (40%) */}
          <div className="lg:w-[40%] flex flex-col gap-4">

            {/* Pose Selector */}
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
              <PoseSelector
                selectedPose={selectedPoseKey}
                onSelect={setSelectedPoseKey}
                disabled={isRunning}
              />
            </div>

            {/* Reference Image */}
            <div className="h-64 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center overflow-hidden relative group">
              <img
                src={`${import.meta.env.BASE_URL}poses/${selectedPoseKey.toLowerCase()}.jpg`}
                alt={currentPose.name}
                className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1f2937/white?text=' + currentPose.name;
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-center text-sm font-medium">Reference: {currentPose.name}</p>
              </div>
            </div>

            {/* Feedback Panel */}
            <div className="flex-1 min-h-0">
              <FeedbackPanel
                pose={currentPose}
                feedback={feedback}
                messages={messages}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Session Report Modal */}
      {showReport && sessionAnalyzer.current && (
        <SessionReport
          sessionData={sessionAnalyzer.current.getSessionData()}
          onClose={() => setShowReport(false)}
          onDownload={handleDownloadReport}
        />
      )}

      <MusicPlayer />
    </div>
  );
}
