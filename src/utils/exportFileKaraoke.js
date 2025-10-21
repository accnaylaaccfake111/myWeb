import { storage } from "./storage";

// Hàm xử lý chung cho các loại file
export const processFileSource = async (source, defaultFileName, type) => {
    let resultFile = null;

    if (source instanceof File) {
        console.log(`✅ ${type} là File object:`, source.name);
        resultFile = source;
    } else if (typeof source === "string") {
        if (source.startsWith("blob:")) {
            resultFile = await convertBlobToFile(source, defaultFileName, type);
        } else {
            resultFile = await downloadFileFromURL(
                source,
                defaultFileName,
                type,
            );
        }
    }

    return resultFile;
};

// Hàm lưu file về thiết bị
export const saveFileToDevice = async (file, fileType) => {
    try {
        // Tạo URL từ file
        const fileUrl = URL.createObjectURL(file);

        // Tạo thẻ a để download
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download =
            file.name ||
            `${fileType}-${Date.now()}.${getFileExtension(file.type)}`;
        a.style.display = "none";

        // Thêm vào DOM và click
        document.body.appendChild(a);
        a.click();

        // Dọn dẹp
        document.body.removeChild(a);
        URL.revokeObjectURL(fileUrl);

        console.log(`💾 Đã lưu file ${fileType}:`, a.download);
    } catch (error) {
        console.error(`❌ Lỗi khi lưu file ${fileType}:`, error);
    }
};

// Hàm lấy extension từ MIME type
const getFileExtension = (mimeType) => {
    const extensions = {
        "video/mp4": "mp4",
        "video/quicktime": "mov",
        "video/x-msvideo": "avi",
        "video/webm": "webm",
        "audio/mpeg": "mp3",
        "audio/wav": "wav",
        "audio/webm": "webm",
        "audio/ogg": "ogg",
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
    };

    return extensions[mimeType] || "bin";
};

// Chuyển đổi blob URL thành File
export const convertBlobToFile = async (blobUrl, fileName, type) => {
    try {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: blob.type });
        console.log(`✅ Đã convert ${type} blob URL thành File:`, file);
        return file;
    } catch (error) {
        console.error(`❌ Lỗi convert ${type} blob URL:`, error);
        return null;
    }
};

// Download file từ URL
export const downloadFileFromURL = async (url, fileName, type) => {
    try {
        console.log(`📹 Đang download ${type} từ URL...`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const blob = await response.blob();

        // Lấy tên file từ URL nếu có
        const urlFileName = url.split("/").pop() || fileName;
        const file = new File([blob], urlFileName, { type: blob.type });

        console.log(`✅ Đã download ${type} từ URL:`, file);
        return file;
    } catch (error) {
        console.error(`❌ Lỗi download ${type}:`, error);
        return null;
    }
};

// Log kết quả export
export const logExportResults = (filesToExport, formData, lyricInfo) => {
    console.log("=== KẾT QUẢ XỬ LÝ FILE ===");
    console.log("📦 FormData entries:");

    for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(
                `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`,
            );
        } else {
            console.log(
                `  ${key}:`,
                typeof value === "string" && value.length > 100
                    ? value.substring(0, 100) + "..."
                    : value,
            );
        }
    }

    console.log("📊 Tổng kết files:");
    console.log("🎵 File nhạc nền:", filesToExport.audioFile);
    console.log("🎤 File thu âm:", filesToExport.recordedFile);
    console.log("📹 File video:", filesToExport.videoFile);
    console.log("📝 Lyric ID:", lyricInfo?.id);
};

// Hàm gọi API merge và tải file về
export const callMergeVideoAPI = async (formData) => {
    try {
        const API_BASE_URL =
            process.env.REACT_APP_BE_API ||
            "https://wavy-supercoincident-artie.ngrok-free.dev";
        const token = storage.getAccessToken();
        console.log("🚀 Đang gọi API /api/merge...");

        const response = await fetch(`${API_BASE_URL}/api/merge`, {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
            },
        });

        console.log("📨 Response status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ API error:", errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        await handleMergeResponse(response);
    } catch (error) {
        console.error("❌ Lỗi gọi API merge:", error);
        alert("Lỗi khi merge video: " + error.message);
        throw error;
    }
};

// Xử lý response từ API
export const handleMergeResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    console.log("📄 Content-Type:", contentType);

    if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        console.log("✅ API response:", result);

        if (result.success && result.data) {
            await downloadMergedVideo(result.data);
        } else {
            throw new Error(result.message || "Merge failed");
        }
    } else {
        console.log("📦 Response là file trực tiếp");
        await downloadMergedVideoFromResponse(response);
    }
};

// Hàm tải video đã merge từ response
const downloadMergedVideoFromResponse = async (response) => {
    try {
        const blob = await response.blob();
        console.log("📥 Received blob:", blob.size, "bytes, type:", blob.type);

        const videoUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = videoUrl;
        a.download = `karaoke-merged-${Date.now()}.mp4`;
        a.style.display = "none";

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(videoUrl);

        console.log("✅ Đã tải file video thành công!");
        alert("🎉 Tải video thành công! File đang được tải về.");
    } catch (error) {
        console.error("❌ Lỗi tải file:", error);
        throw error;
    }
};

// Hàm tải video từ URL hoặc base64 data
const downloadMergedVideo = async (videoData) => {
    try {
        if (typeof videoData === "string") {
            if (videoData.startsWith("http")) {
                console.log("🌐 Downloading from URL:", videoData);
                const response = await fetch(videoData);
                await downloadMergedVideoFromResponse(response);
            } else if (videoData.startsWith("data:")) {
                console.log("📄 Processing base64 data");
                const response = await fetch(videoData);
                await downloadMergedVideoFromResponse(response);
            } else {
                console.log("🔤 Processing base64 string");
                const binaryString = atob(videoData);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: "video/mp4" });
                const response = new Response(blob);
                await downloadMergedVideoFromResponse(response);
            }
        } else {
            console.warn("⚠️ Unknown video data format:", videoData);
            alert("Merge thành công nhưng không thể xác định định dạng video.");
        }
    } catch (error) {
        console.error("❌ Lỗi xử lý video data:", error);
        throw error;
    }
};
