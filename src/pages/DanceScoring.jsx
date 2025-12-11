import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import scoreImage from "../assets/img/score.png"; // Đảm bảo đường dẫn ảnh đúng
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Play,
  Square,
  RefreshCw,
  Activity,
  Video,
  Upload
} from "lucide-react";
import { storage } from "../utils/storage";

// --- CẤU HÌNH API (Theo mẫu bạn yêu cầu) ---
const API_BASE_URL = process.env.REACT_APP_3D_API || "http://localhost:8080";

const DanceScoring = ({ isLoggedIn }) => {
  // --- STATE QUẢN LÝ UI ---
  const [step, setStep] = useState(isLoggedIn ? 0 : -1);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(null);

  // Dữ liệu video mẫu
  const [sampleVideos, setSampleVideos] = useState([
    { id: 1, name: "Múa Quạt - Thầy Nam", preview: null },
    { id: 2, name: "Múa Sen - Cô Lan", preview: null },
    { id: 3, name: "Múa Nón - Thầy Hùng", preview: null },
  ]);
  const [selectedSampleVideo, setSelectedSampleVideo] = useState(null);
  const [sampleVideoFile, setSampleVideoFile] = useState(null);
  const [sampleVideoPreview, setSampleVideoPreview] = useState(null);

  // Trạng thái xử lý
  const [processingProgress, setProcessingProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [comparisonVideoUrl, setComparisonVideoUrl] = useState(null);

  // --- REFS (Lưu trữ tạm thời) ---
  const tempScoreData = useRef(null);
  const tempVideoUrl = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null);

  const navigate = useNavigate();

  // --- 1. CÁC HÀM XỬ LÝ AUTH & HEADERS (Theo phong cách Service) ---

  const getAccessToken = () => {
    return storage.getAccessToken();
  };

  const getHeaders = () => {
    const token = getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
      // LƯU Ý QUAN TRỌNG: 
      // Khi gửi FormData (File Upload), KHÔNG ĐƯỢC set "Content-Type": "application/json".
      // Trình duyệt sẽ tự động set "Content-Type: multipart/form-data; boundary=..."
    };
  };

  // --- 2. LOGIC XỬ LÝ STREAM TỪ SERVER ---

  const calculateScoreData = useCallback((averageSimilarityScore, dance_metrics) => {
    const metrics = dance_metrics || {};
    return {
      total: metrics.total_score || Math.round(averageSimilarityScore * 100) || Math.round(averageSimilarityScore),
      rhythm: metrics.rhythm_score || 0,
      posture: metrics.posture_score || 0,
      handMovements: metrics.movement_score || 0,
      expression: metrics.expression_score || 0,
    };
  }, []);

  // Hàm xử lý từng dòng JSON trả về từ SSE Stream
  const processEvent = useCallback(async (rawLine) => {
    if (!rawLine) return;

    // Làm sạch chuỗi data: "data: {...}" -> "{...}"
    let jsonStr = rawLine.trim();
    if (jsonStr.startsWith("data:")) jsonStr = jsonStr.slice(5).trim();
    if (jsonStr.startsWith("event:")) return;
    if (jsonStr === "" || jsonStr === "ping") return;

    try {
      // Bỏ qua các tin nhắn text thuần không phải JSON
      if (!jsonStr.startsWith("{") && !jsonStr.startsWith("[")) {
        if (jsonStr.includes("finished") || jsonStr.includes("Done")) {
          checkCompletionAndFinish();
        }
        return;
      }

      const data = JSON.parse(jsonStr);
      console.log("🔥 Stream Data:", data);

      // Cập nhật UI tiến độ
      if (data.percentage) setProcessingProgress(data.percentage);
      if (data.message) setProgressMessage(data.message);

      // Tìm URL Video kết quả
      const url = data.result_url || data.cloudinary_video_url || data.side_by_side_video_url;
      if (url) {
        tempVideoUrl.current = url;
        setComparisonVideoUrl(url);
      }

      // Tìm điểm số
      const scoreVal = data.average_score !== undefined ? data.average_score : data.average_similarity_score;
      if (scoreVal !== undefined) {
        const metrics = data.dance_metrics || data.dance_scoring_metrics || {};
        const calculatedScore = calculateScoreData(scoreVal, metrics);
        tempScoreData.current = calculatedScore;
        setScore(calculatedScore);
      }

      // Kiểm tra cờ hoàn thành từ Server
      let isCompleted = data.type === "completed" || data.status === "completed" || data.type === "result";

      // Hoặc tự suy luận hoàn thành nếu đã đủ dữ liệu
      if (url && scoreVal !== undefined) {
        isCompleted = true;
      }

      if (isCompleted) {
        checkCompletionAndFinish();
      }

    } catch (e) {
      console.warn("Parse stream error:", e);
    }
  }, [calculateScoreData]);

  const checkCompletionAndFinish = () => {
    if (tempScoreData.current || tempVideoUrl.current) {
      setIsProcessing(false);
      setStep(3); // Chuyển sang màn hình kết quả
    } else {
      // Vẫn tắt loading để tránh treo, nhưng có thể báo lỗi hoặc chờ thêm
      setIsProcessing(false);
      if (tempVideoUrl.current) setStep(3);
    }
  };

  const processStreamResponse = useCallback(async (response) => {
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
      console.error("Stream reader error:", err);
      setError("Mất kết nối dòng dữ liệu.");
      setIsProcessing(false);
    }
  }, [processEvent]);

  // --- 3. HÀM GỌI API CHÍNH (ÁP DỤNG CẤU HÌNH API_BASE_URL & HEADER) ---
  const handleProcessVideo = useCallback(async () => {
    if (!videoFile || !sampleVideoFile) {
      setError(!videoFile ? "Thiếu video của bạn." : "Thiếu video mẫu.");
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setProgressMessage("Đang khởi tạo kết nối...");
    setError(null);

    // Reset dữ liệu tạm
    tempScoreData.current = null;
    tempVideoUrl.current = null;
    setComparisonVideoUrl(null);
    setScore(null);

    // Chuẩn bị FormData
    const formData = new FormData();
    formData.append("userVideo", videoFile);
    formData.append("referenceVideo", sampleVideoFile);

    // Lấy thông tin user để gửi kèm title (tuỳ chọn)
    const user = storage.getUser();
    formData.append("title", user?.username || "Dance Practice");

    try {
      // GỌI API: Sử dụng biến môi trường và Header token
      const response = await fetch(`${API_BASE_URL}/api/video-3d/process-video-stream`, {
        method: "POST",
        headers: getHeaders(), // Lấy headers từ hàm helper phía trên
        body: formData,
      });

      if (response.status === 401) {
        throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi Server (${response.status}): ${errorText}`);
      }

      // Xử lý luồng dữ liệu trả về
      await processStreamResponse(response);

    } catch (error) {
      console.error("API Error:", error);
      setError(error.message || "Không thể kết nối đến máy chủ xử lý 3D.");
      setIsProcessing(false);
    }
  }, [videoFile, sampleVideoFile, processStreamResponse]);


  // --- 4. CÁC HÀM HELPER KHÁC (CAMERA, UPLOAD, UI) ---

  const handleCameraError = useCallback((err) => {
    let errorMessage = "Lỗi camera: ";
    if (err.name === "NotAllowedError") errorMessage += "Bạn chưa cấp quyền truy cập camera.";
    else if (err.name === "NotFoundError") errorMessage += "Không tìm thấy thiết bị camera.";
    else errorMessage += err.message;

    setError(errorMessage);
    setStep(0);
  }, []);

  const resetCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    setIsRecording(false);
  }, []);

  const resetUserVideo = useCallback(() => {
    resetCamera();
    setVideoFile(null);
    if (videoPreview && videoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setScore(null);
    setProcessingProgress(0);
    setProgressMessage("");
    setIsProcessing(false);
    setError(null);
    setComparisonVideoUrl(null);
  }, [resetCamera, videoPreview]);

  const handleSampleVideoAction = useCallback((file, setAsSelected = false) => {
    if (file && file.type.startsWith("video/")) {
      const newVideo = { id: Date.now(), name: file.name.split(".")[0], preview: URL.createObjectURL(file) };
      setSampleVideos((prev) => [...prev, newVideo]);
      setError(null);
      if (setAsSelected) {
        setSelectedSampleVideo(newVideo);
        setSampleVideoFile(file);
        if (sampleVideoPreview && sampleVideoPreview.startsWith("blob:")) URL.revokeObjectURL(sampleVideoPreview);
        setSampleVideoPreview(URL.createObjectURL(file));
      }
    } else {
      setError("Vui lòng chọn file video hợp lệ (MP4, AVI, WebM).");
    }
  }, [sampleVideoPreview]);

  const handleFileUpload = useCallback((file) => {
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      if (videoPreview && videoPreview.startsWith("blob:")) URL.revokeObjectURL(videoPreview);
      setVideoPreview(URL.createObjectURL(file));
      setStep(2);
      setError(null);
    } else {
      setError("Định dạng video không được hỗ trợ.");
    }
  }, [videoPreview]);

  const initCamera = useCallback(async () => {
    if (!videoRef.current) {
      setError("Camera chưa sẵn sàng.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        setVideoFile(blob);
        if (videoPreview) URL.revokeObjectURL(videoPreview);
        setVideoPreview(URL.createObjectURL(blob));
        recordedChunksRef.current = [];
      };
      setError(null);
    } catch (err) {
      handleCameraError(err);
    }
  }, [videoPreview, handleCameraError]);

  const startRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      resetCamera();
    }
  }, [resetCamera]);

  // Effects
  useEffect(() => {
    if (!isLoggedIn) {
      setStep(-1);
      resetCamera();
    } else {
      setStep(0);
    }
  }, [isLoggedIn, resetCamera]);

  useEffect(() => {
    if (step === 1.5) initCamera();
  }, [step, initCamera]);


  // --- 5. RENDER UI ---

  // Components con nội bộ
  const BackButton = () => (
    <button onClick={() => navigate("/dancing")} className="text-gray-800 py-2 px-4 rounded-lg font-semibold inline-flex items-center hover:underline">
      <ArrowLeft className="h-5 w-5 mr-2" /> Quay về
    </button>
  );

  const VideoUploadButton = ({ onUpload, children, ...props }) => (
    <label className="cursor-pointer bg-red-700 text-white py-3 px-6 rounded-lg hover:bg-red-800 transition-all font-semibold shadow-md inline-flex items-center justify-center">
      {children}
      <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])} {...props} />
    </label>
  );

  const ScoreDisplay = ({ score }) => (
    <div className="mb-8 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Kết quả chi tiết</h3>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col justify-center items-center bg-red-50 p-4 rounded-xl">
          <div className="w-32 h-32 bg-red-700 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-lg mb-2">
            {score.total}
          </div>
          <span className="text-red-800 font-bold text-lg">Tổng điểm</span>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[{ label: "Chuẩn nhịp", value: score.rhythm }, { label: "Tư thế", value: score.posture }, { label: "Động tác tay", value: score.handMovements }, { label: "Biểu cảm", value: score.expression }].map((metric, index) => (
            <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between mb-1">
                <p className="text-gray-600 text-sm font-medium">{metric.label}</p>
                <p className="font-bold text-gray-800">{metric.value}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-red-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${metric.value}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ProcessingDisplay = () => (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6 relative">
        <RefreshCw className="h-12 w-12 text-red-600 animate-spin" />
        <span className="absolute text-xs font-bold text-red-600">{processingProgress}%</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">AI đang chấm điểm...</h2>
      <p className="text-gray-600 mb-6">{progressMessage || "Vui lòng đợi trong giây lát"}</p>
      <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
        <div className="bg-red-600 h-2 rounded-full transition-all duration-300" style={{ width: `${processingProgress}%` }}></div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    if (isProcessing) return <ProcessingDisplay />;

    switch (step) {
      case 0: // Chọn Video Mẫu
        return (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-red-50 rounded-xl p-4">
              <img src={scoreImage} className="max-h-64 object-contain" alt="Dance Score Illustration" />
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center lg:text-left">Bước 1: Chọn bài múa mẫu</h2>
              <div className="mb-6">
                {!selectedSampleVideo ? (
                  <div className="border-2 border-dashed border-red-200 bg-red-50 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-red-100 transition-colors">
                    <Video className="w-12 h-12 text-red-400 mb-3" />
                    <p className="text-gray-600 mb-4">Bạn chưa chọn video mẫu nào</p>
                    <VideoUploadButton onUpload={(f) => handleSampleVideoAction(f, true)}>
                      <Upload className="w-5 h-5 mr-2" /> Tải lên video mẫu
                    </VideoUploadButton>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
                    <div className="aspect-video bg-black">
                      <video src={sampleVideoPreview} className="w-full h-full" controls />
                    </div>
                    <div className="p-4 flex flex-col sm:flex-row gap-3 justify-center">
                      <VideoUploadButton onUpload={(f) => handleSampleVideoAction(f, true)}>
                        <RotateCcw className="mr-2 h-5 w-5" /> Chọn lại
                      </VideoUploadButton>
                      <button onClick={() => setStep(1)} className="bg-red-700 text-white py-3 px-6 rounded-lg font-semibold inline-flex items-center justify-center hover:bg-red-800 shadow-md">
                        Tiếp tục <ArrowRight className="ml-2 h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 1: // Chọn phương thức input (Upload vs Camera)
        return (
          <div className="text-center max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-bold mb-8 text-gray-800">Bước 2: Video của bạn</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => document.getElementById('user-upload').click()}>
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Tải video có sẵn</h3>
                <p className="text-gray-500 text-sm mb-4">Chọn file từ thiết bị của bạn (MP4, AVI)</p>
                <VideoUploadButton id="user-upload" onUpload={handleFileUpload}>Tải lên ngay</VideoUploadButton>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setStep(1.5)}>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quay trực tiếp</h3>
                <p className="text-gray-500 text-sm mb-4">Sử dụng webcam để quay video múa</p>
                <button onClick={() => setStep(1.5)} className="bg-red-700 text-white py-3 px-6 rounded-lg font-semibold">Mở Camera</button>
              </div>
            </div>
          </div>
        );

      case 1.5: // Màn hình Camera
        return (
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Quay Video</h2>
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-6 shadow-xl">
              <video ref={videoRef} className="w-full h-full object-cover transform scale-x-[-1]" autoPlay playsInline muted />
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full animate-pulse">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="text-sm font-bold">REC</span>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={() => { resetCamera(); setStep(1); }} className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300">
                Hủy bỏ
              </button>
              {!isRecording ? (
                <button onClick={startRecording} className="bg-red-700 text-white py-3 px-8 rounded-lg font-semibold flex items-center hover:bg-red-800 shadow-lg">
                  <Play className="mr-2 h-5 w-5" /> Bắt đầu quay
                </button>
              ) : (
                <button onClick={stopRecording} className="bg-gray-900 text-white py-3 px-8 rounded-lg font-semibold flex items-center hover:bg-black shadow-lg">
                  <Square className="mr-2 h-5 w-5" /> Dừng quay
                </button>
              )}
            </div>
          </div>
        );

      case 2: // Xác nhận Video & Gửi
        return (
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Xác nhận video</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div>
                <p className="font-semibold mb-2 text-gray-600">Video mẫu</p>
                <div className="aspect-video bg-black rounded-lg overflow-hidden border border-gray-300">
                  <video src={sampleVideoPreview} className="w-full h-full" controls />
                </div>
              </div>
              <div>
                <p className="font-semibold mb-2 text-gray-600">Video của bạn</p>
                <div className="aspect-video bg-black rounded-lg overflow-hidden border border-gray-300">
                  <video src={videoPreview} className="w-full h-full" controls />
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={() => { setStep(1); resetUserVideo(); }} className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300">
                Chọn lại
              </button>
              <button onClick={handleProcessVideo} className="bg-red-700 text-white py-3 px-8 rounded-lg font-semibold flex items-center hover:bg-red-800 shadow-lg transform hover:scale-105 transition-all">
                <Activity className="mr-2 h-5 w-5" /> Chấm điểm ngay
              </button>
            </div>
          </div>
        );

      case 3: // Kết quả
        return (
          <div className="text-center max-w-5xl mx-auto animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-6 text-red-700">Kết Quả Chấm Điểm</h2>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="order-2 lg:order-1">
                {score && <ScoreDisplay score={score} />}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-left">
                  <h4 className="font-bold text-blue-800 mb-2">Nhận xét từ AI:</h4>
                  <p className="text-blue-700 text-sm">
                    {score?.total >= 80 ? "Tuyệt vời! Bạn đã nắm bắt rất tốt nhịp điệu và động tác." :
                      score?.total >= 50 ? "Khá tốt. Hãy chú ý hơn vào biên độ động tác tay và giữ lưng thẳng." :
                        "Cần cố gắng hơn. Hãy xem lại video mẫu và tập chậm rãi từng động tác."}
                  </p>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                {comparisonVideoUrl ? (
                  <div className="bg-black rounded-xl overflow-hidden shadow-xl border-4 border-white">
                    <video src={comparisonVideoUrl} className="w-full h-auto" controls autoPlay loop />
                  </div>
                ) : (
                  <div className="bg-gray-100 h-64 flex items-center justify-center rounded-xl">
                    <p className="text-gray-500">Video so sánh không khả dụng</p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2 italic">Video so sánh (Trái: Bạn - Phải: Mẫu)</p>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
              <button onClick={() => navigate("/dancing")} className="text-gray-600 font-semibold px-6 py-3 hover:text-gray-900">
                Về danh sách bài học
              </button>
              <button onClick={() => { resetCamera(); setStep(1); resetUserVideo(); }} className="bg-red-700 text-white py-3 px-8 rounded-lg font-semibold shadow-lg hover:bg-red-800">
                <RotateCcw className="inline h-5 w-5 mr-2" /> Thử lại bài này
              </button>
            </div>
          </div>
        );

      default: return null;
    }
  };

  // --- MÀN HÌNH CHƯA ĐĂNG NHẬP ---
  if (step === -1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Yêu cầu đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để sử dụng tính năng chấm điểm AI và lưu kết quả tập luyện.</p>
          <Link to="/login" className="bg-red-700 text-white px-6 py-3 rounded-lg font-semibold block w-full hover:bg-red-800 transition-colors">
            Đăng nhập ngay
          </Link>
          <Link to="/" className="text-gray-500 text-sm mt-4 block hover:underline">Quay về trang chủ</Link>
        </div>
      </div>
    );
  }

  // --- RENDER CHÍNH ---
  return (
    <div className="w-full min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="mb-6 flex justify-between items-center">
          <BackButton />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-red-700 mb-8 text-center drop-shadow-sm">
          Chấm Điểm Điệu Múa AI
        </h1>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200 transition-all duration-300">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg flex justify-between items-center" role="alert">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-500 font-bold hover:text-red-700">✕</button>
            </div>
          )}

          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default DanceScoring;