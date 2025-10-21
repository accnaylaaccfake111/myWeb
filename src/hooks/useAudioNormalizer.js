import { useState, useEffect, useRef } from "react";
import audioNormalizer from "../services/audioNormalizer";

const useAudioNormalizer = () => {
    const [isReady, setIsReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Tự động khởi tạo khi hook được sử dụng
        const initialize = async () => {
            try {
                await audioNormalizer.initialize();
                setIsReady(true);
            } catch (err) {
                setError(err.message);
                console.error("❌ Lỗi khởi tạo audio normalizer:", err);
            }
        };

        initialize();

        // Cleanup khi component unmount
        return () => {
            // Không destroy ở đây vì service là singleton
        };
    }, []);

    /**
     * Chuẩn hóa audio với progress tracking
     */
    const normalizeAudio = async (blob, options = {}) => {
        if (!isReady) {
            throw new Error("Audio normalizer chưa sẵn sàng");
        }

        setIsProcessing(true);
        setError(null);
        setProgress(0);

        try {
            // Simulate progress (FFmpeg không có progress event thật)
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return 90;
                    return prev + 10;
                });
            }, 100);

            const result = await audioNormalizer.normalizeRecordedAudio(
                blob,
                options,
            );

            clearInterval(progressInterval);
            setProgress(100);

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsProcessing(false);
            setTimeout(() => setProgress(0), 500);
        }
    };

    /**
     * Validate và fix audio
     */
    const validateAndFixAudio = async (blob) => {
        return await audioNormalizer.validateAndFixAudio(blob);
    };

    /**
     * Convert audio format
     */
    const convertAudio = async (blob, targetFormat) => {
        return await audioNormalizer.convertAudioFormat(blob, targetFormat);
    };

    return {
        // State
        isReady,
        isProcessing,
        progress,
        error,

        // Methods
        normalizeAudio,
        validateAndFixAudio,
        convertAudio,

        // Utilities
        getAudioDuration:
            audioNormalizer.getAudioDuration.bind(audioNormalizer),
        isValidDuration: audioNormalizer.isValidDuration.bind(audioNormalizer),
    };
};

export default useAudioNormalizer;
