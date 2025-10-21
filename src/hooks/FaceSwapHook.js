import { useState, useEffect, useCallback, useRef } from "react";
import {
    processMultiFaceSwap,
    processSingleFaceSwap,
    getFaceSwapStatus,
    processClothesSwap,
    detectFacesInVideo,
} from "../services/faceDetectionApi";

export const useApiStatusPolling = () => {
    const [isPolling, setIsPolling] = useState(false);
    const pollingRef = useRef(null);
    const abortControllerRef = useRef(null);

    const startPolling = useCallback(
        (projectId, onStatusUpdate, onComplete, onError) => {
            // Dừng polling hiện tại nếu có
            stopPolling();

            abortControllerRef.current = new AbortController();
            setIsPolling(true);

            let attemptCount = 0;
            const maxAttempts = 60; // 5 phút với interval 5 giây

            const checkStatus = async () => {
                if (attemptCount >= maxAttempts) {
                    onError(new Error("Quá thời gian chờ xử lý"));
                    stopPolling();
                    return;
                }

                try {
                    const statusResponse = await getFaceSwapStatus(projectId, {
                        signal: abortControllerRef.current?.signal,
                    });

                    attemptCount++;

                    if (statusResponse.status === "COMPLETED") {
                        onComplete(statusResponse);
                        stopPolling();
                    } else if (statusResponse.status === "PROCESSING") {
                        onStatusUpdate(statusResponse);
                        // Tiếp tục polling với interval 5 giây
                        pollingRef.current = setTimeout(checkStatus, 2000);
                    } else if (statusResponse.status === "ERROR") {
                        onError(
                            new Error(statusResponse.message || "Lỗi xử lý"),
                        );
                        stopPolling();
                    }
                } catch (error) {
                    if (error.name !== "AbortError") {
                        onError(error);
                        stopPolling();
                    }
                }
            };

            // Bắt đầu polling ngay lập tức
            checkStatus();
        },
        [],
    );

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearTimeout(pollingRef.current);
            pollingRef.current = null;
        }
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsPolling(false);
    }, []);

    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    return {
        isPolling,
        startPolling,
        stopPolling,
    };
};


// Hook quản lý state cho xử lý video
export const useVideoProcessing = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [processedVideoPreview, setProcessedVideoPreview] = useState(null);
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const [detectedFaces, setDetectedFaces] = useState([]);
    const [selectedFaceId, setSelectedFaceId] = useState(null);

    return {
        videoFile,
        setVideoFile,
        videoPreview,
        setVideoPreview,
        processedVideoPreview,
        setProcessedVideoPreview,
        isAnalyzed,
        setIsAnalyzed,
        detectedFaces,
        setDetectedFaces,
        selectedFaceId,
        setSelectedFaceId,
    };
};

// Hook quản lý state cho xử lý ảnh
export const useImageProcessing = () => {
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [processedImagePreview, setProcessedImagePreview] = useState(null);

    return {
        imageFile,
        setImageFile,
        imagePreview,
        setImagePreview,
        processedImagePreview,
        setProcessedImagePreview,
    };
};

// Hook quản lý state chung
export const useCommonProcessing = () => {
    const [faceImages, setFaceImages] = useState({});
    const [faceImagePreviews, setFaceImagePreviews] = useState({});
    const [selectedOutfit, setSelectedOutfit] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [projectId, setProjectId] = useState(null);
    const [processingStatus, setProcessingStatus] = useState("");

    return {
        faceImages,
        setFaceImages,
        faceImagePreviews,
        setFaceImagePreviews,
        selectedOutfit,
        setSelectedOutfit,
        isProcessing,
        setIsProcessing,
        isDragging,
        setIsDragging,
        error,
        setError,
        projectId,
        setProjectId,
        processingStatus,
        setProcessingStatus,
    };
};

