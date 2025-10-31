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
  Download,
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

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Effects
  useEffect(() => {
    if (!isLoggedIn) {
      setStep(-1);
      resetCamera();
    } else {
      setStep(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (step === 1.5) {
      initCamera();
    }
  }, [step]);

  // Core functions
  const handleBackToDancing = useCallback(() => {
    navigate("/dancing");
  }, [navigate]);

  const handleSampleVideoAction = useCallback(
    (file, setAsSelected = false) => {
      if (file && file.type.startsWith("video/")) {
        const newVideo = {
          id: Date.now(),
          name: file.name.split(".")[0],
          preview: URL.createObjectURL(file),
        };

        setSampleVideos((prev) => [...prev, newVideo]);
        setError(null);

        if (setAsSelected) {
          setSelectedSampleVideo(newVideo);
          setSampleVideoFile(file);
          if (sampleVideoPreview && sampleVideoPreview.startsWith("blob:")) {
            URL.revokeObjectURL(sampleVideoPreview);
          }
          setSampleVideoPreview(URL.createObjectURL(file));
        }
      } else {
        setError("Vui lòng chọn file video hợp lệ (MP4, AVI, WebM).");
      }
    },
    [sampleVideoPreview]
  );

  const handleSelectSampleVideo = useCallback(
    (video) => {
      setSelectedSampleVideo(video);
      if (sampleVideoPreview && sampleVideoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(sampleVideoPreview);
      }
      setSampleVideoPreview(video.preview);
    },
    [sampleVideoPreview]
  );

  const handleDeleteSampleVideo = useCallback(
    (videoId) => {
      if (window.confirm("Bạn có chắc muốn xóa video mẫu này?")) {
        setSampleVideos((prev) => prev.filter((video) => video.id !== videoId));
        if (selectedSampleVideo?.id === videoId) {
          setSelectedSampleVideo(null);
          if (sampleVideoPreview && sampleVideoPreview.startsWith("blob:")) {
            URL.revokeObjectURL(sampleVideoPreview);
          }
          setSampleVideoPreview(null);
        }
      }
    },
    [selectedSampleVideo, sampleVideoPreview]
  );

  const handleFileUpload = useCallback(
    (file) => {
      if (file && file.type.startsWith("video/")) {
        setVideoFile(file);
        if (videoPreview && videoPreview.startsWith("blob:")) {
          URL.revokeObjectURL(videoPreview);
        }
        setVideoPreview(URL.createObjectURL(file));
        setStep(2);
        setError(null);
      } else {
        setError("Vui lòng chọn file video hợp lệ (MP4, AVI, WebM).");
      }
    },
    [videoPreview]
  );

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

  const processStreamResponse = useCallback(
    async (response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsProcessing(false);
          if (!score) {
            setError(
              "Quá trình xử lý hoàn tất nhưng không nhận được kết quả điểm số."
            );
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        setIsProcessing(true);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line === "" || line.startsWith(": ping")) continue;
          if (line.startsWith("event: ")) {
            await processEvent(line, lines[i + 1]);
          }
        }
      }
    },
    [score]
  );

  const handleProcessVideo = useCallback(async () => {
    if (!videoFile || !sampleVideoFile) {
      setError(
        !videoFile ? "Không có video của người dùng." : "Không có video mẫu."
      );
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setProgressMessage("Đang bắt đầu phân tích...");
    setError(null);
    setComparisonVideoUrl(null);

    const formData = new FormData();
    formData.append("user_video", videoFile);
    formData.append("reference_video", sampleVideoFile);

    const user = storage.getUser();
    formData.append("user_id", user?.id);
    formData.append("title", user?.username);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_3D_API}/api/compare_videos/`,
        {
          method: "POST",
          headers: {
            Accept: "text/event-stream",
            "ngrok-skip-browser-warning": "true",
          },
          body: formData,
        }
      );

      await processStreamResponse(response);
    } catch (error) {
      console.error("Error processing video:", error);
      setError("Có lỗi xảy ra khi xử lý video. Vui lòng thử lại.");
      setIsProcessing(false);
    }
  }, [videoFile, sampleVideoFile]);

  const initCamera = useCallback(async () => {
    if (!videoRef.current) {
      setError("Phần tử video chưa sẵn sàng. Vui lòng thử lại.");
      setStep(0);
      return;
    }

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await videoRef.current.play().catch((err) => {
        setError("Không thể phát stream video: " + err.message);
      });

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        setVideoFile(blob);
        if (videoPreview && videoPreview.startsWith("blob:")) {
          URL.revokeObjectURL(videoPreview);
        }
        setVideoPreview(URL.createObjectURL(blob));
        recordedChunksRef.current = [];
        handleProcessVideo();
      };

      setError(null);
    } catch (err) {
      handleCameraError(err);
    }
  }, [handleProcessVideo, videoPreview]);

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

  const startRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "inactive"
    ) {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      resetCamera();
    }
  }, [resetCamera]);

  const processEvent = useCallback(
    async (eventLine, dataLine) => {
      if (!dataLine?.trim().startsWith("data: ")) return;

      const dataStr = dataLine.trim().slice(6).trim();
      try {
        const data = JSON.parse(dataStr);
        console.log(data);
        const status = data?.type || data?.status;
        switch (status) {
          case "progress":
            setProcessingProgress(data.percentage || 0);
            setProgressMessage(data.message || "");
            break;
          case "completed":
            if (data.average_score !== undefined) {
              const scoreData = calculateScoreData(
                data.average_score,
                data.dance_metrics
              );
              setScore(scoreData);

              // Set comparison video URL from API response
              if (data.result_url) {
                setComparisonVideoUrl(data?.result_url);
              }

              setIsProcessing(false);
              setStep(3);
            }
            break;
          case "done":
            setIsProcessing(false);
            if (!score) {
              setError(
                "Quá trình xử lý hoàn tất nhưng không nhận được kết quả điểm số."
              );
            }
            break;
          default:
            break;
        }
      } catch (e) {
        console.error("Error parsing JSON:", e, "Raw data:", dataStr);
      }
    },
    [score]
  );

  const calculateScoreData = useCallback(
    (averageSimilarityScore, dance_metrics) => {
      const scoreData = {
        total: dance_metrics.total_score,
        rhythm: dance_metrics.rhythm_score,
        posture: dance_metrics.posture_score,
        handMovements: dance_metrics.movement_score,
        expression: dance_metrics.expression_score,
      };

      return scoreData;
    },
    []
  );

  const handleContinueToFaceSwap = useCallback(() => {
    navigate("/face-swap", {
      state: { video: videoFile, lyrics: location.state?.lyrics },
    });
  }, [navigate, videoFile, location.state?.lyrics]);

  const filteredSampleVideos = sampleVideos.filter((video) =>
    video.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // UI Components
  const BackButton = () => (
    <button
      onClick={handleBackToDancing}
      className="text-gray-800 py-2 px-4 rounded-lg transition-all duration-200 font-semibold transform active:scale-95 inline-flex items-center hover:underline underline-offset-2"
    >
      <ArrowLeft className="h-5 w-5 mr-2" />
      Quay về trang điệu múa
    </button>
  );

  const VideoUploadButton = ({ onUpload, children, ...props }) => (
    <label className="cursor-pointer bg-red-700 text-white py-3 px-6 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center">
      {children}
      <input
        type="file"
        accept="video/*,.mkv,video/x-matroska"
        className="hidden"
        onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
        {...props}
      />
    </label>
  );

  const ScoreDisplay = ({ score }) => (
    <div className="mb-8">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Điểm số
      </h3>
      <div className="grid md:grid-cols-3">
        <div className="md:col-span-1 flex flex-col justify-center items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-red-700 text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold mb-4 animate-pulse">
            {score.total}
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            {score.total >= 90
              ? "Tuyệt vời! Động tác múa rất chính xác!"
              : score.total >= 70
              ? "Khá tốt! Động tác múa khá chuẩn!"
              : "Cố gắng lần sau nhé!"}
          </p>
        </div>
        <div className="grid md:col-span-2 grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Chuẩn nhịp", value: score.rhythm },
            { label: "Tư thế", value: score.posture },
            { label: "Động tác tay", value: score.handMovements },
            { label: "Biểu cảm", value: score.expression },
          ].map((metric, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-between">
                <p className="text-gray-600 text-sm sm:text-base mb-2">
                  {metric.label}
                </p>
                <p className="text-gray-600 text-sm sm:text-base mt-1">
                  {metric.value}%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-red-700 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ProcessingDisplay = () => (
    <div className="text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6">
        <RefreshCw className="h-8 w-8 sm:h-10 sm:w-10 text-red-700 animate-spin" />
      </div>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
        Đang phân tích và so sánh video
      </h2>
      <p className="text-gray-600 mb-2">Tiến độ: {processingProgress}%</p>
      <p className="text-sm text-gray-500 mb-4">{progressMessage}</p>
      <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
        <div
          className="bg-red-700 h-4 rounded-full transition-all duration-300"
          style={{ width: `${processingProgress}%` }}
        ></div>
      </div>
    </div>
  );

  // Step Components
  const Step0 = () => (
    <div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2">
          <div className="p-2">
            <div className="w-full max-w-md mx-auto aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={scoreImage}
                alt="Chấm điểm điệu múa"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2 text-center flex flex-col justify-center">
          <SampleVideoSection />
        </div>
      </div>
    </div>
  );

  const SampleVideoSection = () => (
    <>
      <div className="mb-6">
        {!selectedSampleVideo ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full max-w-md mx-auto mb-4">
            <div className="flex items-center justify-center mb-4">
              <p className="text-lg sm:text-xl font-semibold text-gray-800 mr-2">
                Tải video mẫu mới
              </p>
              <Video className="h-5 w-5 text-red-700" />
            </div>
            <VideoUploadButton
              onUpload={(file) => handleSampleVideoAction(file, true)}
            >
              Tải video
            </VideoUploadButton>
            <p className="text-xs sm:text-sm text-gray-600 mt-4">
              Định dạng hỗ trợ: MP4, AVI, WebM
            </p>
          </div>
        ) : (
          <SelectedSampleVideo />
        )}
      </div>
      {/* <SampleVideoList /> */}
    </>
  );

  const SelectedSampleVideo = () => (
    <div className="bg-gray-100 rounded-lg p-4 sm:p-6 mb-8 max-w-md mx-auto">
      <div className="w-full aspect-video bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
        {sampleVideoPreview ? (
          <video
            src={sampleVideoPreview}
            className="w-full h-auto object-contain"
            controls
          />
        ) : (
          <span className="text-gray-600">Không có video mẫu để xem trước</span>
        )}
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Đã chọn: {selectedSampleVideo?.name}
      </p>
      {error && <p className="text-red-700 mt-2 text-sm">{error}</p>}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        <VideoUploadButton
          onUpload={(file) => handleSampleVideoAction(file, true)}
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Tải lại
        </VideoUploadButton>
        <button
          onClick={() => setStep(1)}
          className="bg-red-700 text-white py-3 px-6 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 w-full sm:w-auto inline-flex items-center"
        >
          <ArrowRight className="h-5 w-5 mr-2" />
          Tiếp theo
        </button>
      </div>
    </div>
  );

  const SampleVideoList = () => (
    <div className="mt-12">
      <div className="flex items-center mb-2">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-left">
          Danh sách video mẫu
        </h3>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm video mẫu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </div>
        <VideoUploadButton
          onUpload={(file) => handleSampleVideoAction(file, false)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Thêm video
        </VideoUploadButton>
      </div>
      {filteredSampleVideos.length === 0 ? (
        <p className="text-gray-600 text-sm sm:text-base">
          Chưa có video mẫu nào hoặc không tìm thấy kết quả.
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
          <div className="grid grid-cols-1 gap-4">
            {filteredSampleVideos.map((video) => (
              <div
                key={video.id}
                className={`flex items-center justify-between p-2 border rounded-lg ${
                  selectedSampleVideo?.id === video.id
                    ? "border-red-700 bg-red-50"
                    : "border-gray-200 hover:bg-red-50"
                }`}
              >
                <span className="text-sm font-medium text-gray-800 truncate">
                  {video.name}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSelectSampleVideo(video)}
                    className="bg-red-700 text-white py-1.5 px-3 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold text-sm"
                  >
                    Chọn
                  </button>
                  <button
                    onClick={() => handleDeleteSampleVideo(video.id)}
                    className="bg-gray-300 text-gray-800 py-1.5 px-3 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold text-sm inline-flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const Step1 = () => (
    <div className="text-center">
      <div className="text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-red-700" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Tải video múa lên
        </h2>
        {error && <p className="text-red-700 mb-4 text-sm">{error}</p>}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full">
            <VideoUploadButton onUpload={handleFileUpload}>
              Chọn video
            </VideoUploadButton>
            <p className="text-xs sm:text-sm text-gray-600 mt-4">
              Định dạng hỗ trợ: MP4, AVI, WebM
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const Step1_2 = () => <></>;

  const Step1_5 = () => (
    <div className="text-center">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 inline-flex items-center">
        {score
          ? "Kết quả phân tích"
          : isRecording
          ? "Đang quay video"
          : "Quay video múa"}
        {score && <Check className="h-6 w-6 ml-2 text-green-600" />}
      </h2>
      {error && <p className="text-red-700 mb-4 text-sm">{error}</p>}

      <div className="bg-gray-100 rounded-lg p-4 sm:p-6 mb-8">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          Video của bạn
        </h3>
        <div className="w-full aspect-video bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
          {videoPreview && !isRecording ? (
            <video
              src={videoPreview}
              className="w-full h-full object-contain"
              controls
            />
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              muted
            />
          )}
        </div>
      </div>

      {score && <ScoreDisplay score={score} />}

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => {
            resetCamera();
            setStep(1);
            resetUserVideo();
          }}
          className="bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 w-full sm:w-auto inline-flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại
        </button>
        {!isRecording && !videoPreview && (
          <button
            onClick={startRecording}
            className="bg-red-700 text-white py-3 px-6 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 w-full sm:w-auto inline-flex items-center"
          >
            <Play className="h-5 w-5 mr-2" />
            Bắt đầu quay
          </button>
        )}
        {isRecording && (
          <button
            onClick={stopRecording}
            className="bg-red-700 text-white py-3 px-6 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 w-full sm:w-auto inline-flex items-center"
          >
            <Square className="h-5 w-5 mr-2" />
            Dừng quay
          </button>
        )}
      </div>
    </div>
  );

  const Step2 = () => (
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 inline-flex items-center">
        Tải video thành công
      </h2>
      <div className="bg-gray-100 rounded-lg mb-8">
        <div className="w-full aspect-video bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
          {videoPreview ? (
            <video
              src={videoPreview}
              className="w-full h-full object-contain"
              controls
            />
          ) : (
            <span className="text-gray-600">Không có video để xem trước</span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Đã tải: {videoFile?.name || "Video từ camera"}
        </p>
        {error && <p className="text-red-700 mt-2 text-sm">{error}</p>}
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => {
            setStep(1);
            resetUserVideo();
          }}
          className="bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 w-full sm:w-auto inline-flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại
        </button>
        <VideoUploadButton onUpload={handleFileUpload}>
          <RotateCcw className="h-5 w-5 mr-2" />
          Tải lại video
        </VideoUploadButton>
        <button
          onClick={handleProcessVideo}
          className="bg-red-700 text-white py-3 px-6 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 w-full sm:w-auto inline-flex items-center"
        >
          <Activity className="h-5 w-5 mr-2" />
          Phân tích video
        </button>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="text-center">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 inline-flex items-center">
          Kết quả phân tích
        </h2>

        <div className="bg-gray-100 rounded-lg mb-8">
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
      </div>
    </div>
  );

  const SampleVideoPanel = () => (
    <div className="w-full lg:w-1/2">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-center font-semibold text-gray-800 ">
            Video mẫu
          </h2>
          <button
            onClick={() => {
              resetUserVideo();
              setStep(0);
            }}
            className="bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
        <div className="w-full aspect-video bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
          {sampleVideoPreview ? (
            <video
              src={sampleVideoPreview}
              className="w-full h-full object-contain"
              controls
            />
          ) : (
            <span className="text-gray-600">Không có video mẫu</span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {selectedSampleVideo?.name}
        </p>
      </div>
    </div>
  );

  const UserVideoPanel = () => (
    <div className="w-full lg:w-1/2">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        {isProcessing && <ProcessingDisplay />}
        {!isProcessing && (
          <>
            {step === 1 && <Step1 />}
            {step === 1.2 && <Step1_2 />}
            {step === 1.5 && <Step1_5 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
          </>
        )}
      </div>
    </div>
  );

  if (step === -1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-12 py-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 w-full max-w-md">
          <div className="text-5xl mb-6 text-red-700 animate-bounce">💃</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Vui lòng đăng nhập
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Bạn cần đăng nhập để truy cập chức năng chấm điểm điệu múa
          </p>
          <Link
            to="/login"
            state={{ from: "/dancing-scoring" }}
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
        <BackButton />
      </div>

      <h1 className="text-3xl font-bold text-red-700 mb-6 text-center">
        Chấm Điểm Điệu Múa
      </h1>

      <div className="flex flex-col justify-center">
        <h2 className="text-center text-base sm:text-lg font-semibold text-gray-800 mb-6">
          Chọn một video mẫu để so sánh với điệu múa của bạn
        </h2>
      </div>

      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
        {step === 0 && <Step0 />}
        {step !== 0 && step !== -1 && (
          <div>
            <div className="flex flex-col lg:flex-row gap-6">
              <SampleVideoPanel />
              <UserVideoPanel />
            </div>

            {/* Hiển thị video so sánh kết quả */}
            {comparisonVideoUrl && (
              <div className="mt-4">
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 mb-8">
                  <h3 className="text-lg text-center font-semibold text-gray-800 mb-4">
                    Video so sánh kết quả
                  </h3>
                  <div className="w-full aspect-video bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                    <video
                      src={comparisonVideoUrl}
                      className="w-full h-full object-contain"
                      controls
                    />
                  </div>
                </div>

                {score && <ScoreDisplay score={score} />}

                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => {
                      resetCamera();
                      setStep(1);
                      resetUserVideo();
                    }}
                    className="bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 w-full sm:w-auto inline-flex items-center"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Quay lại
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DanceScoring;
