// LyricsDisplayStage.jsx
import { Copy, Pencil } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const LyricsDisplayStage = ({
    lyrics,
    isGenerating,
    onCopyLyrics,
    onRegenerate,
    onGenerateMusic,
    onGenerateSheetMusic,
    onUploadAudio,
    onRemoveUploadedAudio,
    isGeneratingMusic,
    isGeneratingSheet,
    isUploadingAudio,
    musicUrl,
    hasSheetMusic,
    uploadedAudio,
    musicStatusMessage,
    sheetStatusMessage,
    videoUrl,
    // Thêm props mới cho chỉnh sửa
    isEditing,
    editedLyrics,
    isSaving,
    onStartEditing,
    onCancelEditing,
    onSaveLyrics,
    onLyricsChange,
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

    const LyricsEditor = useCallback(({ lyrics, value, onChange }) => {
        return (
            <div className="bg-white rounded-lg p-5 mb-6 h-[32rem] overflow-y-auto border border-gray-300 shadow-sm">
                <textarea
                    value={value}
                    onChange={onChange}
                    className="w-full h-full text-gray-800 text-base leading-loose font-sans whitespace-pre-wrap font-normal resize-none border-none outline-none focus:ring-0"
                    placeholder="Nhập lời bài hát của bạn..."
                />
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
                        {!isEditing ? (
                            <>
                                {!isGeneratingSheet && (<button
                                    onClick={onStartEditing}
                                    className="text-sm bg-blue-600 text-white py-1.5 px-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold flex items-center gap-1"
                                >
                                    <span>
                                        <Pencil className="w-4 h-4" />
                                    </span>
                                    Chỉnh sửa
                                </button>)}
                                <button
                                    onClick={onCopyLyrics}
                                    className="text-sm bg-gray-600 text-white py-1.5 px-3 rounded-lg hover:bg-gray-700 transition-all duration-200 font-semibold flex items-center gap-1"
                                >
                                    <span>
                                        <Copy className="w-4 h-4" />
                                    </span>
                                    Sao chép
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={onSaveLyrics}
                                    disabled={isSaving}
                                    className="text-sm bg-green-600 text-white py-1.5 px-3 rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <>
                                            <svg
                                                className="animate-spin h-4 w-4 text-white"
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
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <span>💾</span>
                                            Lưu
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={onCancelEditing}
                                    disabled={isSaving}
                                    className="text-sm bg-red-600 text-white py-1.5 px-3 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>❌</span>
                                    Hủy
                                </button>
                            </>
                        )}
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
                    {/* Hiển thị editor hoặc display */}
                    {isEditing ? (
                        <LyricsEditor
                            lyrics={lyrics}
                            value={editedLyrics}
                            onChange={onLyricsChange}
                        />
                    ) : (
                        <LyricsDisplay lyrics={lyrics} />
                    )}

                    {/* Thông báo hướng dẫn khi đang chỉnh sửa */}
                    {isEditing && (
                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-700 flex items-center gap-2">
                                <span className="text-blue-500">💡</span>
                                Bạn đang chỉnh sửa lời bài hát. Sau khi hoàn
                                thành, nhấn "Lưu" để cập nhật.
                            </p>
                        </div>
                    )}

                    {/* Hiển thị thông báo trạng thái */}
                    {(musicStatusMessage || sheetStatusMessage) && (
                        <div className="mb-4 space-y-2">
                            {musicStatusMessage && (
                                <div
                                    className={`text-sm font-medium px-3 py-2 rounded-lg ${
                                        musicStatusMessage.includes(
                                            "thành công",
                                        ) ||
                                        musicStatusMessage.includes("tải lên")
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : musicStatusMessage.includes(
                                                  "thất bại",
                                              )
                                            ? "bg-red-50 text-red-700 border border-red-200"
                                            : "bg-blue-50 text-blue-700 border border-blue-200"
                                    }`}
                                >
                                    🎵 {musicStatusMessage}
                                </div>
                            )}
                            {sheetStatusMessage && (
                                <div
                                    className={`text-sm font-medium px-3 py-2 rounded-lg ${
                                        sheetStatusMessage.includes(
                                            "thành công",
                                        )
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : sheetStatusMessage.includes(
                                                  "thất bại",
                                              )
                                            ? "bg-red-50 text-red-700 border border-red-200"
                                            : "bg-blue-50 text-blue-700 border border-blue-200"
                                    }`}
                                >
                                    🎼 {sheetStatusMessage}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hiển thị thông tin file đã upload */}
                    {uploadedAudio && (
                        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-green-600 text-xl">🎵</div>
                                <div>
                                    <p className="font-medium text-green-800">
                                        {uploadedAudio.name}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        {(
                                            uploadedAudio.size /
                                            (1024 * 1024)
                                        ).toFixed(2)}{" "}
                                        MB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onRemoveUploadedAudio}
                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                                title="Xóa file"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Các nút chức năng - ẩn khi đang chỉnh sửa */}
                    {!isEditing && (
                        <>
                            <div className="flex gap-4">
                                {/* Nút tạo nhạc từ AI */}
                                <button
                                    onClick={onGenerateMusic}
                                    disabled={
                                        isGeneratingMusic || !!uploadedAudio
                                    }
                                    className={`flex-1 py-3 px-4 rounded-lg transition-colors font-semibold ${
                                        isGeneratingMusic || uploadedAudio
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
                                    ) : uploadedAudio ? (
                                        "Đã có nhạc"
                                    ) : (
                                        "Tạo nhạc từ lời"
                                    )}
                                </button>

                                {/* Nút tải file nhạc lên */}
                                <button
                                    onClick={onUploadAudio}
                                    disabled={
                                        isUploadingAudio ||
                                        !!musicUrl ||
                                        !!uploadedAudio
                                    }
                                    className={`flex-1 py-3 px-4 rounded-lg transition-colors font-semibold ${
                                        isUploadingAudio ||
                                        musicUrl ||
                                        uploadedAudio
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-teal-600 text-white hover:bg-teal-700"
                                    }`}
                                >
                                    {isUploadingAudio ? (
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
                                            Đang tải lên...
                                        </div>
                                    ) : musicUrl || uploadedAudio ? (
                                        "Đã có nhạc"
                                    ) : (
                                        "Tải nhạc lên"
                                    )}
                                </button>
                            </div>

                            {/* Nút tạo nốt nhạc - CHỈ HIỂN THỊ KHI ĐÃ CÓ MUSIC URL HOẶC UPLOADED AUDIO */}
                            {(musicUrl || uploadedAudio) && (
                                <button
                                    onClick={onGenerateSheetMusic}
                                    disabled={
                                        isGeneratingSheet || hasSheetMusic
                                    }
                                    className={`w-full mt-3 py-3 px-4 rounded-lg transition-colors font-semibold ${
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

                            {/* Nút ghép nhạc & hát */}
                            <button
                                onClick={handleContinueToKaraoke}
                                disabled={!musicUrl && !uploadedAudio}
                                className={`w-full mt-3 py-3 px-4 rounded-lg transition-colors font-semibold ${
                                    !musicUrl && !uploadedAudio
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-red-600 text-white hover:bg-red-700"
                                }`}
                            >
                                Ghép nhạc & Hát
                            </button>
                        </>
                    )}
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
