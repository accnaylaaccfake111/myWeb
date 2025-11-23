import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AodaiBac from "../assets/img/ao4than.png";
import AodaiTrung from "../assets/img/aodai.png";
import AodaiNam from "../assets/img/aobaba.png";
import FaceSwapDemo from "../assets/img/faceSwap.png";
import ClothesSwapDemo from "../assets/img/clothesSwap.png";
import {
    useVideoProcessing,
    useImageProcessing,
    useCommonProcessing,
    useFileHandlers,
    useVideoAnalysis,
    useVideoFaceSwap,
    useImageClothesSwap,
} from "../hooks/FaceSwapHook";
import { ArrowLeft, Download, LogIn, RotateCw, Smile } from "lucide-react";

const FaceSwap = ({ isLoggedIn }) => {
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState("video");
    const [customOutfit, setCustomOutfit] = useState(null);
    const [customOutfitPreview, setCustomOutfitPreview] = useState(null);

    // Khởi tạo các hooks tách biệt
    const videoState = useVideoProcessing();
    const imageState = useImageProcessing();
    const commonState = useCommonProcessing();

    const navigate = useNavigate();
    const location = useLocation();

    // Khởi tạo các service handlers
    const fileHandlers = useFileHandlers(
        videoState,
        imageState,
        commonState,
        setMode,
    );
    const videoAnalysis = useVideoAnalysis(videoState, commonState, setStep);
    const videoFaceSwap = useVideoFaceSwap(videoState, commonState, setStep);
    const imageClothesSwap = useImageClothesSwap(
        imageState,
        commonState,
        setStep,
    );

    const outfits = [
        { id: 1, name: "Áo dài miền Bắc", region: "Bắc", image: AodaiBac },
        {
            id: 2,
            name: "Áo dài miền Trung",
            region: "Trung",
            image: AodaiTrung,
        },
        { id: 3, name: "Áo dài miền Nam", region: "Nam", image: AodaiNam },
    ];

    // Effect xử lý video từ location state
    useEffect(() => {
        if (location.state?.video) {
            fileHandlers.handleVideoUpload({
                target: { files: [location.state.video] },
            });
            setStep(1);
            setMode("video");
        }
    }, [location.state, fileHandlers]);

    // Hàm xử lý upload trang phục tùy chỉnh
    const handleCustomOutfitUpload = useCallback(
        (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith("image/")) {
                setCustomOutfit(file);
                const previewUrl = URL.createObjectURL(file);
                setCustomOutfitPreview(previewUrl);

                // Tự động chọn trang phục tùy chỉnh
                commonState.setSelectedOutfit({
                    id: "custom",
                    name: "Trang phục tùy chỉnh",
                    region: "Tùy chỉnh",
                    image: previewUrl,
                    customFile: file,
                });
            }
        },
        [commonState],
    );

    // Hàm xóa trang phục tùy chỉnh
    const handleRemoveCustomOutfit = useCallback(() => {
        setCustomOutfit(null);
        setCustomOutfitPreview(null);
        if (commonState.selectedOutfit?.id === "custom") {
            commonState.setSelectedOutfit(null);
        }
    }, [commonState]);

    // Hàm xử lý chung
    const handleProcess = useCallback(async () => {
        if (mode === "video") {
            await videoFaceSwap.handleProcessFaceSwap();
        } else {
            // Truyền thêm thông tin trang phục tùy chỉnh nếu có
            const outfitData =
                commonState.selectedOutfit?.id === "custom"
                    ? { customOutfit: customOutfit }
                    : {};
            await imageClothesSwap.handleProcessClothesSwap(outfitData);
        }
    }, [
        mode,
        videoFaceSwap,
        imageClothesSwap,
        commonState.selectedOutfit,
        customOutfit,
    ]);

    const handleDownload = useCallback(() => {
        if (mode === "video" && videoState.processedVideoPreview) {
            const link = document.createElement("a");
            link.href = videoState.processedVideoPreview;
            link.download = "face-swap-video.mp4";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert("Tải xuống video thành công!");
        } else if (mode === "image" && imageState.processedImagePreview) {
            const link = document.createElement("a");
            link.href = imageState.processedImagePreview;
            link.download = "clothes-swap-image.jpg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert("Tải xuống ảnh thành công!");
        } else {
            alert("Kết quả chưa sẵn sàng để tải xuống");
        }
    }, [
        mode,
        videoState.processedVideoPreview,
        imageState.processedImagePreview,
    ]);

    const handleRestart = useCallback(() => {
        setStep(1);
        setCustomOutfit(null);
        setCustomOutfitPreview(null);
        videoState.setVideoFile(null);
        videoState.setVideoPreview(null);
        videoState.setProcessedVideoPreview(null);
        imageState.setImageFile(null);
        imageState.setImagePreview(null);
        imageState.setProcessedImagePreview(null);
        commonState.setFaceImages({});
        commonState.setFaceImagePreviews({});
        commonState.setSelectedOutfit(null);
        videoState.setIsAnalyzed(false);
        videoState.setDetectedFaces([]);
        videoState.setSelectedFaceId(null);
        commonState.setError(null);
        commonState.setProjectId(null);
        commonState.setProcessingStatus("");
        videoFaceSwap.stopPolling();
    }, [videoState, imageState, commonState, videoFaceSwap]);

    const handleBackToStep1 = useCallback(() => {
        setStep(1);
        videoState.setProcessedVideoPreview(null);
        imageState.setProcessedImagePreview(null);
        commonState.setError(null);
    }, [videoState, imageState, commonState]);

    const handleRestartToStep2 = useCallback(() => {
        setStep(2);
        videoState.setProcessedVideoPreview(null);
        imageState.setProcessedImagePreview(null);
        if (videoState.detectedFaces.length > 0 && !videoState.selectedFaceId) {
            videoState.setSelectedFaceId(videoState.detectedFaces[0].id);
        }
    }, [videoState, imageState]);

    const handleContinueToLyrics = useCallback(() => {
        console.log(videoState);
        navigate("/lyrics-composition", {
            state: {
                video:
                    videoState.processedVideoPreview || videoState.videoPreview,
            },
        });
    }, [navigate, videoState]);

    const handleDragOver = useCallback(
        (e) => {
            e.preventDefault();
            commonState.setIsDragging(true);
        },
        [commonState],
    );

    const handleDragLeave = useCallback(
        (e) => {
            e.preventDefault();
            commonState.setIsDragging(false);
        },
        [commonState],
    );

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            commonState.setIsDragging(false);
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith("image/")) {
                    // Kiểm tra xem đang kéo thả cho khuôn mặt hay trang phục
                    if (videoState.selectedFaceId) {
                        fileHandlers.handleFaceFileUpload(
                            file,
                            videoState.selectedFaceId,
                        );
                    } else {
                        // Kéo thả trang phục tùy chỉnh
                        setCustomOutfit(file);
                        const previewUrl = URL.createObjectURL(file);
                        setCustomOutfitPreview(previewUrl);
                        commonState.setSelectedOutfit({
                            id: "custom",
                            name: "Trang phục tùy chỉnh",
                            region: "Tùy chỉnh",
                            image: previewUrl,
                            customFile: file,
                        });
                    }
                }
            }
        },
        [commonState, videoState.selectedFaceId, fileHandlers],
    );

    const handleFaceUpload = useCallback(
        (e) => {
            fileHandlers.handleFaceUpload(e, videoState.selectedFaceId);
        },
        [fileHandlers, videoState.selectedFaceId],
    );

    const handleOutfitSelect = useCallback(
        (outfit) => {
            commonState.setSelectedOutfit(
                commonState.selectedOutfit?.id === outfit.id ? null : outfit,
            );
        },
        [commonState],
    );

    // Hiển thị tổng quan về các bước
    const renderStepIndicator = () => (
        <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <div className="flex items-center">
                    {[1, 2, 3].map((stepNumber) => (
                        <div key={stepNumber} className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                    step >= stepNumber
                                        ? "bg-red-700 border-red-700 text-white"
                                        : "bg-white border-gray-300 text-gray-500"
                                } font-semibold`}
                            >
                                {stepNumber}
                            </div>
                            {stepNumber < 3 && (
                                <div
                                    className={`w-8 sm:w-16 h-1 mx-4 ${
                                        step > stepNumber
                                            ? "bg-red-700"
                                            : "bg-gray-300"
                                    }`}
                                ></div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <span
                        className={
                            step >= 1 ? "text-red-700 font-semibold" : ""
                        }
                    >
                        {mode === "video" ? "Tải video" : "Tải ảnh"}
                    </span>
                    <span
                        className={
                            step >= 2 ? "text-red-700 font-semibold" : ""
                        }
                    >
                        {mode === "video"
                            ? "Chọn mặt & trang phục"
                            : "Chọn trang phục"}
                    </span>
                    <span
                        className={
                            step >= 3 ? "text-red-700 font-semibold" : ""
                        }
                    >
                        Kết quả
                    </span>
                </div>
            </div>
        </div>
    );

    // Component hiển thị trang phục tùy chỉnh
    const renderCustomOutfitOption = () => (
        <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                commonState.selectedOutfit?.id === "custom"
                    ? "border-red-700 bg-red-50 shadow-md transform scale-105"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
        >
            <div className="flex flex-col items-center">
                {customOutfitPreview ? (
                    <>
                        <div className="h-32 w-32 bg-gray-200 rounded flex items-center justify-center overflow-hidden mb-3 border-2 border-white shadow-sm relative">
                            <img
                                src={customOutfitPreview}
                                alt="Trang phục tùy chỉnh"
                                className="h-full w-full object-contain"
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCustomOutfit();
                                }}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 transition-colors shadow-md"
                            >
                                ×
                            </button>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 text-center">
                            Trang phục tùy chỉnh
                        </h4>
                        <p className="text-sm text-gray-600 text-center">
                            {customOutfit.name}
                        </p>
                    </>
                ) : (
                    <>
                        <div className="h-32 w-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-3 border-2 border-dashed border-gray-300">
                            <svg
                                className="h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 text-center">
                            Tải trang phục lên
                        </h4>
                        <p className="text-sm text-gray-600 text-center">
                            JPG, PNG
                        </p>
                    </>
                )}

                {commonState.selectedOutfit?.id === "custom" && (
                    <div className="mt-2 inline-flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                        <svg
                            className="h-3 w-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        Đã chọn
                    </div>
                )}

                <label className="cursor-pointer bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center mt-3">
                    <svg
                        className="h-4 w-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {customOutfitPreview ? "Thay đổi" : "Chọn ảnh"}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCustomOutfitUpload}
                    />
                </label>
            </div>
        </div>
    );

    return (
        <div className="w-full px-4 sm:px-6 lg:px-12 pt-2 pb-6 bg-gray-50">
            {step !== 1 && (
                <div className="mb-4">
                    <button
                        onClick={() => {
                            navigate("/face-swap");
                            setStep(1);
                        }}
                        className="text-gray-800 py-2 px-4 rounded-lg transition-all duration-200 font-semibold transform active:scale-95 inline-flex items-center hover:underline underline-offset-2"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Quay về trang ghép mặt
                    </button>
                </div>
            )}
            <div className="flex justify-center items-center space-x-4 mb-4">
                <div className="flex justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center">
                        <svg
                            className="h-6 w-6 sm:h-8 sm:w-8 text-red-700"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-red-700 mb-2 text-center animate-pulse">
                    {mode === "video" ? "Ghép mặt vui nhộn" : "Ghép trang phục"}
                </h1>
            </div>

            {/* Hiển thị chỉ bước */}
            {renderStepIndicator()}

            {/* Hiển thị lỗi */}
            {commonState.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center max-w-4xl mx-auto">
                    {commonState.error}
                </div>
            )}

            {/* Step 1: Upload và giới thiệu */}
            {step === 1 && (
                <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 max-w-6xl mx-auto">
                    <p className="text-base text-center sm:text-lg font-semibold text-gray-800 mb-6">
                        {mode === "video"
                            ? "Ghép khuôn mặt và trang phục vào video múa của bạn"
                            : "Ghép trang phục vào ảnh của bạn"}
                    </p>

                    {/* Chọn chế độ */}
                    <div className="mb-6">
                        <div className="flex justify-center gap-4 mb-4">
                            <button
                                onClick={() => setMode("video")}
                                className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                                    mode === "video"
                                        ? "bg-red-700 text-white"
                                        : "bg-gray-200 text-gray-700"
                                }`}
                            >
                                Ghép video
                            </button>
                            <button
                                onClick={() => setMode("image")}
                                className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                                    mode === "image"
                                        ? "bg-red-700 text-white"
                                        : "bg-gray-200 text-gray-700"
                                }`}
                            >
                                Ghép trang phục
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-1/2">
                            <div className="h-full flex flex-col gap-6 justify-center">
                                {mode === "video" ? (
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-red-700 mb-4 text-center inline-flex items-center justify-center w-full">
                                            <svg
                                                className="h-5 w-5 mr-2 text-red-700"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                            Trao đổi khuôn mặt vào video
                                        </h3>
                                        <div className="w-full aspect-[16/9] bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                            <img
                                                src={FaceSwapDemo}
                                                alt="Trao đổi khuôn mặt vào video"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold text-red-700 mb-4 text-center inline-flex items-center justify-center w-full">
                                            <svg
                                                className="h-5 w-5 mr-2 text-red-700"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M21.5 6.5l-1.4-1.4-2.6 2.6L16.1 6.3 14.7 7.7l1.4 1.4-1.4 1.4 1.4 1.4 1.4-1.4 1.4 1.4 1.4-1.4-1.4-1.4 1.4-1.4zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10H12V2z" />
                                            </svg>
                                            Tùy chỉnh trang phục cho ảnh
                                        </h3>
                                        <div className="w-full aspect-[16/9] bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                            <img
                                                src={ClothesSwapDemo}
                                                alt="Tùy chỉnh trang phục cho ảnh"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {!isLoggedIn && step === 1 ? (
                            <div className="w-full lg:w-1/2 flex items-center justify-center">
                                <div className="p-8 w-full max-w-md">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                                        Vui lòng đăng nhập
                                    </h2>
                                    <p className="text-gray-600 mb-6 text-center">
                                        Bạn cần đăng nhập để truy cập chức năng
                                        ghép mặt vui nhộn
                                    </p>
                                    <Link
                                        to="/login"
                                        state={{ from: "/face-swap" }}
                                        className="flex justify-center items-center space-x-4 block bg-red-700 text-white px-4 py-4 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 text-center"
                                    >
                                        <LogIn className="w-5 h-5" />
                                        <span>Đăng nhập</span>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full lg:w-1/2 text-center">
                                {mode === "video" ? (
                                    videoState.videoPreview ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="bg-gray-100 rounded-lg p-4 sm:p-6 w-full">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 text-center inline-flex items-center justify-center w-full">
                                                    Xem trước video
                                                    <svg
                                                        className="h-5 w-5 ml-2 text-red-700"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </h3>
                                                <div className="w-full max-w-[95%] aspect-video bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden mx-auto">
                                                    <video
                                                        src={
                                                            videoState.videoPreview
                                                        }
                                                        className="w-full h-full object-contain"
                                                        controls
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2">
                                                    Đã tải:{" "}
                                                    {videoState.videoFile
                                                        ?.name ||
                                                        "Video từ mô phỏng điệu múa"}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap justify-center gap-4">
                                                <label className="cursor-pointer bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center">
                                                    <svg
                                                        className="h-5 w-5 mr-2"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                                                    </svg>
                                                    Tải lại video
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        className="hidden"
                                                        onChange={
                                                            fileHandlers.handleVideoUpload
                                                        }
                                                    />
                                                </label>
                                                <button
                                                    onClick={
                                                        videoAnalysis.handleAnalyzeVideo
                                                    }
                                                    className="bg-red-700 text-white py-3 px-6 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center"
                                                >
                                                    <svg
                                                        className="h-5 w-5 mr-2"
                                                        fill="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    Phân tích video
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full sm:w-80 mx-auto border-2 border-dashed border-gray-300 rounded-lg p-6">
                                            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 inline-flex items-center animate-pulse justify-center w-full">
                                                Tải video múa lên
                                                <svg
                                                    className="h-6 w-6 ml-2 text-red-700"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </h2>
                                            <label className="cursor-pointer bg-red-700 text-white py-3 px-3 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center w-full">
                                                Chọn video
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    onChange={
                                                        fileHandlers.handleVideoUpload
                                                    }
                                                />
                                            </label>
                                            <p className="text-xs sm:text-sm text-gray-600 mt-2">
                                                Định dạng hỗ trợ: MP4, AVI
                                            </p>
                                        </div>
                                    )
                                ) : imageState.imagePreview ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="bg-gray-100 rounded-lg p-4 sm:p-6 w-full">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 text-center inline-flex items-center justify-center w-full">
                                                Xem trước ảnh
                                                <svg
                                                    className="h-5 w-5 ml-2 text-red-700"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </h3>
                                            <div className="w-full max-w-[95%] aspect-square bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden mx-auto">
                                                <img
                                                    src={
                                                        imageState.imagePreview
                                                    }
                                                    alt="Xem trước ảnh"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2">
                                                Đã tải:{" "}
                                                {imageState.imageFile?.name ||
                                                    "Ảnh đã tải lên"}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-4">
                                            <label className="cursor-pointer bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center">
                                                <svg
                                                    className="h-5 w-5 mr-2"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                                                </svg>
                                                Tải lại ảnh
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={
                                                        fileHandlers.handleImageUpload
                                                    }
                                                />
                                            </label>
                                            <button
                                                onClick={() => setStep(2)}
                                                className="bg-red-700 text-white py-3 px-6 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center"
                                            >
                                                Tiếp tục chọn trang phục
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full sm:w-80 mx-auto border-2 border-dashed border-gray-300 rounded-lg p-6">
                                        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 inline-flex items-center animate-pulse justify-center w-full">
                                            Tải ảnh lên
                                            <svg
                                                className="h-6 w-6 ml-2 text-red-700"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </h2>
                                        <label className="cursor-pointer bg-red-700 text-white py-3 px-3 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center w-full">
                                            Chọn ảnh
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={
                                                    fileHandlers.handleImageUpload
                                                }
                                            />
                                        </label>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-2">
                                            Định dạng hỗ trợ: JPG, PNG
                                        </p>
                                    </div>
                                )}

                                <div className="mt-6">
                                    <button
                                        onClick={() =>
                                            navigate("/dancing-simulation")
                                        }
                                        className="bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center"
                                    >
                                        <svg
                                            className="h-5 w-5 mr-2"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                                        </svg>
                                        Quay lại mô phỏng điệu múa
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 1.5: Đang phân tích (chỉ cho video) */}
            {step === 1.5 && commonState.isProcessing && mode === "video" && (
                <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 text-center max-w-2xl mx-auto">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <svg
                            className="h-8 w-8 sm:h-10 sm:w-10 text-red-700 animate-spin"
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
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 animate-pulse">
                        Đang phân tích video
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Hệ thống đang phân tích video để phát hiện khuôn mặt...
                    </p>
                    <div className="bg-gray-100 rounded-lg p-4 sm:p-6 mt-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center inline-flex items-center justify-center w-full">
                            Xem trước video
                            <svg
                                className="h-5 w-5 ml-2 text-red-700"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </h3>
                        <div className="w-full max-w-[60%] mx-auto aspect-video bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                            {videoState.videoPreview ? (
                                <video
                                    src={videoState.videoPreview}
                                    className="w-full h-full object-contain"
                                    controls
                                />
                            ) : (
                                <span className="text-gray-600">
                                    Không có video để xem trước
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Chọn khuôn mặt và trang phục cho video, hoặc chỉ trang phục cho ảnh */}
            {step === 2 && (
                <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 max-w-6xl mx-auto">
                    <div className="flex flex-col gap-6">
                        {/* Xem trước file đã tải */}
                        <div className="bg-gray-100 rounded-lg p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center inline-flex items-center justify-center w-full">
                                {mode === "video"
                                    ? "Xem trước video"
                                    : "Xem trước ảnh"}
                                <svg
                                    className="h-5 w-5 ml-2 text-red-700"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    {mode === "video" ? (
                                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    ) : (
                                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    )}
                                </svg>
                            </h3>
                            <div
                                className={`w-full max-w-[60%] mx-auto ${
                                    mode === "video"
                                        ? "aspect-video"
                                        : "aspect-square"
                                } bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden`}
                            >
                                {mode === "video" ? (
                                    videoState.videoPreview ? (
                                        <video
                                            src={videoState.videoPreview}
                                            className="w-full h-full object-contain"
                                            controls
                                        />
                                    ) : (
                                        <span className="text-gray-600">
                                            Không có video để xem trước
                                        </span>
                                    )
                                ) : imageState.imagePreview ? (
                                    <img
                                        src={imageState.imagePreview}
                                        alt="Xem trước ảnh"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <span className="text-gray-600">
                                        Không có ảnh để xem trước
                                    </span>
                                )}
                            </div>
                        </div>

                        {mode === "video" && videoState.isAnalyzed ? (
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Phần khuôn mặt cho video */}
                                <div className="w-full">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center animate-pulse">
                                        Các khuôn mặt được phát hiện
                                    </h3>

                                    <div className="mb-6">
                                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 mb-4">
                                            {videoState.detectedFaces.map(
                                                (face) => (
                                                    <div
                                                        key={face.id}
                                                        className={`border-2 rounded-lg p-3 transition-all duration-200 cursor-pointer ${
                                                            videoState.selectedFaceId ===
                                                            face.id
                                                                ? "border-red-700 bg-red-50 shadow-md transform scale-105"
                                                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                        onClick={() =>
                                                            videoState.setSelectedFaceId(
                                                                face.id,
                                                            )
                                                        }
                                                    >
                                                        <div className="h-24 w-full bg-gray-200 rounded flex items-center justify-center overflow-hidden mb-2">
                                                            <img
                                                                src={
                                                                    face.dataUrl
                                                                }
                                                                alt={face.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {face.name}
                                                            </span>
                                                            <div className="flex items-center">
                                                                {commonState
                                                                    .faceImages[
                                                                    face.id
                                                                ] && (
                                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                                )}
                                                                <button
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        videoState.setSelectedFaceId(
                                                                            face.id,
                                                                        );
                                                                    }}
                                                                    className={`text-xs py-1 px-2 rounded transition-colors ${
                                                                        videoState.selectedFaceId ===
                                                                        face.id
                                                                            ? "bg-red-700 text-white"
                                                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                                    }`}
                                                                >
                                                                    {videoState.selectedFaceId ===
                                                                    face.id
                                                                        ? "Đã chọn"
                                                                        : "Chọn"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    {videoState.selectedFaceId && (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                                                Tải lên khuôn mặt thay thế cho{" "}
                                                {
                                                    videoState.detectedFaces.find(
                                                        (f) =>
                                                            f.id ===
                                                            videoState.selectedFaceId,
                                                    )?.name
                                                }
                                            </h3>
                                            <div
                                                className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 h-64 flex flex-col items-center justify-center ${
                                                    commonState.isDragging
                                                        ? "border-red-700 bg-red-50"
                                                        : "border-gray-300"
                                                }`}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                            >
                                                {commonState.faceImages[
                                                    videoState.selectedFaceId
                                                ] ? (
                                                    <div className="text-center">
                                                        <div className="relative inline-block">
                                                            <div className="h-32 w-32 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg">
                                                                <img
                                                                    src={
                                                                        commonState
                                                                            .faceImagePreviews[
                                                                            videoState
                                                                                .selectedFaceId
                                                                        ]
                                                                    }
                                                                    alt="Xem trước khuôn mặt"
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() =>
                                                                    fileHandlers.handleRemoveFaceImage(
                                                                        videoState.selectedFaceId,
                                                                    )
                                                                }
                                                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 transition-colors shadow-md"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-4 truncate max-w-xs">
                                                            Đã tải lên:{" "}
                                                            {
                                                                commonState
                                                                    .faceImages[
                                                                    videoState
                                                                        .selectedFaceId
                                                                ].name
                                                            }
                                                        </p>
                                                        <div className="flex justify-center gap-4">
                                                            <label className="cursor-pointer bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center">
                                                                <svg
                                                                    className="h-4 w-4 mr-2"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                Chọn ảnh khác
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={
                                                                        handleFaceUpload
                                                                    }
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <svg
                                                            className="h-16 w-16 text-gray-400 mx-auto mb-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                        <p className="text-gray-600 mb-4 text-sm font-bold">
                                                            Kéo thả ảnh khuôn
                                                            mặt vào đây hoặc
                                                            nhấn để tải lên
                                                        </p>
                                                        <label className="cursor-pointer bg-red-700 text-white py-3 px-6 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center">
                                                            <svg
                                                                className="h-5 w-5 mr-2"
                                                                fill="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            Chọn ảnh khuôn mặt
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={
                                                                    handleFaceUpload
                                                                }
                                                            />
                                                        </label>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Định dạng hỗ trợ:
                                                            JPG, PNG
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : mode === "image" ? (
                            /* Chỉ hiển thị phần trang phục cho ảnh */
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6 text-center animate-pulse">
                                    Chọn trang phục để ghép vào ảnh
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {outfits.map((outfit) => (
                                        <div
                                            key={outfit.id}
                                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                                commonState.selectedOutfit
                                                    ?.id === outfit.id
                                                    ? "border-red-700 bg-red-50 shadow-md transform scale-105"
                                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                            onClick={() =>
                                                handleOutfitSelect(outfit)
                                            }
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="h-32 w-32 bg-gray-200 rounded flex items-center justify-center overflow-hidden mb-3 border-2 border-white shadow-sm">
                                                    <img
                                                        src={outfit.image}
                                                        alt={outfit.name}
                                                        className="h-full w-full object-contain"
                                                    />
                                                </div>
                                                <h4 className="text-lg font-semibold text-gray-800 text-center">
                                                    {outfit.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 text-center">
                                                    Miền {outfit.region}
                                                </p>
                                                {commonState.selectedOutfit
                                                    ?.id === outfit.id && (
                                                    <div className="mt-2 inline-flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                        <svg
                                                            className="h-3 w-3 mr-1"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                        </svg>
                                                        Đã chọn
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Tùy chọn trang phục tùy chỉnh cho ảnh */}
                                    {renderCustomOutfitOption()}
                                </div>
                            </div>
                        ) : null}

                        <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
                            {mode === "video" && !videoState.isAnalyzed ? (
                                <>
                                    <label className="cursor-pointer bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center">
                                        Chọn lại video
                                        <input
                                            type="file"
                                            accept="video/*"
                                            className="hidden"
                                            onChange={
                                                fileHandlers.handleVideoUpload
                                            }
                                        />
                                    </label>
                                    <button
                                        onClick={
                                            videoAnalysis.handleAnalyzeVideo
                                        }
                                        className="bg-red-700 text-white py-3 px-6 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center"
                                    >
                                        <svg
                                            className="h-5 w-5 mr-2"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Phân tích video
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleBackToStep1}
                                        className="bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center"
                                    >
                                        <svg
                                            className="h-5 w-5 mr-2"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                                        </svg>
                                        Quay lại
                                    </button>
                                    <button
                                        onClick={handleProcess}
                                        disabled={
                                            mode === "video"
                                                ? !videoState.videoFile ||
                                                  (Object.keys(
                                                      commonState.faceImages,
                                                  ).length === 0 &&
                                                      !commonState.selectedOutfit)
                                                : !imageState.imageFile ||
                                                  !commonState.selectedOutfit
                                        }
                                        className={`py-3 px-6 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center ${
                                            (mode === "video" &&
                                                videoState.videoFile &&
                                                (Object.keys(
                                                    commonState.faceImages,
                                                ).length > 0 ||
                                                    commonState.selectedOutfit)) ||
                                            (mode === "image" &&
                                                imageState.imageFile &&
                                                commonState.selectedOutfit)
                                                ? "bg-red-700 text-white hover:bg-red-800"
                                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                    >
                                        <svg
                                            className="h-5 w-5 mr-2"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Bắt đầu{" "}
                                        {mode === "video"
                                            ? "ghép"
                                            : "ghép trang phục"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2.5: Đang xử lý */}
            {step === 2.5 && commonState.isProcessing && (
                <div className="w-full flex items-center justify-center bg-gray-50">
                    <div className="bg-white rounded-xl p-8 sm:p-12 shadow-lg border border-gray-200 text-center max-w-2xl w-full mx-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-8 animate-pulse">
                            <svg
                                className="h-10 w-10 sm:h-12 sm:w-12 text-red-700 animate-spin"
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
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
                            Đang xử lý {mode === "video" ? "video" : "ảnh"}
                        </h2>

                        <p className="text-gray-600 text-lg mb-2">
                            {commonState.processingStatus ||
                                `Hệ thống đang ${
                                    mode === "video"
                                        ? "ghép khuôn mặt và trang phục vào video"
                                        : "ghép trang phục vào ảnh"
                                }...`}
                        </p>

                        {commonState.projectId && (
                            <div className="bg-gray-100 rounded-lg p-4 inline-block mb-6">
                                <p className="text-xs text-gray-600">
                                    Mã dự án:{" "}
                                    <span className="font-mono">
                                        {commonState.projectId}
                                    </span>
                                </p>
                            </div>
                        )}

                        <button
                            onClick={videoFaceSwap.cancelProcessing}
                            className="bg-gray-500 text-white mx-auto py-3 px-8 rounded-lg hover:bg-gray-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center justify-center"
                        >
                            <svg
                                className="h-5 w-5 mr-2"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                            Hủy quá trình
                        </button>

                        <div className="mt-8 text-sm text-gray-500">
                            <p>
                                Quá trình này có thể mất vài phút tùy thuộc vào
                                độ dài{" "}
                                {mode === "video" ? "video" : "kích thước ảnh"}
                            </p>
                            <p>Vui lòng không đóng trình duyệt</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Kết quả */}
            {step === 3 && !commonState.isProcessing && (
                <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 max-w-6xl mx-auto">
                    <div className="text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <svg
                                className="h-8 w-8 sm:h-10 sm:w-10 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
                            {mode === "video"
                                ? "Ghép mặt thành công!"
                                : "Ghép trang phục thành công!"}
                        </h2>
                        <p className="text-gray-600 mb-8">
                            {mode === "video"
                                ? "Video của bạn đã được xử lý thành công. Bạn có thể xem trước, tải xuống hoặc tiếp tục sáng tác lời."
                                : "Ảnh của bạn đã được xử lý thành công. Bạn có thể xem trước, tải xuống hoặc tiếp tục sáng tác lời."}
                        </p>

                        <div className="bg-gray-100 rounded-xl p-4 sm:p-6 mb-8">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center">
                                {mode === "video"
                                    ? "Video đã xử lý"
                                    : "Ảnh đã xử lý"}
                            </h3>
                            <div className="flex space-x-4">
                                {mode !== "video" && (
                                    <div className="bg-gray-100 rounded-lg">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 text-center inline-flex items-center justify-center w-full">
                                            Ảnh gốc
                                            <svg
                                                className="h-5 w-5 ml-2 text-red-700"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </h3>
                                        <div className="w-full aspect-square bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden mx-auto">
                                            <img
                                                src={imageState.imagePreview}
                                                alt="Xem trước ảnh"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    {mode !== "video" && (
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 text-center inline-flex items-center justify-center w-full">
                                            Ảnh sau khi ghép
                                        </h3>
                                    )}
                                    <div
                                        className={`${
                                            mode === "video"
                                                ? "aspect-video"
                                                : "aspect-square"
                                        } bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden shadow-lg`}
                                    >
                                        {mode === "video" ? (
                                            videoState.processedVideoPreview ||
                                            videoState.videoPreview ? (
                                                <video
                                                    src={
                                                        videoState.processedVideoPreview ||
                                                        videoState.videoPreview
                                                    }
                                                    className="w-full h-full object-contain"
                                                    controls
                                                    autoPlay
                                                    muted
                                                />
                                            ) : (
                                                <span className="text-gray-600">
                                                    Không có video để xem trước
                                                </span>
                                            )
                                        ) : imageState.processedImagePreview ||
                                          imageState.imagePreview ? (
                                            <img
                                                src={
                                                    imageState.processedImagePreview ||
                                                    imageState.imagePreview
                                                }
                                                alt="Kết quả ghép trang phục"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-gray-600">
                                                Không có ảnh để xem trước
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`grid grid-cols-1 ${
                                mode === "video"
                                    ? "sm:grid-cols-3"
                                    : "sm:grid-cols-2"
                            } gap-4 mb-8`}
                        >
                            <button
                                onClick={
                                    mode === "video"
                                        ? handleRestartToStep2
                                        : () => setStep(1)
                                }
                                className="bg-gray-300 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center"
                            >
                                <svg
                                    className="h-5 w-5 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                                </svg>
                                Tạo lại
                            </button>
                            <button
                                onClick={handleDownload}
                                className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center"
                            >
                                <Download className="w-4 h-4 mr-1" />
                                Tải xuống
                            </button>
                            {mode === "video" && (
                                <button
                                    onClick={handleContinueToLyrics}
                                    className="bg-red-700 text-white py-3 px-4 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 inline-flex items-center justify-center"
                                >
                                    <svg
                                        className="h-5 w-5 mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M4 11h12.17l5.59 5.59L12 18l8-8-8-8-1.41 1.41L16.17 9H4v2z" />
                                    </svg>
                                    Sáng tác lời
                                </button>
                            )}
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <button
                                onClick={handleRestart}
                                className="text-gray-600 hover:text-gray-800 font-medium inline-flex items-center"
                            >
                                <RotateCw className="w-4 h-4 mr-4" />
                                Bắt đầu lại từ đầu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FaceSwap;
