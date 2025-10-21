import { useState, useEffect, useRef } from "react";

const KaraokeDisplay = ({
    selectedProject,
    lyrics,
    currentWordIndex,
    isPlaying,
    isRecording,
    wordTimings,
    currentTimingIndex,
    comboCount,
    isMicrophoneAvailable,
    videoRef,
    videoSelect,
    CountdownOverlay,
}) => {
    const [particleEffects, setParticleEffects] = useState([]);
    const [backgroundEffects, setBackgroundEffects] = useState([]);
    const lyricsContainerRef = useRef(null);

    const lyricLines = lyrics
        ? lyrics.split("\n").filter((line) => line.trim() !== "")
        : [];
    const lyricWords = lyricLines.map((line) =>
        line.split(" ").filter((word) => word.trim() !== ""),
    );

    // Particle effects
    useEffect(() => {
        if (particleEffects.length === 0) return;

        const interval = setInterval(() => {
            setParticleEffects((prev) =>
                prev
                    .map((particle) => ({
                        ...particle,
                        x: particle.x + particle.vx,
                        y: particle.y + particle.vy,
                        vy: particle.vy + 0.2,
                        life: particle.life - 0.02,
                    }))
                    .filter((particle) => particle.life > 0),
            );
        }, 50);

        return () => clearInterval(interval);
    }, [particleEffects.length]);

    // Background effects
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setBackgroundEffects((prev) => {
                const newEffect = { id: Date.now(), scale: 1, opacity: 1 };
                return [...prev.slice(-3), newEffect];
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [isPlaying]);

    useEffect(() => {
        if (backgroundEffects.length === 0) return;

        const interval = setInterval(() => {
            setBackgroundEffects((prev) =>
                prev
                    .map((effect) => ({
                        ...effect,
                        scale: effect.scale + 0.1,
                        opacity: effect.opacity - 0.05,
                    }))
                    .filter((effect) => effect.opacity > 0),
            );
        }, 100);

        return () => clearInterval(interval);
    }, [backgroundEffects.length]);

    if (lyricLines.length === 0) {
        return (
            <div className="lg:w-2/3 bg-black bg-opacity-70 rounded-lg p-6 shadow-lg border border-gray-600 flex items-center justify-center min-h-[400px]">
                <p className="text-white text-lg">Chưa có lời bài hát</p>
            </div>
        );
    }

    const currentLine = currentWordIndex.line;
    const displayLines = [];
    const startLine = Math.max(0, currentLine - 1);
    const endLine = Math.min(lyricLines.length, currentLine + 2);

    for (let i = startLine; i < endLine; i++) {
        const type =
            i === currentLine
                ? "current"
                : i < currentLine
                ? "previous"
                : "next";
        displayLines.push({ line: i, text: lyricLines[i], type });
    }

    return (
        <div
            ref={lyricsContainerRef}
            className="relative lg:w-2/3 bg-black bg-opacity-80 rounded-lg p-6 shadow-lg border border-gray-600 flex flex-col justify-end min-h-[400px] relative overflow-hidden"
        >
            <BackgroundVideo
                selectedProject={selectedProject}
                videoRef={videoRef}
                videoSelect={videoSelect}
            />

            {backgroundEffects.map((effect) => (
                <BackgroundEffect key={effect.id} effect={effect} />
            ))}

            {particleEffects.map((particle) => (
                <Particle key={particle.id} particle={particle} />
            ))}

            <ComboCounter comboCount={comboCount} />

            <StatusHeader isPlaying={isPlaying} />

            <LyricsDisplay
                displayLines={displayLines}
                lyricWords={lyricWords}
                currentWordIndex={currentWordIndex}
                isPlaying={isPlaying}
            />

            <ProgressIndicator
                wordTimings={wordTimings}
                currentTimingIndex={currentTimingIndex}
            />

            <RecordingStatus
                isRecording={isRecording}
                isMicrophoneAvailable={isMicrophoneAvailable}
            />
            <CountdownOverlay />
        </div>
    );
};

const BackgroundVideo = ({ selectedProject, videoRef, videoSelect }) => {
    if (videoSelect) {
        return (
            <video
                ref={videoRef}
                src={videoSelect}
                className="absolute w-full h-full object-contain"
                autoPlay
                loop
                muted
            />
        );
    } else {
        return (
            <video
                ref={videoRef}
                src={"/videoKaraoke/7135449603513.mp4"}
                className="absolute w-full h-full object-contain"
                autoPlay
                loop
                muted
            />
        );
    }
};

const BackgroundEffect = ({ effect }) => (
    <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
            background: `radial-gradient(circle at 50% 50%, rgba(255, 107, 107, ${
                effect.opacity * 0.3
            }) 0%, transparent ${effect.scale * 20}%)`,
            transform: `scale(${effect.scale})`,
            transition: "all 0.1s ease-out",
        }}
    />
);

