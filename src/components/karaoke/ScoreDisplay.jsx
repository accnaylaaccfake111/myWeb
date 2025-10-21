const getScoreLabel = (key) => {
    const labels = {
        lyricMatch: "Độ khớp lời",
        lyrichatch: "Độ khớp lời",
        intonation: "Ngữ điệu",
        fluency: "Độ trôi chảy",
        pronunciation: "Phát âm",
        overall: "Tổng quan",
    };
    return labels[key] || key;
};

export const VoiceAnalysisResults = ({ voiceAnalysis }) => {
    if (!voiceAnalysis) return null;

    const { scores, comments, timestamp } = voiceAnalysis;

    return (
        <div className="mt-6 bg-white bg-opacity-10 rounded-lg p-6">
            <h3 className="text-white text-xl font-semibold mb-4 text-center">
                Phân tích chi tiết giọng hát
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {Object.entries(scores).map(([key, value]) => (
                    <div
                        key={key}
                        className="bg-black bg-opacity-30 rounded-lg p-4 text-center"
                    >
                        <div className="text-2xl font-bold text-yellow-300 mb-1">
                            {value}%
                        </div>
                        <div className="text-gray-300 text-sm">
                            {getScoreLabel(key)}
                        </div>
                    </div>
                ))}
            </div>

            {/* <div className="bg-black bg-opacity-40 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">
                    📝 Nhận xét chi tiết:
                </h4>
                <div className="space-y-2">
                    {Object.entries(comments).map(([key, comment]) => (
                        <div key={key} className="text-gray-200 text-sm">
                            <span className="font-medium text-yellow-200">
                                {getScoreLabel(key)}:
                            </span>{" "}
                            {comment}
                        </div>
                    ))}
                </div>
            </div> */}

            <div className="text-gray-400 text-xs text-center mt-3">
                Phân tích lúc: {new Date(timestamp).toLocaleString("vi-VN")}
            </div>
        </div>
    );
};

const ScoreDisplay = ({
    score,
    isAnalyzing,
    voiceAnalysis,
    recordedAudio,
    onSave,
    onRetry,
    onExportVideo,
    isExporting,
}) => {
    return (
        <div className="text-center bg-black bg-opacity-70 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-white mb-4 drop-shadow-sm">
                Kết quả hát karaoke
            </h2>

            {isAnalyzing ? (
                <AnalysisLoading />
            ) : (
                <>
                    <ScoreHeader
                        score={score}
                        overall={voiceAnalysis?.comments?.overall}
                    />
                    <ScoreMetrics score={score} />
                    <VoiceAnalysisResults voiceAnalysis={voiceAnalysis} />
                    <ActionButtons
                        onRetry={onRetry}
                        onExportVideo={onExportVideo}
                        isExporting={isExporting}
                    />
                    <RecordingPlayback recordedAudio={recordedAudio} />
                </>
            )}
        </div>
    );
};

const AnalysisLoading = () => (
    <div className="text-white py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Đang phân tích giọng hát...</p>
        <p className="text-sm text-gray-300 mt-2">
            Vui lòng chờ trong giây lát
        </p>
    </div>
);

const ScoreHeader = ({ score, overall }) => (
    <>
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-yellow-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 animate-pulse shadow-lg">
            {score.total}
        </div>
        <div key={overall} className="text-gray-200 text-sm mb-4">
            {/* <span className="font-medium text-yellow-200">
                {getScoreLabel("overall")}:
            </span>{" "} */}
            {overall}
        </div>
        <p className="text-gray-300 text-lg mb-2">
            {score.total >= 90
                ? "🎉 Tuyệt vời! Bạn hát rất chuẩn!"
                : score.total >= 70
                ? "👍 Khá tốt! Bạn đã hát khá chuẩn nhịp!"
                : "💪 Cố gắng lần sau nhé!"}
        </p>

        {score.combo > 5 && (
            <p className="text-yellow-300 text-sm mb-4">
                🔥 Combo cao nhất: {score.combo} từ liên tiếp!
            </p>
        )}
    </>
);

const ScoreMetrics = ({ score }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
        {/* {[
            { label: "Chuẩn nhịp", value: score.rhythm },
            { label: "Giai điệu", value: score.melody },
            { label: "Phát âm", value: score.pronunciation },
        ].map((metric, index) => (
            <div
                key={index}
                className="text-center bg-white bg-opacity-10 rounded-lg p-4"
            >
                <p className="text-gray-300 text-sm mb-3 font-medium">
                    {metric.label}
                </p>
                <div className="w-full bg-gray-600 rounded-full h-3 mb-2">
                    <div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${metric.value}%` }}
                    />
                </div>
                <p className="text-white text-lg font-semibold">
                    {metric.value}%
                </p>
            </div>
        ))} */}
    </div>
);

const ActionButtons = ({ onRetry, onExportVideo, isExporting }) => (
    <div className="flex justify-center gap-4 flex-wrap mt-4">
        <button
            onClick={onRetry}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
        >
            Thử lại
        </button>
        {isExporting ? (
            <button
                disabled={isExporting}
                className="
    bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md 
    transition-all duration-200 
    hover:bg-blue-700 hover:shadow-lg transform hover:scale-105
    disabled:bg-blue-400 disabled:text-white disabled:cursor-not-allowed 
    disabled:shadow-none disabled:scale-100
  "
            >
                Đang Xuất Video
            </button>
        ) : (
            <button
                onClick={onExportVideo}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
            >
                Xuất Video
            </button>
        )}
    </div>
);

const RecordingPlayback = ({ recordedAudio }) =>
    recordedAudio && (
        <div className="mt-6">
            <p className="text-gray-300 mb-2">Bản thu âm của bạn:</p>
            <audio controls src={recordedAudio} className="mx-auto">
                Trình duyệt của bạn không hỗ trợ phát audio.
            </audio>
        </div>
    );

export default ScoreDisplay;
