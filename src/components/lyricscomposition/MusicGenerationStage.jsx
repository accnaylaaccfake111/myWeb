// MusicGenerationStage.jsx
import React, { useRef, useEffect, useCallback, useState } from "react";
import { Music, Download, Play, Pause, Volume2, VolumeX } from "lucide-react";

const MusicGenerationStage = ({
    musicStatus,
    isGeneratingMusic,
    audioUrl,
    onError,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);

    const audioRef = useRef(null);

    // Audio effect handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioUrl) return;

        const updateProgress = () => {
            if (audio.duration && !isNaN(audio.duration)) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        const handleLoaded = () => {
            setProgress(0);
        };

        const handleError = (e) => {
            console.error("Audio loading error:", e);
            onError("Không thể tải audio. Vui lòng thử lại.");
            setIsPlaying(false);
        };

        const handlePlaying = () => {
            setIsPlaying(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        // Add event listeners
        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("loadedmetadata", handleLoaded);
        audio.addEventListener("error", handleError);
        audio.addEventListener("playing", handlePlaying);
        audio.addEventListener("pause", handlePause);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("loadedmetadata", handleLoaded);
            audio.removeEventListener("error", handleError);
            audio.removeEventListener("playing", handlePlaying);
            audio.removeEventListener("pause", handlePause);
        };
    }, [audioUrl, onError]);

    // Volume effect
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const togglePlayPause = useCallback(async () => {
        if (!audioRef.current || !audioUrl) {
            console.log("No audio available to play");
            return;
        }

        try {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                if (audioRef.current.readyState < 3) {
                    audioRef.current.load();
                    await new Promise((resolve, reject) => {
                        const onCanPlay = () => {
                            cleanup();
                            resolve();
                        };
                        const onError = (e) => {
                            cleanup();
                            reject(new Error("Không thể tải audio"));
                        };
                        const cleanup = () => {
                            audioRef.current.removeEventListener(
                                "canplay",
                                onCanPlay,
                            );
                            audioRef.current.removeEventListener(
                                "error",
                                onError,
                            );
                        };
                        audioRef.current.addEventListener("canplay", onCanPlay);
                        audioRef.current.addEventListener("error", onError);
                        setTimeout(() => {
                            cleanup();
                            reject(new Error("Timeout tải audio"));
                        }, 15000);
                    });
                }
                await audioRef.current.play();
            }
        } catch (error) {
            console.error("Error playing audio:", error);
            onError("Không thể phát audio: " + error.message);
            setIsPlaying(false);
        }
    }, [isPlaying, audioUrl, onError]);

    const handleVolumeChange = useCallback(
        (e) => {
            const newVolume = parseFloat(e.target.value);
            setVolume(newVolume);
            if (newVolume > 0 && isMuted) {
                setIsMuted(false);
            }
        },
        [isMuted],
    );

    const toggleMute = useCallback(() => {
        setIsMuted(!isMuted);
    }, [isMuted]);

    const handleProgressClick = useCallback(
        (e) => {
            if (!audioRef.current || !audioUrl) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;

            if (
                audioRef.current.duration &&
                !isNaN(audioRef.current.duration)
            ) {
                const newTime = percent * audioRef.current.duration;
                audioRef.current.currentTime = newTime;
                setProgress(percent * 100);
            }
        },
        [audioUrl],
    );

    // Render music status
    const renderMusicStatus = useCallback(() => {
        if (!isGeneratingMusic && !musicStatus) return null;

        return (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                    <Music className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">
                        Trạng thái nhạc:
                    </span>
                </div>
                <div className="mt-2 flex items-center">
                    {isGeneratingMusic && (
                        <svg
                            className="animate-spin h-4 w-4 text-blue-600 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    )}
                    <span className="text-blue-700 text-sm">
                        {musicStatus || "Đang xử lý..."}
                    </span>
                </div>
            </div>
        );
    }, [isGeneratingMusic, musicStatus]);

    // Audio Player Component
    const AudioPlayer = useCallback(() => {
        if (!audioUrl) return null;

        return (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        <Music className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">
                            Preview nhạc
                        </span>
                    </div>
                    <button
                        onClick={() => window.open(audioUrl, "_blank")}
                        className="flex items-center bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-1" />
                        Tải xuống
                    </button>
                </div>

                <div className="space-y-3">
                    <div
                        className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
                        onClick={handleProgressClick}
                    >
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={togglePlayPause}
                                disabled={!audioUrl}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                    !audioUrl
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-green-600 text-white hover:bg-green-700"
                                }`}
                            >
                                {isPlaying ? (
                                    <Pause className="w-5 h-5" />
                                ) : (
                                    <Play className="w-5 h-5" />
                                )}
                            </button>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={toggleMute}
                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    {isMuted || volume === 0 ? (
                                        <VolumeX className="w-5 h-5" />
                                    ) : (
                                        <Volume2 className="w-5 h-5" />
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="text-sm text-gray-600">
                            {audioRef.current &&
                            audioRef.current.duration &&
                            !isNaN(audioRef.current.duration)
                                ? `${Math.floor(
                                      audioRef.current.currentTime || 0,
                                  )}s / ${Math.floor(
                                      audioRef.current.duration,
                                  )}s`
                                : "0s / 0s"}
                        </div>
                    </div>
                </div>

                <audio
                    ref={audioRef}
                    key={audioUrl}
                    src={audioUrl}
                    preload="metadata"
                    crossOrigin="anonymous"
                />
            </div>
        );
    }, [
        audioUrl,
        progress,
        isPlaying,
        volume,
        isMuted,
        handleProgressClick,
        togglePlayPause,
        toggleMute,
        handleVolumeChange,
    ]);

    return (
        <>
            {renderMusicStatus()}
            <AudioPlayer />
        </>
    );
};

export default MusicGenerationStage;
