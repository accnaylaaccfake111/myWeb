import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import dance3DImage from "../assets/img/3ddance.png";
import SkeletonViewer from "../components/view3d/SkeletonViewer";
import {
  ArrowLeft,
  Upload,
  Check,
  RefreshCw,
  Zap,
  Loader2,
} from "lucide-react";
import { storage } from "../utils/storage";

const DanceSimulation = ({ isLoggedIn }) => {
  const [step, setStep] = useState(isLoggedIn ? 0 : -1);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  const tempPoseData = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      setStep(-1);
    } else {
      setStep(0);
    }
  }, [isLoggedIn]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setStep(2);
      setError(null);
    } else {
      setError("Vui lòng chọn file video hợp lệ (MP4, AVI, WebM).");
    }
  };

  // === [CORE FIX] LOGIC XỬ LÝ LOG TEXT ĐỂ LẤY TIẾN ĐỘ ===
  const processEvent = useCallback(async (rawLine) => {
    if (!rawLine) return;

    // 1. Làm sạch dữ liệu đầu vào
    let content = rawLine.trim();

    // Loại bỏ tiền tố "data:" hoặc "log" từ Server Java/Python
    if (content.startsWith("data:")) content = content.slice(5).trim();
    if (content.startsWith("log")) content = content.slice(3).trim(); // Fix thêm trường hợp log dính chữ "log"

    if (content === "" || content === "ping") return;

    // --- CASE A: XỬ LÝ TEXT LOG (Lấy tiến độ từ log text) ---
    // Ví dụ log: "✅ Progress: 50/433 frames (11.5%) | Speed: 36.6 FPS"
    if (content.includes("Progress:") && content.includes("%")) {
      try {
        // Regex để tìm số trong ngoặc đơn và trước dấu %: (11.5%)
        const match = content.match(/\((\d+(\.\d+)?)%\)/);
        if (match && match[1]) {
          const percent = parseFloat(match[1]);
          setProcessingProgress(percent);

          // Lấy thông tin ngắn gọn để hiển thị (bỏ phần Speed phía sau)
          const shortMsg = content.split("|")[0].trim();
          setProgressMessage(shortMsg);
        }
      } catch (e) {
        console.warn("Regex parsing error:", e);
      }
      // Text log thì không cần parse JSON nữa
      return;
    }

    // --- CASE B: XỬ LÝ JSON (Dữ liệu kết quả) ---
    if (content.startsWith("{") || content.startsWith("[")) {
      try {
        const data = JSON.parse(content);
        console.log("🔥 Chunk JSON:", data);

        // Gom dữ liệu 3D
        if (data.poses_3d) {
          console.log("✅ Đã nhận được dữ liệu 3D");
          tempPoseData.current = data;
          setPoseData(data);
        }

        if (data.error) {
          setError(data.error);
          setIsProcessing(false);
          return;
        }

        // Kiểm tra hoàn thành
        let isCompleted = data.type === "completed" || data.status === "completed" || data.type === "result";
        if (data.poses_3d) isCompleted = true;

        if (isCompleted) {
          checkCompletionAndFinish();
        }
      } catch (e) {
        // Ignored
      }
    }
  }, []);

  const checkCompletionAndFinish = () => {
    if (tempPoseData.current) {
      console.log("🏁 Hoàn tất mô phỏng! Chuyển trang.");
      setIsProcessing(false);
      setStep(3);
    } else {
      setIsProcessing(false);
    }
  };

  const processStreamResponse = useCallback(
    async (response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            if (buffer.trim()) await processEvent(buffer);
            checkCompletionAndFinish();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            await processEvent(line);
          }
        }
      } catch (err) {
        console.error("Stream error:", err);
        setError("Mất kết nối tới máy chủ.");
        setIsProcessing(false);
      }
    },
    [processEvent]
  );

  const handleProcessVideo = async () => {
    setIsProcessing(true);
    setPoseData(null);
    tempPoseData.current = null;
    setError(null);
    setProcessingProgress(0);
    setProgressMessage("Đang khởi tạo Engine AI...");

    if (!videoFile) {
      setError("Không có video để xử lý.");
      setIsProcessing(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", videoFile);

    const user = storage.getUser();
    formData.append("user_id", user?.id || "");
    formData.append("title", user?.username || "Guest");

    const apiUrl = process.env.REACT_APP_3D_API || "http://localhost:8080";

    try {
      const response = await fetch(
        `${apiUrl}/api/video-3d/process-single-video-stream`,
        {
          method: "POST",
          headers: {
            Accept: "text/event-stream",
            "ngrok-skip-browser-warning": "true",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await processStreamResponse(response);
    } catch (error) {
      console.error("Error processing video:", error);
      setError("Có lỗi xảy ra khi kết nối Server (8080).");
      setIsProcessing(false);
    }
  };

  const handleReUpload = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setPoseData(null);
    tempPoseData.current = null;
    setStep(0);
  };

  const handleBackToDancing = () => {
    navigate("/dancing");
  };

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  if (step === -1) {
    return (
      <div className="flex items-center justify-center bg-gray-50 px-12 py-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 w-full max-w-md">
          <div className="text-5xl mb-6 text-red-700 animate-bounce">💃</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Vui lòng đăng nhập
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Bạn cần đăng nhập để truy cập chức năng mô phỏng điệu múa
          </p>
          <Link
            to="/login"
            state={{ from: "/dancing-simulation" }}
            className="block bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 text-center"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 pt-2 pb-6 bg-gray-50">
      <div className="mb-4">
        <button
          onClick={handleBackToDancing}
          className="text-gray-800 py-2 px-4 rounded-lg transition-all duration-200 font-semibold transform active:scale-95 inline-flex items-center hover:underline underline-offset-2"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay về trang điệu múa
        </button>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-red-700 mb-6 text-center animate-pulse">
        Mô Phỏng Điệu Múa 3D
      </h1>

      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
        {step === 0 && (
          <div className="text-center">
            <div className="grid md:grid-cols-2 gap-6 items-center justify-center">
              <div className="w-full">
                <div className="p-4">
                  <div className="w-full max-w-md mx-auto aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={dance3DImage}
                      alt="Mô phỏng điệu múa 3D"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="text-center w-full">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-red-700" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
                  Tải video múa lên
                </h2>
                {error && <p className="text-red-700 mb-4 text-sm">{error}</p>}
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-md">
                    <label className="cursor-pointer bg-red-700 text-white py-4 px-8 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center text-lg">
                      <Upload className="h-6 w-6 mr-2" />
                      Chọn video
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="text-sm text-gray-600 mt-4">
                      Định dạng hỗ trợ: MP4, AVI, WebM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && !isProcessing && (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 inline-flex items-center animate-pulse">
              Tải video thành công
              <Check className="h-6 w-6 ml-2 text-green-600" />
            </h2>
            <div className="bg-gray-100 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <div className="w-full aspect-video bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                {videoPreview ? (
                  <video
                    src={videoPreview}
                    className="w-full h-full object-contain"
                    controls
                  />
                ) : (
                  <span className="text-gray-600">
                    Không có video để xem trước
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Đã tải: {videoFile?.name}
              </p>
              {error && <p className="text-red-700 mt-2 text-sm">{error}</p>}
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setStep(0)}
                className="bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 w-full sm:w-auto inline-flex items-center"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Quay lại
              </button>
              <label className="cursor-pointer bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 w-full sm:w-auto inline-flex items-center">
                <RefreshCw className="h-5 w-5 mr-2" />
                Tải lại video
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
              <button
                onClick={handleProcessVideo}
                className="bg-red-700 text-white py-3 px-6 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 w-full sm:w-auto inline-flex items-center"
              >
                <Zap className="h-5 w-5 mr-2" />
                Bắt đầu mô phỏng
              </button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-red-700 animate-spin" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
              Đang tạo mô phỏng 3D
            </h2>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-1/2 bg-gray-100 rounded-lg p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                  Video gốc
                </h3>
                <div className="w-full aspect-video bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {videoPreview ? (
                    <video
                      src={videoPreview}
                      className="w-full h-full object-contain"
                      controls
                    />
                  ) : (
                    <span className="text-gray-600">Không có video gốc</span>
                  )}
                </div>
              </div>
              <div className="w-full lg:w-1/2 bg-gray-100 rounded-lg p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                  Mô hình 3D
                </h3>
                <div className="w-full aspect-video bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {poseData ? (
                    <SkeletonViewer
                      source="/models/aobabamerge.fbx"
                      JsonPose={poseData}
                      modelScale={0.01}
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-2">
                        <Loader2 className="h-6 w-6 text-red-700 animate-spin" />
                      </div>

                      <p className="text-gray-600 mb-2">
                        Tiến độ: {processingProgress}%
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        {progressMessage}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                        <div
                          className="bg-red-700 h-4 rounded-full transition-all duration-300"
                          style={{
                            width: `${processingProgress}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Đang xử lý từng khung hình...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && !isProcessing && (
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 inline-flex items-center animate-pulse">
              Mô phỏng hoàn thành
              <Check className="h-6 w-6 ml-2 text-green-600" />
            </h2>

            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              <div className="w-full lg:w-1/2 bg-gray-100 rounded-lg p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                  Video gốc
                </h3>
                <div className="w-full aspect-video bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {videoPreview ? (
                    <video
                      src={videoPreview}
                      className="w-full h-full object-contain"
                      controls
                    />
                  ) : (
                    <span className="text-gray-600">Không có video gốc</span>
                  )}
                </div>
              </div>
              <div className="w-full lg:w-1/2 bg-gray-100 rounded-lg p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                  Mô hình 3D
                </h3>
                <div className="w-full aspect-video bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {poseData ? (
                    <SkeletonViewer
                      source="/models/aobabamerge.fbx"
                      JsonPose={poseData}
                      modelScale={0.01}
                    />
                  ) : (
                    <span className="text-gray-600">Không có dữ liệu 3D</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-2">
                Mô phỏng thành công!
              </h3>
              <p className="text-green-700">
                Điệu múa của bạn đã được chuyển đổi thành công sang mô hình 3D.
                Bạn có thể xem mô phỏng và lưu kết quả.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleReUpload}
                className="bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 w-full sm:w-auto inline-flex items-center"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Mô phỏng video khác
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default DanceSimulation;