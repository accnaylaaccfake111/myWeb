/**
 * Utility functions for audio handling
 */

/**
 * Tạo audio element từ blob và lấy duration
 */
export const getAudioDuration = (blob) => {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        const url = URL.createObjectURL(blob);

        const cleanup = () => {
            URL.revokeObjectURL(url);
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("error", onError);
        };

        const onLoaded = () => {
            cleanup();
            resolve(audio.duration);
        };

        const onError = (error) => {
            cleanup();
            reject(new Error(`Không thể load audio: ${error.message}`));
        };

        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("error", onError);
        audio.src = url;
        audio.load();
    });
};

/**
 * Kiểm tra duration hợp lệ
 */
export const isValidDuration = (duration) => {
    return Number.isFinite(duration) && duration > 0 && duration < 24 * 60 * 60;
};

/**
 * Tạo file từ blob với metadata đầy đủ
 */
export const createAudioFile = (blob, filename = null) => {
    const extension = getFileExtension(blob.type);
    const name = filename || `audio_${Date.now()}.${extension}`;

    return new File([blob], name, {
        type: blob.type,
        lastModified: Date.now(),
    });
};

/**
 * Lấy file extension từ MIME type
 */
export const getFileExtension = (mimeType) => {
    const extensions = {
        "audio/webm;codecs=opus": "webm",
        "audio/webm": "webm",
        "audio/mp4;codecs=mp4a": "m4a",
        "audio/ogg;codecs=opus": "ogg",
        "audio/mp3": "mp3",
        "audio/wav": "wav",
        "audio/x-wav": "wav",
    };

    return extensions[mimeType] || "webm";
};

/**
 * Ước tính duration dựa trên kích thước file
 */
export const estimateDuration = (blob, bitrate = 128000) => {
    const sizeInBits = blob.size * 8;
    return sizeInBits / bitrate;
};

export default {
    getAudioDuration,
    isValidDuration,
    createAudioFile,
    getFileExtension,
    estimateDuration,
};
