import { useState, useRef, useEffect } from 'react';

const TRACKS = [
    {
        id: 1,
        title: "Deep Meditation",
        artist: "Yoga Vibes",
        url: "https://cdn.pixabay.com/download/audio/2022/02/07/audio_18220158c5.mp3?filename=meditation-impulse-3000.mp3",
        duration: "3:00"
    },
    {
        id: 2,
        title: "Morning Flow",
        artist: "Nature Sounds",
        url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=forest-lullaby-110624.mp3",
        duration: "2:18"
    },
    {
        id: 3,
        title: "Calm River",
        artist: "Ambient",
        url: "https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8c8a73467.mp3?filename=spirit-blossom-15285.mp3",
        duration: "2:55"
    }
];

export function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isMinimized, setIsMinimized] = useState(true);
    const [volume, setVolume] = useState(0.5);

    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        if (isPlaying && audioRef.current) {
            audioRef.current.play().catch(e => console.log("Audio play error:", e));
        } else if (audioRef.current) {
            audioRef.current.pause();
        }
    }, [isPlaying, currentTrackIndex]);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const nextTrack = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
        setIsPlaying(true);
    };

    const prevTrack = () => {
        setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
        setIsPlaying(true);
    };

    const currentTrack = TRACKS[currentTrackIndex];

    return (
        <div className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${isMinimized ? 'w-16 h-16' : 'w-80'}`}>
            <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">

                {/* Minimized View */}
                {isMinimized && (
                    <button
                        onClick={() => setIsMinimized(false)}
                        className="w-full h-full flex items-center justify-center text-blue-400 hover:text-blue-300 hover:bg-white/5 transition-colors"
                    >
                        <svg className={`w-8 h-8 ${isPlaying ? 'animate-spin-slow' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </button>
                )}

                {/* Expanded View */}
                {!isMinimized && (
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <span className="text-blue-400">♫</span> Yoga Flow
                            </h3>
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className="text-white font-medium truncate">{currentTrack.title}</div>
                            <div className="text-sm text-gray-400 truncate">{currentTrack.artist}</div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <button onClick={prevTrack} className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                                </svg>
                            </button>

                            <button
                                onClick={togglePlay}
                                className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
                            >
                                {isPlaying ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            <button onClick={nextTrack} className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                                </svg>
                            </button>
                        </div>

                        {/* Volume */}
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
                            />
                        </div>
                    </div>
                )}

                <audio
                    ref={audioRef}
                    src={currentTrack.url}
                    onEnded={nextTrack}
                />
            </div>
        </div>
    );
}