const Particle = ({ particle }) => (
    <div
        className="absolute w-2 h-2 rounded-full pointer-events-none"
        style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            opacity: particle.life,
            transform: `scale(${particle.life})`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
        }}
    />
);

const ComboCounter = ({ comboCount }) =>
    comboCount > 1 && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
            COMBO: {comboCount}
        </div>
    );

const StatusHeader = ({ isPlaying }) => (
    <div className="text-center text-lg font-semibold text-white mb-6 drop-shadow-sm z-10 relative">
        <span className="flex items-center justify-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
            </svg>
            {isPlaying ? "Đang hát..." : "Sẵn sàng"}
            {isPlaying && <AudioBars />}
        </span>
    </div>
);

const AudioBars = () => (
    <div className="ml-2 flex space-x-1">
        {[1, 2, 3].map((i) => (
            <div
                key={i}
                className="w-1 h-4 bg-red-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
            />
        ))}
    </div>
);

const LyricsDisplay = ({
    displayLines,
    lyricWords,
    currentWordIndex,
    isPlaying,
}) => (
    <div className="text-center font-sans text-2xl leading-relaxed space-y-4 z-10 relative">
        {displayLines.map(({ line, text, type }) => (
            <div
                key={`${line}-${type}`}
                className={`transition-all duration-500 ${
                    type === "previous"
                        ? "text-gray-500 text-xl transform translate-y-2"
                        : type === "current"
                        ? "text-white text-2xl font-semibold transform translate-y-0"
                        : "text-gray-400 text-xl transform -translate-y-2"
                }`}
            >
                {type === "current" ? (
                    <CurrentLine
                        words={lyricWords[line]}
                        currentWordIndex={currentWordIndex}
                        isPlaying={isPlaying}
                    />
                ) : (
                    <div className="opacity-70">{text}</div>
                )}
            </div>
        ))}
    </div>
);

const CurrentLine = ({ words, currentWordIndex, isPlaying }) => {
    return (
        <div className="flex justify-center flex-wrap">
            {words?.map((word, index) => {
                const isCurrentWord = word === currentWordIndex.word;
                const isPastWord = index < currentWordIndex.word;

                return (
                    <span
                        key={index}
                        className={`mx-1 transition-all duration-300 relative ${
                            isCurrentWord && isPlaying
                                ? "text-yellow-300 font-bold scale-110"
                                : isPastWord
                                ? "text-green-300"
                                : "text-white"
                        }`}
                        style={{
                            textShadow:
                                isCurrentWord && isPlaying
                                    ? "0 0 20px rgba(255, 230, 0, 0.8), 0 0 30px rgba(255, 230, 0, 0.4)"
                                    : isPastWord
                                    ? "0 0 10px rgba(72, 187, 120, 0.3)"
                                    : "none",
                            transition: "all 0.3s ease",
                        }}
                    >
                        {word}
                        {isCurrentWord && isPlaying && <WordHighlight />}
                    </span>
                );
            })}
        </div>
    );
};

const WordHighlight = () => (
    <div
        className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 animate-pulse rounded-full"
        style={{ boxShadow: "0 0 8px rgba(255, 230, 0, 0.6)" }}
    />
);

const ProgressIndicator = ({ wordTimings, currentTimingIndex }) =>
    wordTimings.length > 0 && (
        <div className="mt-6 z-10 relative">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>
                    Tiến độ: {currentTimingIndex + 1}/{wordTimings.length} từ
                </span>
                <span>
                    {Math.round(
                        ((currentTimingIndex + 1) / wordTimings.length) * 100,
                    )}
                    %
                </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${
                            ((currentTimingIndex + 1) / wordTimings.length) *
                            100
                        }%`,
                        boxShadow: "0 0 10px rgba(72, 187, 120, 0.5)",
                    }}
                />
            </div>
        </div>
    );

const RecordingStatus = ({ isRecording, isMicrophoneAvailable }) => (
    <>
        {isRecording && (
            <div className="mt-6 text-center z-10 relative">
                <div className="flex justify-center items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 text-sm font-semibold">
                        ● Đang thu âm - Microphone đang hoạt động
                    </span>
                </div>
                <VolumeIndicator />
                <p className="text-gray-400 text-xs mt-2">
                    Giọng hát của bạn đang được ghi âm...
                </p>
            </div>
        )}
        {!isMicrophoneAvailable && (
            <div className="mt-4 text-center z-10 relative">
                <p className="text-red-400 text-sm animate-pulse">
                    ⚠️ Microphone không khả dụng. Vui lòng cấp quyền truy cập.
                </p>
            </div>
        )}
    </>
);

const VolumeIndicator = () => (
    <div className="flex justify-center items-end space-x-1 h-8 mb-2">
        {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((height, i) => (
            <div
                key={i}
                className="w-1 bg-green-400 rounded-full animate-pulse"
                style={{
                    height: `${height * 3}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "0.8s",
                }}
            />
        ))}
    </div>
);

export default KaraokeDisplay;
