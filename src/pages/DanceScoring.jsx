import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import scoreImage from "../assets/img/score.png";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Upload,
  Camera,
  Video,
  Play,
  Square,
  Check,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Activity,
} from "lucide-react";
import { storage } from "../utils/storage";

const DanceScoring = ({ isLoggedIn }) => {
  // --- STATE ---
  const [step, setStep] = useState(isLoggedIn ? 0 : -1);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(null);
  const [sampleVideos, setSampleVideos] = useState([
    { id: 1, name: "Múa Quạt - Thầy Nam", preview: null },
    { id: 2, name: "Múa Sen - Cô Lan", preview: null },
    { id: 3, name: "Múa Nón - Thầy Hùng", preview: null },
  ]);
  const [selectedSampleVideo, setSelectedSampleVideo] = useState(null);
  const [sampleVideoFile, setSampleVideoFile] = useState(null);
  const [sampleVideoPreview, setSampleVideoPreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [comparisonVideoUrl, setComparisonVideoUrl] = useState(null);

  // --- REFS (Dùng để gom dữ liệu tạm thời) ---
  const tempScoreData = useRef(null);
  const tempVideoUrl = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // --- HÀM HELPER ---

  const handleCameraError = useCallback((err) => {
    let errorMessage = "Không thể truy cập camera. ";
    if (err.name === "NotAllowedError") {
      errorMessage += "Vui lòng cấp quyền truy cập camera.";
    } else if (err.name === "NotFoundError") {
      errorMessage += "Không tìm thấy camera trên thiết bị.";
    } else {
      errorMessage += `Lỗi: ${err.message}. Vui lòng thử lại hoặc sử dụng tùy chọn tải video.`;
    }
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

  const handleBackToDancing = useCallback(() => {
    navigate("/dancing");
  }, [navigate]);

  const calculateScoreData = useCallback(
    (averageSimilarityScore, dance_metrics) => {
      const metrics = dance_metrics || {};
      return {
        total: metrics.total_score || Math.round(averageSimilarityScore * 100) || Math.round(averageSimilarityScore),
        rhythm: metrics.rhythm_score || 0,
        posture: metrics.posture_score || 0,
        handMovements: metrics.movement_score || 0,
        expression: metrics.expression_score || 0,
      };
    },
    []
  );

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

    // Reset Refs
    tempScoreData.current = null;
    tempVideoUrl.current = null;
  }, [resetCamera, videoPreview]);

  // === [CORE] LOGIC GOM DỮ LIỆU ===
  const processEvent = useCallback(
    async (rawLine) => {
      if (!rawLine) return;

      // 1. Làm sạch dữ liệu: Bỏ "data:", "event:", v.v. để lấy JSON
      let jsonStr = rawLine.trim();
      if (jsonStr.startsWith("data:")) jsonStr = jsonStr.slice(5).trim();
      if (jsonStr.startsWith("event:")) return; // Bỏ qua dòng event tên
      if (jsonStr === "" || jsonStr === "ping") return;

      try {
        // Xử lý trường hợp text thuần (ví dụ: "Processing finished.")
        if (!jsonStr.startsWith("{") && !jsonStr.startsWith("[")) {
          if (jsonStr.includes("finished") || jsonStr.includes("Done")) {
            // Nếu nhận được tín hiệu text kết thúc -> Thử hoàn tất
            checkCompletionAndFinish();
          }
          return;
        }

        const data = JSON.parse(jsonStr);
        console.log("🔥 Chunk:", data); // Debug

        // 2. Cập nhật Tiến độ (nếu có)
        if (data.percentage) setProcessingProgress(data.percentage);
        if (data.message) setProgressMessage(data.message);

        // 3. GOM DỮ LIỆU: Tìm URL Video (nếu có trong gói tin này)
        const url = data.result_url || data.cloudinary_video_url || data.side_by_side_video_url;
        if (url) {
          console.log("✅ Đã tìm thấy URL Video:", url);
          tempVideoUrl.current = url;
          setComparisonVideoUrl(url); // Cập nhật state ngay để UI đỡ lag
        }

        // 4. GOM DỮ LIỆU: Tìm Điểm số (nếu có trong gói tin này)
        const scoreVal = data.average_score !== undefined ? data.average_score : data.average_similarity_score;
        if (scoreVal !== undefined) {
          console.log("✅ Đã tìm thấy Điểm số:", scoreVal);
          const metrics = data.dance_metrics || data.dance_scoring_metrics || {};
          const calculatedScore = calculateScoreData(scoreVal, metrics);
          tempScoreData.current = calculatedScore;
          setScore(calculatedScore);
        }

        // 5. Kiểm tra tín hiệu hoàn thành
        let isCompleted = data.type === "completed" || data.status === "completed" || data.type === "result";

        // Nếu gói tin có đủ cả URL và Điểm -> Coi như hoàn thành luôn
        if (url && scoreVal !== undefined) {
          isCompleted = true;
        }

        if (isCompleted) {
          checkCompletionAndFinish();
        }

      } catch (e) {
        console.warn("Parse log error:", e, jsonStr);
      }
    },
    [calculateScoreData]
  );

  // Hàm chốt kết quả và chuyển trang
  const checkCompletionAndFinish = () => {
    // Chỉ chuyển trang nếu đã có ít nhất điểm số HOẶC video
    if (tempScoreData.current || tempVideoUrl.current) {
      console.log("🏁 Hoàn tất xử lý! Chuyển trang.");
      setIsProcessing(false);
      setStep(3);
    } else {
      console.log("⏳ Nhận tín hiệu xong nhưng chưa đủ dữ liệu...");
      // Vẫn set processing false để không bị treo loading mãi mãi
      setIsProcessing(false);
      // Nếu có video mà chưa có điểm, có thể vẫn cho sang step 3 xem video
      if (tempVideoUrl.current) setStep(3);
    }
  };

  // === [CORE] XỬ LÝ STREAM ===
  const processStreamResponse = useCallback(
    async (response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Xử lý phần dư cuối cùng
            if (buffer.trim()) await processEvent(buffer);
            checkCompletionAndFinish(); // Chốt lần cuối khi đóng kết nối
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

  // --- HÀM GỌI API ---
  const handleProcessVideo = useCallback(async () => {
    if (!videoFile || !sampleVideoFile) {
      setError(!videoFile ? "Thiếu video người dùng." : "Thiếu video mẫu.");
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setProgressMessage("Đang gửi dữ liệu...");
    setError(null);

    // Reset temp
    tempScoreData.current = null;
    tempVideoUrl.current = null;

    const formData = new FormData();
    formData.append("userVideo", videoFile);
    formData.append("referenceVideo", sampleVideoFile);
    const user = storage.getUser();
    formData.append("title", user?.username || "Guest");

    const apiUrl = process.env.REACT_APP_3D_API || 'http://localhost:8080';

    try {
      const response = await fetch(`${apiUrl}/api/video-3d/process-video-stream`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await processStreamResponse(response);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Không thể kết nối Server (8080).");
      setIsProcessing(false);
    }
  }, [videoFile, sampleVideoFile, processStreamResponse]);

  // ... (Phần logic Camera, Video Upload và Render UI giữ nguyên như cũ) ...
  // Để code gọn, tôi không paste lại phần UI dài dòng vì logic UI không đổi. 
  // Bạn hãy giữ nguyên phần return UI của file trước, chỉ thay thế logic bên trên.

  // --- UI START (Copy lại phần này từ file cũ của bạn hoặc file tôi gửi trước đó) ---
  const handleSampleVideoAction = useCallback((file, setAsSelected = false) => { /*...Giữ nguyên...*/ if (file && file.type.startsWith("video/")) { const newVideo = { id: Date.now(), name: file.name.split(".")[0], preview: URL.createObjectURL(file), }; setSampleVideos((prev) => [...prev, newVideo]); setError(null); if (setAsSelected) { setSelectedSampleVideo(newVideo); setSampleVideoFile(file); if (sampleVideoPreview && sampleVideoPreview.startsWith("blob:")) { URL.revokeObjectURL(sampleVideoPreview); } setSampleVideoPreview(URL.createObjectURL(file)); } } else { setError("Vui lòng chọn file video hợp lệ (MP4, AVI, WebM)."); } }, [sampleVideoPreview]);
  const handleSelectSampleVideo = useCallback((video) => { setSelectedSampleVideo(video); if (sampleVideoPreview && sampleVideoPreview.startsWith("blob:")) { URL.revokeObjectURL(sampleVideoPreview); } setSampleVideoPreview(video.preview); }, [sampleVideoPreview]);
  const handleDeleteSampleVideo = useCallback((videoId) => { if (window.confirm("Bạn có chắc muốn xóa video mẫu này?")) { setSampleVideos((prev) => prev.filter((video) => video.id !== videoId)); if (selectedSampleVideo?.id === videoId) { setSelectedSampleVideo(null); if (sampleVideoPreview && sampleVideoPreview.startsWith("blob:")) { URL.revokeObjectURL(sampleVideoPreview); } setSampleVideoPreview(null); } } }, [selectedSampleVideo, sampleVideoPreview]);
  const handleFileUpload = useCallback((file) => { if (file && file.type.startsWith("video/")) { setVideoFile(file); if (videoPreview && videoPreview.startsWith("blob:")) { URL.revokeObjectURL(videoPreview); } setVideoPreview(URL.createObjectURL(file)); setStep(2); setError(null); } else { setError("Vui lòng chọn file video hợp lệ (MP4, AVI, WebM)."); } }, [videoPreview]);
  const initCamera = useCallback(async () => { if (!videoRef.current) { setError("Phần tử video chưa sẵn sàng."); setStep(0); return; } try { let stream; try { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true, }); } catch { stream = await navigator.mediaDevices.getUserMedia({ video: true, }); } streamRef.current = stream; videoRef.current.srcObject = stream; await videoRef.current.play().catch((err) => { setError("Không thể phát stream video: " + err.message); }); mediaRecorderRef.current = new MediaRecorder(stream); mediaRecorderRef.current.ondataavailable = (event) => { if (event.data.size > 0) { recordedChunksRef.current.push(event.data); } }; mediaRecorderRef.current.onstop = () => { const blob = new Blob(recordedChunksRef.current, { type: "video/webm", }); setVideoFile(blob); if (videoPreview && videoPreview.startsWith("blob:")) { URL.revokeObjectURL(videoPreview); } setVideoPreview(URL.createObjectURL(blob)); recordedChunksRef.current = []; }; setError(null); } catch (err) { handleCameraError(err); } }, [videoPreview, handleCameraError]);
  const startRecording = useCallback(() => { if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") { recordedChunksRef.current = []; mediaRecorderRef.current.start(); setIsRecording(true); setError(null); } }, []);
  const stopRecording = useCallback(() => { if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") { mediaRecorderRef.current.stop(); setIsRecording(false); resetCamera(); } }, [resetCamera]);

  useEffect(() => { if (!isLoggedIn) { setStep(-1); resetCamera(); } else { setStep(0); } }, [isLoggedIn, resetCamera]);
  useEffect(() => { if (step === 1.5) { initCamera(); } }, [step, initCamera]);

  const filteredSampleVideos = sampleVideos.filter((video) => video.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const BackButton = () => (<button onClick={handleBackToDancing} className="text-gray-800 py-2 px-4 rounded-lg font-semibold inline-flex items-center hover:underline"> <ArrowLeft className="h-5 w-5 mr-2" /> Quay về </button>);
  const VideoUploadButton = ({ onUpload, children, ...props }) => (<label className="cursor-pointer bg-red-700 text-white py-3 px-6 rounded-lg hover:bg-red-800 transition-all font-semibold shadow-md inline-flex items-center justify-center"> {children} <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])} {...props} /> </label>);
  const ScoreDisplay = ({ score }) => (<div className="mb-8"> <h3 className="text-lg font-semibold text-gray-800 mb-4">Điểm số</h3> <div className="grid md:grid-cols-3"> <div className="md:col-span-1 flex flex-col justify-center items-center"> <div className="w-24 h-24 bg-red-700 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4">{score.total}</div> </div> <div className="grid md:col-span-2 grid-cols-1 md:grid-cols-2 gap-6"> {[{ label: "Chuẩn nhịp", value: score.rhythm }, { label: "Tư thế", value: score.posture }, { label: "Động tác tay", value: score.handMovements }, { label: "Biểu cảm", value: score.expression },].map((metric, index) => (<div key={index} className="text-center"> <div className="flex justify-between"><p className="text-gray-600">{metric.label}</p><p>{metric.value}%</p></div> <div className="w-full bg-gray-200 rounded-full h-4"><div className="bg-red-700 h-4 rounded-full" style={{ width: `${metric.value}%` }}></div></div> </div>))} </div> </div> </div>);
  const ProcessingDisplay = () => (<div className="text-center"> <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6"><RefreshCw className="h-10 w-10 text-red-700 animate-spin" /></div> <h2 className="text-2xl font-semibold text-gray-800 mb-2">Đang phân tích...</h2> <p className="text-gray-600 mb-2">{processingProgress}%</p> <p className="text-sm text-gray-500 mb-4">{progressMessage}</p> <div className="w-full bg-gray-200 rounded-full h-4 mb-6"><div className="bg-red-700 h-4 rounded-full transition-all" style={{ width: `${processingProgress}%` }}></div></div> </div>);

  const renderStepContent = () => {
    if (isProcessing) return <ProcessingDisplay />;
    switch (step) {
      case 0: return (<div className="flex flex-col lg:flex-row gap-6"> <div className="w-full lg:w-1/2"><div className="p-2"><img src={scoreImage} className="w-full h-full object-contain" alt="Score" /></div></div> <div className="w-full lg:w-1/2 text-center flex flex-col justify-center"> <div className="mb-6"> {!selectedSampleVideo ? (<div className="border-2 border-dashed border-gray-300 rounded-lg p-6"><VideoUploadButton onUpload={(f) => handleSampleVideoAction(f, true)}>Tải video mẫu</VideoUploadButton></div>) : (<div className="bg-gray-100 rounded-lg p-4"> <video src={sampleVideoPreview} className="w-full h-auto" controls /> <div className="mt-4 flex justify-center gap-4"> <VideoUploadButton onUpload={(f) => handleSampleVideoAction(f, true)}><RotateCcw className="mr-2 h-5 w-5" /> Tải lại</VideoUploadButton> <button onClick={() => setStep(1)} className="bg-red-700 text-white py-3 px-6 rounded-lg font-semibold inline-flex items-center"><ArrowRight className="mr-2 h-5 w-5" /> Tiếp theo</button> </div> </div>)} </div> </div> </div>);
      case 1: return (<div className="text-center"> <h2 className="text-2xl font-bold mb-6">Tải video múa lên</h2> <div className="border-2 border-dashed border-gray-300 rounded-lg p-6"><VideoUploadButton onUpload={handleFileUpload}>Chọn video</VideoUploadButton></div> </div>);
      case 1.5: return (<div className="text-center"> <h2 className="text-2xl font-bold mb-6">Quay video</h2> <div className="bg-gray-100 rounded-lg p-4 mb-4"><video ref={videoRef} className="w-full h-full" autoPlay playsInline muted /></div> <div className="flex justify-center gap-4"> <button onClick={() => { resetCamera(); setStep(1); resetUserVideo(); }} className="bg-gray-300 py-3 px-6 rounded-lg font-semibold">Quay lại</button> {!isRecording ? (<button onClick={startRecording} className="bg-red-700 text-white py-3 px-6 rounded-lg font-semibold"><Play className="mr-2 h-5 w-5 inline" /> Bắt đầu</button>) : (<button onClick={stopRecording} className="bg-red-700 text-white py-3 px-6 rounded-lg font-semibold"><Square className="mr-2 h-5 w-5 inline" /> Dừng</button>)} </div> </div>);
      case 2: return (<div className="text-center"> <h2 className="text-xl font-semibold mb-4">Video đã chọn</h2> <div className="bg-gray-100 rounded-lg mb-8"><video src={videoPreview} className="w-full h-full" controls /></div> <div className="flex justify-center gap-4"> <button onClick={() => { setStep(1); resetUserVideo(); }} className="bg-gray-300 py-3 px-6 rounded-lg font-semibold">Quay lại</button> <button onClick={handleProcessVideo} className="bg-red-700 text-white py-3 px-6 rounded-lg font-semibold"><Activity className="mr-2 h-5 w-5 inline" /> Phân tích</button> </div> </div>);
      case 3: return (<div className="text-center"> <h2 className="text-xl font-semibold mb-4">Kết quả</h2> {comparisonVideoUrl && <div className="bg-gray-100 rounded-lg mb-8"><video src={comparisonVideoUrl} className="w-full h-full" controls /></div>} {score && <ScoreDisplay score={score} />} <button onClick={() => { resetCamera(); setStep(1); resetUserVideo(); }} className="bg-gray-300 py-3 px-6 rounded-lg font-semibold mt-4">Làm lại</button> </div>);
      default: return null;
    }
  }

  if (step === -1) { return (<div className="min-h-screen flex items-center justify-center bg-gray-50"> <div className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-md text-center"> <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2> <Link to="/login" className="bg-red-700 text-white px-4 py-2 rounded-lg font-semibold">Đăng nhập</Link> </div> </div>); }

  return (<div className="w-full px-4 lg:px-12 pt-2 pb-6 bg-gray-50"> <div className="mb-4"><BackButton /></div> <h1 className="text-3xl font-bold text-red-700 mb-6 text-center">Chấm Điểm Điệu Múa</h1> <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"> {step !== 0 && !isProcessing && <div className="flex flex-col lg:flex-row gap-6"><div className="w-full lg:w-1/2"><div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold">Video mẫu</h2></div><div className="w-full aspect-video bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">{sampleVideoPreview ? <video src={sampleVideoPreview} className="w-full h-full object-contain" controls /> : <span>Chưa chọn</span>}</div></div></div><div className="w-full lg:w-1/2">{renderStepContent()}</div></div>} {(step === 0 || isProcessing) && renderStepContent()} </div> </div>);
};

export default DanceScoring;