// Hook xử lý file với abort controller
export const useFileHandlers = (videoState, imageState, commonState, setMode) => {
    const {
        setVideoFile,
        setVideoPreview,
        setProcessedVideoPreview,
        setIsAnalyzed,
        setDetectedFaces,
        setSelectedFaceId,
    } = videoState;

    const { setImageFile, setImagePreview, setProcessedImagePreview } =
        imageState;

    const { setFaceImages, setFaceImagePreviews, setError, setProjectId } =
        commonState;

    const handleVideoUpload = useCallback(
        (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith("video/")) {
                setVideoFile(file);
                setVideoPreview(URL.createObjectURL(file));
                setProcessedVideoPreview(null);
                setIsAnalyzed(false);
                setDetectedFaces([]);
                setSelectedFaceId(null);
                setFaceImages({});
                setFaceImagePreviews({});
                setError(null);
                setProjectId(null);
                setMode("video");
            }
        },
        [
            setVideoFile,
            setVideoPreview,
            setProcessedVideoPreview,
            setIsAnalyzed,
            setDetectedFaces,
            setSelectedFaceId,
            setFaceImages,
            setFaceImagePreviews,
            setError,
            setProjectId,
            setMode,
        ],
    );

    const handleImageUpload = useCallback(
        (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith("image/")) {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
                setProcessedImagePreview(null);
                setError(null);
                setMode("image");
            }
        },
        [
            setImageFile,
            setImagePreview,
            setProcessedImagePreview,
            setError,
            setMode,
        ],
    );

    const handleFaceFileUpload = useCallback(
        (file, faceId) => {
            const previewUrl = URL.createObjectURL(file);
            setFaceImages((prev) => ({ ...prev, [faceId]: file }));
            setFaceImagePreviews((prev) => ({
                ...prev,
                [faceId]: previewUrl,
            }));
        },
        [setFaceImages, setFaceImagePreviews],
    );

    const handleFaceUpload = useCallback(
        (e, selectedFaceId) => {
            const file = e.target.files[0];
            if (file && selectedFaceId) {
                handleFaceFileUpload(file, selectedFaceId);
            }
        },
        [handleFaceFileUpload],
    );

    const handleRemoveFaceImage = useCallback(
        (faceId) => {
            setFaceImages((prev) => {
                const newImages = { ...prev };
                delete newImages[faceId];
                return newImages;
            });
            setFaceImagePreviews((prev) => {
                const newPreviews = { ...prev };
                if (newPreviews[faceId]) {
                    URL.revokeObjectURL(newPreviews[faceId]);
                }
                delete newPreviews[faceId];
                return newPreviews;
            });
        },
        [setFaceImages, setFaceImagePreviews],
    );

    return {
        handleVideoUpload,
        handleImageUpload,
        handleFaceFileUpload,
        handleFaceUpload,
        handleRemoveFaceImage,
    };
};

// Hook xử lý phân tích video với abort controller
export const useVideoAnalysis = (videoState, commonState, setStep) => {
    const { videoFile, setDetectedFaces, setIsAnalyzed, setSelectedFaceId } =
        videoState;
    const { setIsProcessing, setError } = commonState;
    const abortControllerRef = useRef(null);

    const handleAnalyzeVideo = useCallback(async () => {
        if (!videoFile) {
            setError("Vui lòng chọn video trước khi phân tích");
            return;
        }

        // Hủy request trước đó nếu có
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setIsProcessing(true);
        setError(null);
        setStep(1.5);

        try {
            const faceBase64Array = await detectFacesInVideo(videoFile, {
                signal: abortControllerRef.current.signal,
            });

            if (faceBase64Array && faceBase64Array.length > 0) {
                const faces = faceBase64Array.map((base64, index) => {
                    const dataUrl = `data:image/jpeg;base64,${base64}`;

                    const byteCharacters = atob(base64);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const faceFile = new File(
                        [byteArray],
                        `face_${index + 1}.jpg`,
                        { type: "image/jpeg" },
                    );

                    return {
                        id: index + 1,
                        name: `Khuôn mặt ${index + 1}`,
                        base64: base64,
                        dataUrl: dataUrl,
                        file: faceFile,
                    };
                });

                setDetectedFaces(faces);
                setIsAnalyzed(true);
                setStep(2);
                setSelectedFaceId(faces[0]?.id || null);
            } else {
                setError("Không tìm thấy khuôn mặt nào trong video");
                setStep(1);
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Error analyzing video:", error);
                setError(
                    "Có lỗi xảy ra khi phân tích video. Vui lòng thử lại.",
                );
                setStep(1);
            }
        } finally {
            setIsProcessing(false);
            abortControllerRef.current = null;
        }
    }, [
        videoFile,
        setDetectedFaces,
        setIsAnalyzed,
        setSelectedFaceId,
        setIsProcessing,
        setError,
        setStep,
    ]);

    // Cleanup khi unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        handleAnalyzeVideo,
    };
};

