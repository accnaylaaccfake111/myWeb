import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

class AudioNormalizerService {
    constructor() {
        this.ffmpeg = null;
        this.isLoaded = false;
        this.isLoading = false;
    }

    /**
     * Khởi tạo FFmpeg với phiên bản mới
     */
    async initialize() {
        if (this.isLoaded || this.isLoading) {
            return;
        }

        this.isLoading = true;

        try {
            console.log("🔄 Đang khởi tạo FFmpeg...");

            // Khởi tạo FFmpeg instance mới
            this.ffmpeg = new FFmpeg();

            // Load core
            const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
            this.ffmpeg.on("log", ({ message }) => {
                if (process.env.NODE_ENV === "development") {
                    console.log("FFmpeg log:", message);
                }
            });

            await this.ffmpeg.load({
                coreURL: await toBlobURL(
                    `${baseURL}/ffmpeg-core.js`,
                    "text/javascript",
                ),
                wasmURL: await toBlobURL(
                    `${baseURL}/ffmpeg-core.wasm`,
                    "application/wasm",
                ),
            });

            this.isLoaded = true;
            this.isLoading = false;

            console.log("✅ FFmpeg đã được khởi tạo thành công");
        } catch (error) {
            this.isLoading = false;
            console.error("❌ Lỗi khởi tạo FFmpeg:", error);
            throw new Error(`Không thể khởi tạo FFmpeg: ${error.message}`);
        }
    }

    /**
     * Kiểm tra FFmpeg đã sẵn sàng chưa
     */
    async ensureReady() {
        if (!this.isLoaded && !this.isLoading) {
            await this.initialize();
        }

        if (this.isLoading) {
            await new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (this.isLoaded) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
        }
    }

    /**
     * Chuẩn hóa audio blob - API MỚI
     */
    async normalizeAudio(blob, options = {}) {
        await this.ensureReady();

        const {
            format = "wav",
            sampleRate = 44100,
            channels = 1,
            bitrate = "128k",
            fixDuration = true,
        } = options;

        try {
            console.log("🎵 Bắt đầu chuẩn hóa audio...", {
                inputSize: blob.size,
                inputType: blob.type,
                format,
                sampleRate,
                channels,
            });

            // Đọc file input
            const inputName = `input.${this.getFileExtension(blob.type)}`;
            const outputName = `normalized.${format}`;

            // Sử dụng API mới để write file
            await this.ffmpeg.writeFile(inputName, await fetchFile(blob));

            // Build FFmpeg command với API mới
            const args = [
                "-i",
                inputName,
                "-ac",
                channels.toString(),
                "-ar",
                sampleRate.toString(),
                "-b:a",
                bitrate,
                "-acodec",
                "pcm_s16le",
            ];

            // Thêm options để fix duration
            if (fixDuration) {
                args.push(
                    "-avoid_negative_ts",
                    "make_zero",
                    "-fflags",
                    "+genpts",
                );
            }

            args.push("-y", outputName);

            // Thực thi command với API mới
            await this.ffmpeg.exec(args);

            // Đọc file output với API mới
            const data = await this.ffmpeg.readFile(outputName);
            const normalizedBlob = new Blob([data], {
                type: `audio/${format}`,
            });

            console.log("✅ Chuẩn hóa audio thành công!", {
                inputSize: blob.size,
                outputSize: normalizedBlob.size,
                inputType: blob.type,
                outputType: normalizedBlob.type,
            });

            // Dọn dẹp files
            await this.cleanupFiles([inputName, outputName]);

            return normalizedBlob;
        } catch (error) {
            console.error("❌ Lỗi chuẩn hóa audio:", error);
            throw new Error(`Chuẩn hóa audio thất bại: ${error.message}`);
        }
    }

    /**
     * Sửa metadata và duration cho audio - API MỚI
     */
    async fixAudioMetadata(blob) {
        await this.ensureReady();

        try {
            console.log("🔧 Đang sửa metadata audio...");

            const inputName = "input_meta.webm";
            const outputName = "fixed_meta.wav";

            await this.ffmpeg.writeFile(inputName, await fetchFile(blob));

            // Command đặc biệt để fix metadata và duration
            await this.ffmpeg.exec([
                "-i",
                inputName,
                "-ac",
                "1",
                "-ar",
                "44100",
                "-acodec",
                "pcm_s16le",
                "-avoid_negative_ts",
                "make_zero",
                "-fflags",
                "+genpts",
                "-y",
                outputName,
            ]);

            const data = await this.ffmpeg.readFile(outputName);
            const fixedBlob = new Blob([data], { type: "audio/wav" });

            console.log("✅ Sửa metadata thành công!", {
                originalSize: blob.size,
                fixedSize: fixedBlob.size,
            });

            await this.cleanupFiles([inputName, outputName]);

            return fixedBlob;
        } catch (error) {
            console.error("❌ Lỗi sửa metadata:", error);
            return blob;
        }
    }

