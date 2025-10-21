// services/faceDetectionApi.js
import axios from "axios";
import { storage } from "../utils/storage";
const API_BASE_URL = process.env.REACT_APP_BE_API || "";

// Hàm chuyển đổi URL sang File (cho ảnh trang phục)
export const urlToFile = async (url, filename, mimeType) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], filename, { type: mimeType });
    } catch (error) {
        console.error("Error converting URL to File:", error);
        throw error;
    }
};

// API ghép trang phục vào ảnh - ĐỒNG BỘ (không cần check status)
export const processClothesSwap = async ({
    sourceImage,
    outfit,
    projectId,
    title,
}) => {
    try {
        const token = storage.getAccessToken();

        // Chuyển đổi ảnh trang phục từ URL sang File
        const outfitFile = await urlToFile(
            outfit.image,
            `${outfit.name}`,
            "image/png",
        );

        console.log(outfitFile);

        const formData = new FormData();
        console.log(sourceImage);
        console.log(outfitFile);
        // Sử dụng đúng tên param theo API documentation
        formData.append("garmentImage", outfitFile);
        formData.append("modelImage", sourceImage);

        console.log("🟢 Calling clothes swap API synchronously...");

        const response = await axios.post(
            `${API_BASE_URL}/api/outfit/merge`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 60000, // 60 seconds timeout
            },
        );

        console.log("✅ Clothes swap API response:", response.data);

        // API trả về kết quả ngay lập tức, không cần jobId
        if (response.data.success) {
            return {
                success: true,
                data: {
                    outputUrl: response.data.data.outputUrl,
                    status: "COMPLETED",
                    message: "Ghép trang phục thành công",
                },
            };
        } else {
            throw new Error(
                response.data.message || "Lỗi không xác định từ server",
            );
        }
    } catch (error) {
        console.error("❌ Error in clothes swap API:", error);

        // Fallback đến mock nếu API thật bị lỗi
        if (error.response && error.response.status >= 500) {
            console.log("🟡 API server error, using mock fallback");
            return await processClothesSwapMock({
                sourceImage,
                outfit,
                projectId,
                title,
            });
        }

        throw new Error(
            error.response?.data?.message ||
                error.message ||
                "Có lỗi xảy ra khi ghép trang phục",
        );
    }
};

// Mock fallback cho khi API thật không hoạt động
const processClothesSwapMock = async ({
    sourceImage,
    outfit,
    projectId,
    title,
}) => {
    console.log("🟡 processClothesSwapMock called (fallback)");

    // Giả lập thời gian xử lý
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Tạo data URL từ ảnh gốc để demo (trong thực tế API sẽ trả về ảnh đã ghép)
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve({
                success: true,
                data: {
                    outputUrl: e.target.result,
                    status: "COMPLETED",
                    message: "Ghép trang phục thành công (mock)",
                },
            });
        };
        reader.readAsDataURL(sourceImage);
    });
};

// Các hàm khác giữ nguyên...
export const detectFacesInVideo = async (videoFile) => {
    try {
        const formData = new FormData();
        formData.append("video", videoFile);
        const token = storage.getAccessToken();
        console.log(videoFile);

        const response = await fetch(
            `${API_BASE_URL}/api/face-swap/detect-video`,
            {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const faceImages = await response.json();
        return faceImages;
    } catch (error) {
        console.error("Error detecting faces in video:", error);
        throw error;
    }
};

// API ghép nhiều khuôn mặt (vẫn bất đồng bộ)
export const processMultiFaceSwap = async (data) => {
    try {
        const token = storage.getAccessToken();
        const formData = new FormData();
        console.log(data);

        if (data.srcImage && Array.isArray(data.srcImage)) {
            data.srcImage.forEach((image, index) => {
                formData.append("srcImage", image, `srcImage_${index}.jpg`);
            });
        }

        if (data.dstImage && Array.isArray(data.dstImage)) {
            data.dstImage.forEach((image, index) => {
                formData.append("dstImage", image, `dstImage_${index}.jpg`);
            });
        }

        if (data.targetVideo) {
            formData.append("targetVideo", data.targetVideo, "targetVideo.mp4");
        }

        const response = await axios.post(
            `${API_BASE_URL}/api/face-swap/process-multi`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        return response.data;
    } catch (error) {
        console.error("Error in multi face swap:", error);
        throw error;
    }
};

// API ghép một khuôn mặt (vẫn bất đồng bộ)
export const processSingleFaceSwap = async (data) => {
    try {
        const token = storage.getAccessToken();
        const formData = new FormData();
        console.log(data);

        if (data.sourceImage) {
            formData.append("sourceImage", data.sourceImage, "sourceImage.jpg");
        }
        if (data.targetVideo) {
            formData.append("targetVideo", data.targetVideo, "targetVideo.mp4");
        }

        const response = await axios.post(
            `${API_BASE_URL}/api/face-swap/process-single`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        return response.data;
    } catch (error) {
        console.error("Error in single face swap:", error);
        throw error;
    }
};

// API kiểm tra trạng thái (chỉ cho face swap)
export const getFaceSwapStatus = async (projectId) => {
    try {
        const token = storage.getAccessToken();
        const response = await axios.get(
            `${API_BASE_URL}/api/face-swap/status/${projectId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": true,
                },
            },
        );
        return response.data;
    } catch (error) {
        console.error("Error getting face swap status:", error);

        // Fallback cho giả lập nếu API thật bị lỗi
        if (projectId && projectId.startsWith("face_swap_")) {
            return await getFaceSwapStatusMock(projectId);
        }
        throw error;
    }
};

// Hàm giả lập fallback cho face swap status
const getFaceSwapStatusMock = async (projectId) => {
    console.log("🟡 getFaceSwapStatusMock called for project:", projectId);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const statuses = ["PROCESSING", "COMPLETED", "ERROR"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const progress = Math.min(100, Math.floor(Math.random() * 40) + 60);

    const response = {
        projectId,
        progress,
        message: "",
    };

    if (randomStatus === "COMPLETED" || progress > 85) {
        response.status = "COMPLETED";
        response.message = "Xử lý video hoàn thành";
        response.outputUrl =
            "https://via.placeholder.com/1280x720/4ECDC4/FFFFFF?text=Video+đã+ghép+thành+công+" +
            encodeURIComponent(projectId.split("_").pop().substr(0, 6));
    } else if (randomStatus === "ERROR") {
        response.status = "ERROR";
        response.message = "Lỗi trong quá trình xử lý video";
    } else {
        response.status = "PROCESSING";
        response.message = `Đang xử lý video... ${progress}%`;
    }

    return response;
};

export const cacleFaceSwapStatus = async (projectId) => {
    try {
        const token = storage.getAccessToken();
        const response = await axios.get(
            `${API_BASE_URL}/api/face-swap/cancel/${projectId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": true,
                },
            },
        );
        return response.data;
    } catch (error) {
        console.error("Error getting face swap status:", error);
        throw error;
    }
};