// Hook xử lý ghép mặt cho video với polling
export const useVideoFaceSwap = (videoState, commonState, setStep) => {
    const { videoFile, setProcessedVideoPreview } = videoState;
    const {
        faceImages,
        selectedOutfit,
        setIsProcessing,
        setError,
        setProjectId,
        setProcessingStatus,
    } = commonState;

    const { startPolling, stopPolling, isPolling } = useApiStatusPolling();

    const handleProcessFaceSwap = useCallback(async () => {
        if (!videoFile) {
            setError("Vui lòng chọn video");
            return;
        }

        const hasFaceImages = Object.keys(faceImages).length > 0;
        const hasOutfit = selectedOutfit !== null;

        if (!hasFaceImages && !hasOutfit) {
            setError(
                "Vui lòng chọn ít nhất một khuôn mặt để ghép hoặc một trang phục",
            );
            return;
        }

        setIsProcessing(true);
        setError(null);
        setStep(2.5);
        setProcessingStatus("Đang khởi tạo...");

        try {
            let response;
            const faceCount = Object.keys(faceImages).length;

            if (faceCount === 1) {
                const selectedFaceId = Object.keys(faceImages)[0];
                const sourceImage = faceImages[selectedFaceId];

                response = await processSingleFaceSwap({
                    sourceImage: sourceImage,
                    targetVideo: videoFile,
                    projectId: "",
                    title: `Face Swap Project ${new Date().toLocaleString()}`,
                    outfit: selectedOutfit?.name || null,
                });
            } else if (faceCount > 1) {
                const srcImageArray = videoState.detectedFaces.map((v) => {
                    return v.file;
                });
                const dstImage = Object.values(faceImages).map((value) => {
                    return value;
                });
                console.log(dstImage);
                console.log(srcImageArray);
                response = await processMultiFaceSwap({
                    srcImage: srcImageArray,
                    dstImage: dstImage,
                    targetVideo: videoFile,
                    projectId: "",
                    outfit: selectedOutfit?.name || null,
                });
            } else {
                // Chỉ xử lý trang phục
                setProcessingStatus("Đang xử lý trang phục...");
                // Giả lập xử lý trang phục
                await new Promise((resolve) => setTimeout(resolve, 3000));
                setIsProcessing(false);
                setProcessedVideoPreview(videoState.videoPreview);
                setStep(3);
                return;
            }

            if (response && response.success) {
                const newProjectId = response.data.jobId;
                setProjectId(newProjectId);
                setProcessingStatus("Đã bắt đầu xử lý...");

                // Bắt đầu polling
                startPolling(
                    newProjectId,
                    (statusResponse) => {
                        const progress = statusResponse.progress || 0;
                        setProcessingStatus(
                            statusResponse.message ||
                                `Đang xử lý... ${progress}%`,
                        );
                    },
                    (completedResponse) => {
                        setIsProcessing(false);
                        setProcessingStatus("Hoàn thành");

                        if (completedResponse.outputFile) {
                            setProcessedVideoPreview(
                                URL.createObjectURL(
                                    completedResponse.outputFile,
                                ),
                            );
                        } else if (completedResponse.outputUrl) {
                            setProcessedVideoPreview(
                                completedResponse.outputUrl,
                            );
                        } else {
                            console.error("No output file or URL in response");
                        }
                        setStep(3);
                    },
                    (error) => {
                        setIsProcessing(false);
                        setError(`Lỗi xử lý: ${error.message}`);
                        setStep(2);
                    },
                );
            } else {
                throw new Error(
                    response?.message || "Không nhận được phản hồi từ server",
                );
            }
        } catch (error) {
            console.error("Error processing face swap:", error);
            setError(`Có lỗi xảy ra khi xử lý video: ${error.message}`);
            setIsProcessing(false);
            setStep(2);
        }
    }, [
        videoFile,
        faceImages,
        selectedOutfit,
        setIsProcessing,
        setError,
        setStep,
        setProcessingStatus,
        setProjectId,
        setProcessedVideoPreview,
        videoState.videoPreview,
        startPolling,
    ]);

    const cancelProcessing = useCallback(() => {
        stopPolling();
        setIsProcessing(false);
        setStep(2);
        setProcessingStatus("");
        setError("Đã hủy quá trình xử lý");
    }, [stopPolling, setIsProcessing, setStep, setProcessingStatus, setError]);

    return {
        handleProcessFaceSwap,
        cancelProcessing,
        isPolling,
    };
};

// Hook xử lý ghép trang phục cho ảnh - ĐỒNG BỘ
export const useImageClothesSwap = (imageState, commonState, setStep) => {
    const { imageFile, setProcessedImagePreview } = imageState;
    const { selectedOutfit, setIsProcessing, setError, setProcessingStatus } =
        commonState;
    const abortControllerRef = useRef(null);

    const handleProcessClothesSwap = useCallback(async () => {
        if (!imageFile) {
            setError("Vui lòng chọn ảnh");
            return;
        }

        if (!selectedOutfit) {
            setError("Vui lòng chọn trang phục");
            return;
        }

        // Hủy request trước đó nếu có
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setIsProcessing(true);
        setError(null);
        setStep(2.5);
        setProcessingStatus("Đang ghép trang phục...");

        try {
            const response = await processClothesSwap(
                {
                    sourceImage: imageFile,
                    outfit: selectedOutfit,
                    projectId: "",
                    title: `Clothes Swap Project ${new Date().toLocaleString()}`,
                },
                {
                    signal: abortControllerRef.current.signal,
                },
            );

            if (response && response.success) {
                console.log("✅ Clothes swap completed:", response.data);

                if (response.data.outputFile) {
                    setProcessedImagePreview(
                        URL.createObjectURL(response.data.outputFile),
                    );
                } else if (response.data.outputUrl) {
                    setProcessedImagePreview(response.data.outputUrl);
                } else {
                    throw new Error("Không có kết quả trả về từ server");
                }

                setStep(3);
            } else {
                throw new Error(
                    response?.message || "Không nhận được phản hồi từ server",
                );
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Error processing clothes swap:", error);
                setError(`Có lỗi xảy ra khi ghép trang phục: ${error.message}`);
                setStep(2);
            }
        } finally {
            setIsProcessing(false);
            setProcessingStatus("");
            abortControllerRef.current = null;
        }
    }, [
        imageFile,
        selectedOutfit,
        setIsProcessing,
        setError,
        setStep,
        setProcessingStatus,
        setProcessedImagePreview,
    ]);

    // Cleanup khi unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        handleProcessClothesSwap,
    };
};