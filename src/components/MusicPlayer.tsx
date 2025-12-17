import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Track {
    id: number;
    title: string;
    artist: string;
    url: string;
    duration: string;
    genre: 'meditation' | 'nature' | 'ambient' | 'lo-fi';
}

const TRACKS: Track[] = [
    // Meditation
    {
        id: 1,
        title: "Deep Meditation",
        artist: "Yoga Vibes",
        url: "https://cdn.pixabay.com/download/audio/2022/02/07/audio_18220158c5.mp3?filename=meditation-impulse-3000.mp3",
        duration: "3:00",
        genre: 'meditation'
    },
    {
        id: 2,
        title: "Inner Peace",
        artist: "Calm Studio",
        url: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_a69e475c27.mp3?filename=relaxing-mountains-rivers-streams-running-water-18178.mp3",
        duration: "2:30",
        genre: 'meditation'
    },
    // Nature
    {
        id: 3,
        title: "Morning Flow",
        artist: "Nature Sounds",
        url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=forest-lullaby-110624.mp3",
        duration: "2:18",
        genre: 'nature'
    },
    {
        id: 4,
        title: "Ocean Waves",
        artist: "Sea Sounds",
        url: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_8809116a96.mp3?filename=ocean-waves-112906.mp3",
        duration: "2:45",
        genre: 'nature'
    },
    {
        id: 5,
        title: "Rain Forest",
        artist: "Ambient Earth",
        url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c4b55c25ba.mp3?filename=rain-and-thunder-16705.mp3",
        duration: "3:20",
        genre: 'nature'
    },
    // Ambient
    {
        id: 6,
        title: "Calm River",
        artist: "Ambient",
        url: "https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8c8a73467.mp3?filename=spirit-blossom-15285.mp3",
        duration: "2:55",
        genre: 'ambient'
    },
    {
        id: 7,
        title: "Ethereal Dreams",
        artist: "Soundscape",
        url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=please-calm-my-mind-125566.mp3",
        duration: "3:10",
        genre: 'ambient'
    },
    // Lo-Fi
    {
        id: 8,
        title: "Yoga Chill",
        artist: "Lo-Fi Beats",
        url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_946c6979c9.mp3?filename=chill-abstract-intention-12099.mp3",
        duration: "2:40",
        genre: 'lo-fi'
    },
    {
        id: 9,
        title: "Focus Flow",
        artist: "Chill Hop",
        url: "https://cdn.pixabay.com/download/audio/2022/05/17/audio_69a61cd6d6.mp3?filename=lofi-study-112191.mp3",
        duration: "2:15",
        genre: 'lo-fi'
    },
];

const GENRE_ICONS: Record<string, string> = {
    meditation: '🧘',
    nature: '🌿',
    ambient: '✨',
    'lo-fi': '🎵',
};

const GENRE_COLORS: Record<string, string> = {
    meditation: 'from-purple-500 to-indigo-500',
    nature: 'from-emerald-500 to-green-500',
    ambient: 'from-blue-500 to-cyan-500',
    'lo-fi': 'from-pink-500 to-rose-500',
};

