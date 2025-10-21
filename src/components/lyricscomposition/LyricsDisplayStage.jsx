// LyricsDisplayStage.jsx
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const LyricsDisplayStage = ({
    lyrics,
    isGenerating,
    onCopyLyrics,
    onRegenerate,
    onGenerateMusic,
    onGenerateSheetMusic, // Thêm prop mới
    isGeneratingMusic,
    isGeneratingSheet, // Thêm prop mới
    musicUrl,
    hasSheetMusic, // Thêm prop mới
    videoUrl
}) => {
    const navigate = useNavigate();

    const handleContinueToKaraoke = useCallback(() => {
        navigate("/karaoke", { state: { lyrics, musicUrl, video: videoUrl } });
    }, [navigate, lyrics, musicUrl, videoUrl]);

    const LyricsDisplay = useCallback(({ lyrics }) => {
        if (!lyrics) return null;

        return (
            <div className="bg-white rounded-lg p-5 mb-6 h-[32rem] overflow-y-auto border border-gray-300 shadow-sm">
                <pre className="text-gray-800 text-base leading-loose font-sans whitespace-pre-wrap font-normal">
                    {lyrics}
                </pre>
            </div>
        );
    }, []);

    return (
        <div className="w-full flex flex-col bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Lời bài hát
                </h2>
                {lyrics && !isGenerating && (
                    <div className="flex gap-2">
                        <button
                            onClick={onCopyLyrics}
                            className="text-sm bg-blue-600 text-white py-1.5 px-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
                        >
                            Sao chép
                        </button>
                        <button
                            onClick={onRegenerate}
                            className="text-sm bg-red-600 text-white py-1.5 px-3 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold"
                        >
                            Tạo lại
                        </button>
                    </div>
                )}
            </div>

            {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <svg
                        className="animate-spin h-8 w-8 text-red-500 mb-4"
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
                    <p className="text-gray-600 text-center">
                        AI đang sáng tác lời bài hát...
                        <br />
                        <span className="text-sm text-gray-500">
                            Vui lòng chờ trong giây lát
                        </span>
                    </p>
                </div>
            ) : lyrics ? (
                <div className="flex-1 flex flex-col">
                    <LyricsDisplay lyrics={lyrics} />

                    <div className="flex gap-4">
                        {/* ĐÃ XÓA NÚT LƯU DỰ ÁN */}

                        <button
                            onClick={onGenerateMusic}
                            disabled={isGeneratingMusic}
                            className={`flex-1 py-3 px-4 rounded-lg transition-colors font-semibold ${
                                isGeneratingMusic
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                        >
                            {isGeneratingMusic ? (
                                <div className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin mr-2 h-4 w-4 text-white"
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
                                    Đang tạo nhạc...
                                </div>
                            ) : (
                                "Tạo nhạc từ lời"
                            )}
                        </button>

                        {/* THÊM NÚT TẠO NỐT NHẠC - CHỈ HIỂN THỊ KHI ĐÃ CÓ MUSIC URL */}
                        {musicUrl && (
                            <button
                                onClick={onGenerateSheetMusic}
                                disabled={isGeneratingSheet || hasSheetMusic}
                                className={`flex-1 py-3 px-4 rounded-lg transition-colors font-semibold ${
                                    isGeneratingSheet || hasSheetMusic
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-purple-600 text-white hover:bg-purple-700"
                                }`}
                            >
                                {isGeneratingSheet ? (
                                    <div className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin mr-2 h-4 w-4 text-white"
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
                                        Đang tạo nốt...
                                    </div>
                                ) : hasSheetMusic ? (
                                    "Đã tạo nốt nhạc"
                                ) : (
                                    "Tạo nốt nhạc"
                                )}
                            </button>
                        )}

                        <button
                            onClick={handleContinueToKaraoke}
                            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                        >
                            Ghép nhạc & Hát
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6 border border-dashed border-gray-300 rounded-lg bg-white shadow-sm">
                    <div className="text-4xl mb-4 text-gray-400">🎵</div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Lời bài hát sẽ xuất hiện ở đây
                    </h3>
                    <p className="text-gray-600 text-sm">
                        Chọn chủ đề và nhấn "Sáng tác lời bài hát"
                    </p>
                </div>
            )}
        </div>
    );
};

export default LyricsDisplayStage;
