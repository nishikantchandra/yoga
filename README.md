# Yoga Pose Correction Assistant 🧘‍♀️

A production-ready, browser-based AI yoga pose correction assistant built with React, TypeScript, and TensorFlow.js.

## Features

- **Real-time Pose Detection**: Uses MoveNet Thunder for accurate pose estimation at ~15 FPS
- **Visual Feedback**: Color-coded skeleton overlay (green = aligned, red = needs correction)
- **Audio Guidance**: Optional voice feedback for corrections using Web Speech API
- **Privacy-Focused**: All processing happens client-side - no video uploads
- **5 Yoga Poses**: Downdog, Goddess, Plank, Tree, Warrior 2

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **AI Model**: TensorFlow.js with MoveNet Thunder
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A webcam
- Modern browser with WebGL support

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/yoga-pose-assistant.git
cd yoga-pose-assistant

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Building for Production

```bash
npm run build
```

### Deploying to GitHub Pages

```bash
npm run deploy
```

## Usage

1. Allow camera permissions when prompted
2. Select a target pose from the dropdown
3. Click "Start Session"
4. Follow the real-time feedback to correct your pose
5. Click "Stop" to end the session

## Project Structure

```
src/
├── components/       # React components
│   ├── WebcamCanvas.tsx
│   ├── FeedbackPanel.tsx
│   ├── PoseSelector.tsx
│   └── ControlsBar.tsx
├── hooks/           # Custom React hooks
│   ├── useWebcam.ts
│   └── usePoseDetection.ts
├── utils/           # Utility functions
│   ├── angles.ts
│   ├── poseReferences.ts
│   └── drawing.ts
└── App.tsx          # Main application
```

## How It Works

1. **Pose Detection**: MoveNet Thunder detects 17 keypoints on your body
2. **Angle Calculation**: Computes joint angles using vector mathematics
3. **Comparison**: Compares your angles against reference ranges for the selected pose
4. **Feedback**: Provides visual (colored joints) and audio (speech) corrections

## License

MIT

## Acknowledgments

- TensorFlow.js team for MoveNet
- Yoga pose reference data based on standard yoga practices