export function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isMinimized, setIsMinimized] = useState(true);
    const [volume, setVolume] = useState(0.5);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);

    const filteredTracks = selectedGenre
        ? TRACKS.filter(t => t.genre === selectedGenre)
        : TRACKS;

    const currentTrack = filteredTracks[currentTrackIndex % filteredTracks.length] || TRACKS[0];

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.play().catch(e => console.log("Audio play error:", e));
        } else {
            audio.pause();
        }
    }, [isPlaying, currentTrack]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        audio.addEventListener('timeupdate', updateProgress);
        return () => audio.removeEventListener('timeupdate', updateProgress);
    }, []);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const nextTrack = () => {
        if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * filteredTracks.length);
            setCurrentTrackIndex(randomIndex);
        } else {
            setCurrentTrackIndex((prev) => (prev + 1) % filteredTracks.length);
        }
        setIsPlaying(true);
    };

    const prevTrack = () => {
        setCurrentTrackIndex((prev) => (prev - 1 + filteredTracks.length) % filteredTracks.length);
        setIsPlaying(true);
    };

    const handleTrackEnd = () => {
        if (isRepeat) {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
        } else {
            nextTrack();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (audio && audio.duration) {
            audio.currentTime = (parseFloat(e.target.value) / 100) * audio.duration;
        }
    };

    return (
        <div className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${isMinimized ? 'w-14 h-14' : 'w-80'}`}>
            <motion.div
                layout
                className="bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Minimized View */}
                <AnimatePresence mode="wait">
                    {isMinimized ? (
                        <motion.button
                            key="minimized"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMinimized(false)}
                            className="w-full h-full flex items-center justify-center text-pink-400 hover:text-pink-300 hover:bg-white/5 transition-colors p-3"
                        >
                            <div className="relative">
                                <svg className={`w-8 h-8 ${isPlaying ? 'animate-spin-slow' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                                {isPlaying && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-pulse"></span>
                                )}
                            </div>
                        </motion.button>
                    ) : (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${GENRE_COLORS[currentTrack.genre]} flex items-center justify-center`}>
                                        {GENRE_ICONS[currentTrack.genre]}
                                    </span>
                                    Yoga Music
                                </h3>
                                <button
                                    onClick={() => setIsMinimized(true)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Genre Filter */}
                            <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
                                <button
                                    onClick={() => setSelectedGenre(null)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedGenre === null
                                            ? 'bg-pink-500 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    All
                                </button>
                                {Object.entries(GENRE_ICONS).map(([genre, icon]) => (
                                    <button
                                        key={genre}
                                        onClick={() => setSelectedGenre(genre)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${selectedGenre === genre
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-gray-800 text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {icon} {genre}
                                    </button>
                                ))}
                            </div>

                            {/* Track Info */}
                            <div className="mb-4">
                                <div className="text-white font-medium truncate">{currentTrack.title}</div>
                                <div className="text-sm text-gray-400 truncate">{currentTrack.artist}</div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progress}
                                    onChange={handleSeek}
                                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                                />
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <button
                                    onClick={() => setIsShuffle(!isShuffle)}
                                    className={`p-2 rounded-lg transition-colors ${isShuffle ? 'text-pink-400 bg-pink-500/20' : 'text-gray-400 hover:text-white'}`}
                                    title="Shuffle"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                                    </svg>
                                </button>

                                <button onClick={prevTrack} className="text-gray-400 hover:text-white transition-colors p-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                                    </svg>
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-500/30 transition-all hover:scale-105"
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

                                <button onClick={nextTrack} className="text-gray-400 hover:text-white transition-colors p-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => setIsRepeat(!isRepeat)}
                                    className={`p-2 rounded-lg transition-colors ${isRepeat ? 'text-pink-400 bg-pink-500/20' : 'text-gray-400 hover:text-white'}`}
                                    title="Repeat"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
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
                                    className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:rounded-full"
                                />
                                <span className="text-xs text-gray-400 w-8">{Math.round(volume * 100)}%</span>
                            </div>

                            {/* Track List Preview */}
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <p className="text-xs text-gray-500 mb-2">Up next</p>
                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                    {filteredTracks.slice(currentTrackIndex + 1, currentTrackIndex + 4).map((track) => (
                                        <div
                                            key={track.id}
                                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                                            onClick={() => {
                                                setCurrentTrackIndex(filteredTracks.findIndex(t => t.id === track.id));
                                                setIsPlaying(true);
                                            }}
                                        >
                                            <span className="text-sm">{GENRE_ICONS[track.genre]}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-white truncate">{track.title}</p>
                                                <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                                            </div>
                                            <span className="text-xs text-gray-500">{track.duration}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <audio
                    ref={audioRef}
                    src={currentTrack.url}
                    onEnded={handleTrackEnd}
                />
            </motion.div>
        </div>
    );
}