    /**
     * Convert audio sang định dạng khác - API MỚI
     */
    async convertAudioFormat(blob, targetFormat = "mp3") {
        await this.ensureReady();

        try {
            console.log(`🔄 Đang convert audio sang ${targetFormat}...`);

            const inputExt = this.getFileExtension(blob.type);
            const inputName = `convert_input.${inputExt}`;
            const outputName = `converted.${targetFormat}`;

            await this.ffmpeg.writeFile(inputName, await fetchFile(blob));

            await this.ffmpeg.exec([
                "-i",
                inputName,
                "-ac",
                "1",
                "-ar",
                "44100",
                "-b:a",
                "128k",
                "-y",
                outputName,
            ]);

            const data = await this.ffmpeg.readFile(outputName);
            const convertedBlob = new Blob([data], {
                type: `audio/${targetFormat}`,
            });

            console.log("✅ Convert audio thành công!", {
                from: blob.type,
                to: convertedBlob.type,
                originalSize: blob.size,
                convertedSize: convertedBlob.size,
            });

            await this.cleanupFiles([inputName, outputName]);

            return convertedBlob;
        } catch (error) {
            console.error("❌ Lỗi convert audio:", error);
            throw error;
        }
    }

    /**
     * Chuẩn hóa audio từ MediaRecorder và fix duration
     */
    async normalizeRecordedAudio(blob, originalDuration = null) {
        try {
            console.log("🎤 Chuẩn hóa audio từ MediaRecorder...");

            // Ưu tiên sử dụng WAV vì có metadata tốt hơn
            const normalizedBlob = await this.normalizeAudio(blob, {
                format: "wav",
                sampleRate: 44100,
                channels: 1,
                bitrate: "128k",
                fixDuration: true,
            });

            // Tạo file với metadata đầy đủ
            const normalizedFile = new File(
                [normalizedBlob],
                `normalized_recording_${Date.now()}.wav`,
                {
                    type: "audio/wav",
                    lastModified: Date.now(),
                },
            );

            return {
                blob: normalizedBlob,
                file: normalizedFile,
                format: "wav",
                sampleRate: 44100,
            };
        } catch (error) {
            console.error("❌ Lỗi chuẩn hóa recorded audio:", error);

            // Fallback: sử dụng blob gốc
            const fallbackFile = new File(
                [blob],
                `fallback_recording_${Date.now()}.webm`,
                {
                    type: blob.type,
                    lastModified: Date.now(),
                },
            );

            return {
                blob: blob,
                file: fallbackFile,
                format: this.getFileExtension(blob.type),
                sampleRate: 44100,
                isFallback: true,
            };
        }
    }

    /**
     * Kiểm tra và sửa audio có duration không hợp lệ
     */
    async validateAndFixAudio(blob) {
        try {
            // Test duration trước
            const testDuration = await this.getAudioDuration(blob);
            console.log("⏱️ Duration test:", testDuration);

            if (this.isValidDuration(testDuration)) {
                console.log("✅ Audio có duration hợp lệ, không cần sửa");
                return {
                    blob,
                    file: new File([blob], `valid_audio_${Date.now()}.webm`, {
                        type: blob.type,
                        lastModified: Date.now(),
                    }),
                    duration: testDuration,
                    neededFix: false,
                };
            }

            console.log("⚠️ Audio có duration không hợp lệ, đang sửa...");
            const fixedResult = await this.normalizeRecordedAudio(blob);
            const fixedDuration = await this.getAudioDuration(fixedResult.blob);

            return {
                ...fixedResult,
                duration: fixedDuration,
                neededFix: true,
                originalDuration: testDuration,
            };
        } catch (error) {
            console.error("❌ Lỗi validate audio:", error);
            throw error;
        }
    }

    /**
     * Lấy duration của audio blob
     */
    async getAudioDuration(blob) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            const url = URL.createObjectURL(blob);

            audio.onloadedmetadata = () => {
                URL.revokeObjectURL(url);
                resolve(audio.duration);
            };

            audio.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Không thể load audio metadata"));
            };

            audio.src = url;
            audio.load();
        });
    }

    /**
     * Kiểm tra duration hợp lệ
     */
    isValidDuration(duration) {
        return (
            Number.isFinite(duration) && duration > 0 && duration < 24 * 60 * 60
        );
    }

    /**
     * Lấy file extension từ MIME type
     */
    getFileExtension(mimeType) {
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
    }

    /**
     * Dọn dẹp files tạm - API MỚI
     */
    async cleanupFiles(fileNames) {
        try {
            for (const fileName of fileNames) {
                try {
                    await this.ffmpeg.deleteFile(fileName);
                } catch (e) {
                    // Ignore errors when deleting
                }
            }
        } catch (error) {
            console.warn("⚠️ Lỗi khi dọn dẹp files:", error);
        }
    }

    /**
     * Hủy FFmpeg instance - API MỚI
     */
    async destroy() {
        if (this.ffmpeg) {
            try {
                await this.ffmpeg.terminate();
            } catch (error) {
                console.warn("⚠️ Lỗi khi hủy FFmpeg:", error);
            }
            this.ffmpeg = null;
        }
        this.isLoaded = false;
        this.isLoading = false;
    }
}

// Tạo instance singleton
const audioNormalizer = new AudioNormalizerService();

export default audioNormalizer;
