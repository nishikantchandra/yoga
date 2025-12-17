import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// New components
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { BreathingGuide } from './components/BreathingGuide';
import { DarkModeToggle } from './components/DarkModeToggle';
import { StreakCounter, updateStreak } from './components/StreakCounter';
import { AchievementToast, checkAchievements, type Achievement } from './components/AchievementToast';
import { PoseHoldTimer } from './components/PoseHoldTimer';
import { ProgressDashboard, saveSessionToStats } from './components/ProgressDashboard';

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

  // New state
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [posesAttempted, setPosesAttempted] = useState<string[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);

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

    // Track poses attempted
    if (!posesAttempted.includes(selectedPoseKey)) {
      setPosesAttempted(prev => [...prev, selectedPoseKey]);
    }
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

      // Update streak
      const streakData = updateStreak();

      // Check for achievements
      const newAchievement = checkAchievements({
        totalSessions: streakData.totalSessions,
        currentStreak: streakData.currentStreak,
        maxScore: bestScore,
        posesAttempted,
      });

      if (newAchievement) {
        setCurrentAchievement(newAchievement);
      }

      // Save session stats for progress dashboard
      const duration = Math.round((sessionData.endTime - sessionData.startTime) / 1000);
      saveSessionToStats({
        pose: selectedPoseKey,
        avgScore: sessionData.avgScore,
        duration,
        bestScore: sessionData.maxScore,
      });

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
    if (rawScore > bestScore) {
      setBestScore(rawScore);
      setIsNewBest(true);

      // Clear previous timeout
      if (newBestTimeout.current) {
        clearTimeout(newBestTimeout.current);
      }

      // Reset isNewBest after animation
      newBestTimeout.current = setTimeout(() => {
        setIsNewBest(false);
      }, 2000);
    }

    // Track score in session analyzer
    if (sessionAnalyzer.current) {
      sessionAnalyzer.current.addScore(rawScore);

      // Auto-capture when score > 80
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
      if (msg !== lastSpokenMessage.current || now - lastSpokenTime.current > 5000) {
        if ('speechSynthesis' in window) {
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

  const handleHoldMilestone = useCallback((seconds: number) => {
    if (seconds >= 60) {
      const achievement = checkAchievements({
        totalSessions: 0,
        currentStreak: 0,
        maxScore: bestScore,
        posesAttempted,
        holdDuration: seconds,
      });
      if (achievement) {
        setCurrentAchievement(achievement);
      }
    }
  }, [bestScore, posesAttempted]);

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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 font-sans selection:bg-pink-400 selection:text-white transition-colors duration-300">
      {/* Onboarding Tutorial */}
      <OnboardingTutorial onComplete={() => { }} />

      {/* Achievement Toast */}
      <AchievementToast
        achievement={currentAchievement}
        onClose={() => setCurrentAchievement(null)}
      />

      <div className="container mx-auto p-4 min-h-screen lg:h-screen flex flex-col gap-4">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between py-3 shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 via-rose-500 to-red-400 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-pink-300 dark:shadow-pink-900">
              Y
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-red-400">
                YogaAI Assistant
              </h1>
              <p className="text-xs text-pink-600 dark:text-pink-400 hidden sm:block">AI-Powered Pose Correction</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            <StreakCounter />

            {/* Progress Dashboard Button */}
            <button
              onClick={() => setShowDashboard(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-pink-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-gray-700 transition-all"
            >
              <span className="text-lg">📊</span>
              <span className="font-medium text-sm hidden sm:inline">Progress</span>
            </button>

            {/* Breathing Guide */}
            <BreathingGuide
              isActive={isBreathingActive}
              onToggle={() => setIsBreathingActive(!isBreathingActive)}
            />

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Status indicators */}
            {isRunning && bestScore >= 80 && (
              <div className="flex items-center gap-2 bg-emerald-500/20 dark:bg-emerald-900/30 border border-emerald-500/50 rounded-xl px-4 py-2 hidden sm:flex">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Best: {bestScore}%</span>
              </div>
            )}

            {isRunning && currentScore >= 80 && (
              <div className="flex items-center gap-2 bg-blue-500/20 dark:bg-blue-900/30 border border-blue-500/50 rounded-xl px-4 py-2 animate-pulse hidden md:flex">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Auto-Capture Active</span>
              </div>
            )}

            <div className="text-sm text-pink-600 dark:text-pink-400 hidden lg:flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Privacy Protected
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:min-h-0">

          {/* Left: Video Area (60%) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:w-[60%] flex flex-col gap-4"
          >
            <div className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-pink-200 dark:border-gray-700 rounded-2xl relative overflow-hidden min-h-[50vh] lg:min-h-0 shadow-xl shadow-pink-100 dark:shadow-none">
              {modelLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-pink-600 dark:text-pink-400 font-medium text-lg">Loading MoveNet Thunder...</p>
                    <p className="text-pink-400 dark:text-pink-500 text-sm">Preparing AI model for pose detection</p>
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
          </motion.div>

          {/* Right: Feedback & Reference (40%) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:w-[40%] flex flex-col gap-4"
          >

            {/* Pose Selector */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-pink-200 dark:border-gray-700 p-4 rounded-xl shadow-lg shadow-pink-100 dark:shadow-none">
              <PoseSelector
                selectedPose={selectedPoseKey}
                onSelect={setSelectedPoseKey}
                disabled={isRunning}
              />
            </div>

            {/* Reference Image */}
            <div className="h-56 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-pink-200 dark:border-gray-700 rounded-xl flex items-center justify-center overflow-hidden relative group shadow-lg shadow-pink-100 dark:shadow-none">
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

            {/* Pose Hold Timer - Only show when running */}
            <AnimatePresence>
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <PoseHoldTimer
                    isAligned={smoothedScore >= 80}
                    threshold={80}
                    onMilestone={handleHoldMilestone}
                  />
                </motion.div>
              )}
            </AnimatePresence>

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
          </motion.div>

        </div>
      </div>

      {/* Session Report Modal */}
      <AnimatePresence>
        {showReport && sessionAnalyzer.current && (
          <SessionReport
            sessionData={sessionAnalyzer.current.getSessionData()}
            onClose={() => setShowReport(false)}
            onDownload={handleDownloadReport}
            onContinue={(poseKey: string) => {
              setShowReport(false);
              setSelectedPoseKey(poseKey);
              setTimeout(() => {
                handleStart();
              }, 100);
            }}
          />
        )}
      </AnimatePresence>

      {/* Progress Dashboard */}
      <ProgressDashboard
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
      />

      <MusicPlayer />
    </div>
  );
}
