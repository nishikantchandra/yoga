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
  const [smoothedScore, setSmoothedScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  const { stream, error: cameraError, startCamera, stopCamera } = useWebcam();
  const { detector, isLoading: modelLoading, error: modelError } = usePoseDetection();

  const lastSpokenMessage = useRef<string>("");
  const lastSpokenTime = useRef<number>(0);
  const sessionAnalyzer = useRef<SessionAnalyzer | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastCaptureScore = useRef<number>(0);
  const previousSmoothedScore = useRef<number>(0);
  const newBestTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStart = async () => {
    await startCamera();
    setIsRunning(true);
    setCurrentScore(0);
    setSmoothedScore(0);
    setBestScore(0);
    setIsNewBest(false);
    previousSmoothedScore.current = 0;
    sessionAnalyzer.current = new SessionAnalyzer(selectedPoseKey);
    lastCaptureScore.current = 0;
  };

  const handleStop = () => {
    stopCamera();
    setIsRunning(false);
    setFeedback({});
    setMessages([]);

    // Clear any pending timeout
    if (newBestTimeout.current) {
      clearTimeout(newBestTimeout.current);
      newBestTimeout.current = null;
    }

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

    // Calculate raw score
    const totalJoints = Object.keys(newFeedback).length;
    const alignedJoints = Object.values(newFeedback).filter(v => v === true).length;
    const rawScore = totalJoints > 0 ? Math.round((alignedJoints / totalJoints) * 100) : 0;
    setCurrentScore(rawScore);

    // Apply Exponential Moving Average for display smoothing (current score bar)
    const alpha = 0.3; // Smoothing factor for display
    const newSmoothedScore = Math.round(alpha * rawScore + (1 - alpha) * previousSmoothedScore.current);
    setSmoothedScore(newSmoothedScore);
    previousSmoothedScore.current = newSmoothedScore;

    // Update BEST score only when RAW score exceeds current best
    // Best score tracks the PEAK raw score achieved, not the smoothed average
    if (rawScore > bestScore) {
      setBestScore(rawScore);
      setIsNewBest(true);

      // Clear previous timeout
      if (newBestTimeout.current) {
        clearTimeout(newBestTimeout.current);
      }

      // Reset isNewBest after animation (show "NEW!" badge briefly)
      newBestTimeout.current = setTimeout(() => {
        setIsNewBest(false);
      }, 2000);
    }

    // Track score in session analyzer
    if (sessionAnalyzer.current) {
      sessionAnalyzer.current.addScore(rawScore);

      // Auto-capture when score > 80 and hasn't captured at this score level recently
      if (rawScore >= 80 && rawScore > lastCaptureScore.current + 5) {
        if (videoRef.current && canvasRef.current) {
          const imageData = captureCanvasImage(videoRef.current, canvasRef.current);

          if (imageData) {
            const capture: SessionCapture = {
              timestamp: Date.now(),
              pose: selectedPoseKey,
              score: rawScore,
              imageData,
              feedback: newFeedback,
              angles
            };

            sessionAnalyzer.current.addCapture(capture);
            lastCaptureScore.current = rawScore;

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
    <div className="min-h-screen app-bg text-white font-sans selection:bg-purple-500 selection:text-white">
      <div className="container mx-auto p-4 min-h-screen lg:h-screen flex flex-col gap-4">

        {/* Header */}
        <header className="flex items-center justify-between py-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg glow-purple">
              Y
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                YogaAI Assistant
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">AI-Powered Pose Correction</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isRunning && bestScore >= 80 && (
              <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-4 py-2 hidden sm:flex glass">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-sm text-emerald-400 font-medium">Best: {bestScore}%</span>
              </div>
            )}
            {isRunning && currentScore >= 80 && (
              <div className="flex items-center gap-2 bg-blue-900/30 border border-blue-700/50 rounded-xl px-4 py-2 animate-pulse hidden md:flex glass">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span className="text-sm text-blue-400 font-medium">Auto-Capture Active</span>
              </div>
            )}
            <div className="text-sm text-gray-500 hidden lg:flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Privacy Protected
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:min-h-0">

          {/* Left: Video Area (60%) */}
          <div className="lg:w-[60%] flex flex-col gap-4">
            <div className="flex-1 glass rounded-2xl relative overflow-hidden min-h-[50vh] lg:min-h-0 shadow-2xl">
              {modelLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900/90 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-blue-400 font-medium text-lg">Loading MoveNet Thunder...</p>
                    <p className="text-gray-500 text-sm">Preparing AI model for pose detection</p>
                  </div>
                </div>
              )}
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-red-900/80 backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-white font-bold text-xl">{cameraError}</p>
                    <p className="text-red-200 text-sm mt-2">Please allow camera access</p>
                  </div>
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
            <div className="glass p-4 rounded-xl">
              <PoseSelector
                selectedPose={selectedPoseKey}
                onSelect={setSelectedPoseKey}
                disabled={isRunning}
              />
            </div>

            {/* Reference Image */}
            <div className="h-56 glass rounded-xl flex items-center justify-center overflow-hidden relative group">
              <img
                src={`${import.meta.env.BASE_URL}poses/${selectedPoseKey.toLowerCase()}.jpg`}
                alt={currentPose.name}
                className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1f2937/white?text=' + currentPose.name;
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
                <p className="text-center text-sm font-medium text-white">Reference: {currentPose.name}</p>
              </div>
            </div>

            {/* Feedback Panel */}
            <div className="flex-1 min-h-0">
              <FeedbackPanel
                pose={currentPose}
                feedback={feedback}
                messages={messages}
                currentScore={smoothedScore}
                bestScore={bestScore}
                isNewBest={isNewBest}
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
          onContinue={(poseKey: string) => {
            setShowReport(false);
            setSelectedPoseKey(poseKey);
            // Small delay to ensure state updates before starting
            setTimeout(() => {
              handleStart();
            }, 100);
          }}
        />
      )}

      <MusicPlayer />
    </div>
  );
}
