import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchSheetMusicProjects, getFaceData } from "../services/getDataApi";
import { formatLyrics } from "../utils/util";
import { Link } from "react-router-dom";

// Components
import ProjectSelection from "../components/karaoke/ProjectSelection";
import KaraokeDisplay from "../components/karaoke/KaraokeDisplay";
import ScoreDisplay from "../components/karaoke/ScoreDisplay";
import { storage } from "../utils/storage";
import useAudioNormalizer from "../hooks/useAudioNormalizer";

import {
    processFileSource,
    callMergeVideoAPI,
} from "../utils/exportFileKaraoke";
import {
    FolderOpen,
    CheckCircle2,
    Upload,
    ChevronDown,
    RotateCw,
    Mic,
    AlertTriangle,
    AlertCircle,
    Music,
    Play,
    Square,
    Circle,
    Save,
    Download,
    ArrowLeft,
} from "lucide-react";

const LoginPrompt = ({ location }) => {
    return (
        <div className="flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 w-full max-w-md">
                <div className="text-5xl mb-6 text-red-600 animate-bounce">
                    <Mic className="w-12 h-12 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                    Vui lòng đăng nhập
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                    Bạn cần đăng nhập để truy cập chức năng karaoke
                </p>
                <Link
                    to="/login"
                    state={{
                        from: location.pathname,
                        lyrics: location.state?.lyrics,
                        theme: location.state?.theme,
                        musicUrl: location.state?.musicUrl,
                    }}
                    className="block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 text-center"
                >
                    Đăng nhập
                </Link>
            </div>
        </div>
    );
};

const Karaoke = ({ isLoggedIn }) => {
    const [step, setStep] = useState(isLoggedIn ? 1 : 0);
    const [selectedProject, setSelectedProject] = useState(null);
    const [lyrics, setLyrics] = useState("");
    const [currentWordIndex, setCurrentWordIndex] = useState({
        line: 0,
        word: 0,
        index: 0,
    });
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [score, setScore] = useState(null);
    const [currentProjectPage, setCurrentProjectPage] = useState(0);
    const [audioFile, setAudioFile] = useState(null);
    const [audioElement, setAudioElement] = useState(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const [currentAudioTime, setCurrentAudioTime] = useState(0);
    const [isAudioLoaded, setIsAudioLoaded] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const [audioError, setAudioError] = useState(null);
    const [showAudioModal, setShowAudioModal] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedAudio, setRecordedAudio] = useState(null);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [recordedFile, setRecordedFile] = useState(null);
    const [wordTimings, setWordTimings] = useState([]);
    const [currentTimingIndex, setCurrentTimingIndex] = useState(0);
    const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [voiceAnalysis, setVoiceAnalysis] = useState(null);
    const [existingProjects, setExistingProjects] = useState([
        {
            id: 1,
            name: "Mùa xuân ơi",
            type: "Karaoke và Chấm điểm",
            date: "21/8/2025",
            genre: "Dân ca Bắc Bộ",
            difficulty: "Trung bình",
            rating: 3,
            lyrics: `Mùa xuân ơi, đến rồi đây
Cánh hoa đào nở, đất trời say
Nắng vàng rải nhẹ trên từng cành lá
Mùa xuân về, lòng người xốn xang

Xuân sang mang theo bao ước mơ
Đong đầy hạnh phúc, chờ mong tết
Cùng nhau đón xuân, vui bên gia đình
Mùa xuân của em, thật diệu kỳ`,
            audio: "/audio/mua-xuan-oi.mp3",
            isSaved: true,
        },
        {
            id: 2,
            name: "Sân trường rộn rã",
            type: "Karaoke và Chấm điểm",
            date: "20/8/2025",
            genre: "Dân ca hiện đại",
            difficulty: "Dễ",
            rating: 2,
            lyrics: `Sân trường rộn rã tiếng cười
Trang sách mở ra bao điều mới
Thầy cô dìu dắt từng bước chúng em
Con đò tri thức đưa bao thế hệ`,
            audio: "/audio/san-truong-ron-ra.mp3",
            isSaved: true,
        },
    ]);
    const [comboCount, setComboCount] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const [recordingError, setRecordingError] = useState(null);
    const [recordingStatus, setRecordingStatus] = useState("idle");
    const [listVideo, setListVideo] = useState([]);
    const [videoSelect, setVideoSelect] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Refs
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const animationFrameRef = useRef(null);
    const audioUrlRef = useRef(null);
    const videoRef = useRef(null);
    const countdownRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordingCompletedRef = useRef(false); // Thêm ref để theo dõi trạng thái hoàn thành thu âm

    const navigate = useNavigate();
    const location = useLocation();
    const API_BASE_URL =
        process.env.REACT_APP_BE_API ||
        "https://wavy-supercoincident-artie.ngrok-free.dev";

    const {
        normalizeAudio,
    } = useAudioNormalizer();

    // Data fetching
    useEffect(() => {
        checkMicrophonePermission();
        fetchInitialData();
        return cleanup;
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const faceData = (await getFaceData())?.data;
            fetchSheetMusicProjects(
                setData,
                () => {},
                () => {},
            );
            setListVideo(faceData);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
        setIsLoading(false);
    };

    const setData = async (d) => {
        const listMap = d
            .filter((x) => x.audioFile && x.lyrics)
            .map((v) => ({
                id: v.id,
                name: v.title,
                date: v.createdAt,
                rating: 2,
                lyrics: formatLyrics(v.lyrics),
                audio: v.audioFile,
                isSaved: true,
            }));
        setExistingProjects(listMap);
    };

    const cleanup = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
        }
        stopRecordingAndAudio();
        if (recordedAudio) URL.revokeObjectURL(recordedAudio);
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
    };

    // Authentication effect
    useEffect(() => {
        if (!isLoggedIn) {
            setStep(0);
            stopRecordingAndAudio();
            setSelectedProject(null);
            setLyrics("");
            setCurrentWordIndex({ line: 0, word: 0, index: 0 });
            setScore(null);
            setCurrentProjectPage(0);
            setAudioFile(null);
        } else {
            setStep(1);
        }
    }, [isLoggedIn]);

    // Lyrics composition effect
    useEffect(() => {
        if (location.state?.lyrics) {
            handleLyricsFromComposition(location.state);
        }
    }, [location.state]);

    const handleLyricsFromComposition = (state) => {
        const newProject = {
            id: Date.now(),
            name: `Bài hát vừa sáng tác - Chủ đề: ${
                state.theme || "Tùy chỉnh"
            }`,
            date: new Date().toLocaleDateString("vi-VN"),
            rating: 3,
            lyrics: state.lyrics,
            audio: state.musicUrl || null,
            video: videoSelect || state.video || null,
            isSaved: false,
        };
        setExistingProjects((prev) => [newProject, ...prev]);
        setSelectedProject(newProject);
        setLyrics(state.lyrics);
        if (state.musicUrl) {
            setAudioFile(state.musicUrl);
        } else {
            setShowAudioModal(true);
        }
        setStep(2);
    };

    // Audio initialization
    useEffect(() => {
        if (audioFile) {
            initializeAudio();
        } else {
            resetAudioState();
        }
        return () => {
            if (audioElement) {
                audioElement.pause();
            }
        };
    }, [audioFile]);

    const initializeAudio = () => {
        setAudioLoading(true);
        setAudioError(null);

        const audio = new Audio();
        audio.preload = "metadata";

        const handleLoadedMetadata = () => {
            setAudioDuration(audio.duration);
            setIsAudioLoaded(true);
            setAudioLoading(false);
        };

        const handleError = (e) => {
            console.error("Lỗi tải audio:", e);
            setAudioError(
                "Không thể tải file audio. Vui lòng kiểm tra đường dẫn hoặc tải file khác.",
            );
            setAudioLoading(false);
            setIsAudioLoaded(false);
            setShowAudioModal(true);
        };

        const handleTimeUpdate = () => setCurrentAudioTime(audio.currentTime);
        const handleEnded = () => {
            setIsAnalyzing(true);
            stopRecordingAndAudio();
            generateScore();
        };

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("error", handleError);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);

        setupAudioSource(audio);
        setAudioElement(audio);

        return () => {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("error", handleError);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
        };
    };

    const setupAudioSource = (audio) => {
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);

        if (typeof audioFile === "string" && audioFile.startsWith("blob:")) {
            audioUrlRef.current = audioFile;
            audio.src = audioFile;
        } else if (typeof audioFile === "string") {
            audio.src = audioFile;
        } else if (audioFile instanceof File) {
            const url = URL.createObjectURL(audioFile);
            audioUrlRef.current = url;
            audio.src = url;
        }
    };

    const resetAudioState = () => {
        setAudioElement(null);
        setAudioDuration(0);
        setCurrentAudioTime(0);
        setIsAudioLoaded(false);
        setAudioLoading(false);
    };

    useEffect(() => {
        if (videoRef.current) videoRef.current?.pause();
    }, [videoRef]);

    // Word timings calculation
    useEffect(() => {
        if (lyrics && audioDuration > 0) {
            const timings = calculateWordTimings();
            setWordTimings(timings);
        }
    }, [lyrics, audioDuration]);

    // Thêm hàm này để kiểm tra timings
    const validateTimings = (timings, audioDuration) => {
        if (timings.length === 0) return;

        const lastTiming = timings[timings.length - 1];
        console.log(`Audio duration: ${audioDuration}s`);
        console.log(`Last word ends at: ${lastTiming.endTime}s`);
        console.log(
            `Within audio duration: ${lastTiming.endTime <= audioDuration}`,
        );

        // Kiểm tra xem có timing nào vượt quá không
        const exceededTimings = timings.filter(
            (t) => t.endTime > audioDuration,
        );
        if (exceededTimings.length > 0) {
            console.warn(
                `${exceededTimings.length} timings exceed audio duration`,
            );
        }
    };

    // Gọi hàm kiểm tra sau khi tính toán timings
    useEffect(() => {
        if (lyrics && audioDuration > 0) {
            const timings = calculateWordTimings();
            setWordTimings(timings);
            validateTimings(timings, audioDuration); // Kiểm tra
        }
    }, [lyrics, audioDuration]);

    const calculateWordTimings = () => {
        if (!lyrics || !audioDuration) return [];

        const lines = lyrics.split("\n").filter((line) => line.trim() !== "");
        const allWords = lines.flatMap((line) =>
            line.split(" ").filter((word) => word.trim() !== ""),
        );

        if (allWords.length === 0) return [];

        const totalSyllables = allWords.reduce((total, word) => {
            const vietnameseVowels =
                /[aeiouyăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/gi;
            const matches = word.match(vietnameseVowels);
            return total + (matches ? matches.length : 1);
        }, 0);

        const availableDuration = audioDuration;
        const timePerSyllable = availableDuration / Math.max(totalSyllables, 1);

        let currentTime = 0;
        const timings = [];

        lines.forEach((line, lineIndex) => {
            const words = line.split(" ").filter((word) => word.trim() !== "");

            words.forEach((word, wordInLineIndex) => {
                // KIỂM TRA KHÔNG VƯỢT QUÁ THỜI LƯỢNG AUDIO
                if (currentTime >= audioDuration) return;

                const syllableCount =
                    word.match(
                        /[aeiouyăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]+/gi,
                    )?.length || 1;
                const wordDuration = syllableCount * timePerSyllable;

                // ĐẢM BẢO END TIME KHÔNG VƯỢT QUÁ AUDIO DURATION
                const endTime = Math.min(
                    currentTime + wordDuration,
                    audioDuration,
                );

                timings.push({
                    line: lineIndex,
                    word: wordInLineIndex,
                    startTime: currentTime,
                    endTime: endTime,
                    word: word,
                });

                currentTime = endTime;
            });

            // THÊM KHOẢNG NGHỈ GIỮA CÁC DÒNG, NHƯNG KHÔNG VƯỢT QUÁ
            if (lineIndex < lines.length - 1 && currentTime < audioDuration) {
                const lineBreakDuration = timePerSyllable * 0.8;
                currentTime = Math.min(
                    currentTime + lineBreakDuration,
                    audioDuration,
                );
            }
        });
        console.log(timings);

        return timings;
    };

    // Lyrics synchronization
    useEffect(() => {
        const updateLyrics = () => {
            if (isPlaying && audioElement && wordTimings.length > 0) {
                const currentTime = audioElement.currentTime;
                const foundIndex = findCurrentWordIndex(currentTime);

                if (foundIndex !== -1 && foundIndex !== currentTimingIndex) {
                    updateCurrentWord(foundIndex, currentTime);
                }
                animationFrameRef.current = requestAnimationFrame(updateLyrics);
            }
        };

        if (isPlaying) {
            animationFrameRef.current = requestAnimationFrame(updateLyrics);
        } else {
            if (animationFrameRef.current)
                cancelAnimationFrame(animationFrameRef.current);
        }

        return () => {
            if (animationFrameRef.current)
                cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isPlaying, audioElement, wordTimings, currentTimingIndex]);

    const findCurrentWordIndex = (currentTime) => {
        for (
            let i = Math.max(0, currentTimingIndex - 2);
            i < wordTimings.length;
            i++
        ) {
            if (
                currentTime >= wordTimings[i].startTime &&
                currentTime < wordTimings[i].endTime
            ) {
                return i;
            }
        }
        for (let i = wordTimings.length - 1; i >= 0; i--) {
            if (currentTime >= wordTimings[i].startTime) {
                return i;
            }
        }
        return -1;
    };

    const updateCurrentWord = (foundIndex, currentTime) => {
        const timingAccuracy = calculateTimingAccuracyForWord(
            foundIndex,
            currentTime,
        );

        setComboCount((prev) => {
            const newCombo = timingAccuracy === "miss" ? 0 : prev + 1;
            if (newCombo > maxCombo) setMaxCombo(newCombo);
            return newCombo;
        });

        setCurrentTimingIndex(foundIndex);
        setCurrentWordIndex({
            line: wordTimings[foundIndex].line,
            word: wordTimings[foundIndex].word,
            index: foundIndex,
        });
    };

    const calculateTimingAccuracyForWord = (wordIndex, currentTime) => {
        const wordTiming = wordTimings[wordIndex];
        if (!wordTiming) return "good";

        const wordCenter = (wordTiming.startTime + wordTiming.endTime) / 2;
        const deviation = Math.abs(currentTime - wordCenter);
        const wordDuration = wordTiming.endTime - wordTiming.startTime;

        if (deviation < wordDuration * 0.2) return "perfect";
        if (deviation < wordDuration * 0.4) return "good";
        return "miss";
    };

    // Audio control functions
    const playAudio = () => {
        if (audioElement) {
            audioElement.play().catch((error) => {
                console.error("Error playing audio:", error);
                alert("Có lỗi khi phát nhạc. Vui lòng thử lại.");
            });
        }
        if (videoRef.current) videoRef.current?.play();
    };

    const pauseAudio = () => {
        if (audioElement) audioElement.pause();
        if (videoRef.current) videoRef.current?.pause();
    };

    const stopAudio = () => {
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
            setCurrentAudioTime(0);
        }
    };

    // Recording functions - FIXED VERSION
    const checkMicrophonePermission = async () => {
        try {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                console.error("Trình duyệt không hỗ trợ MediaDevices");
                setIsMicrophoneAvailable(false);
                return false;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
            });

            stream.getTracks().forEach((track) => track.stop());

            setIsMicrophoneAvailable(true);
            return true;
        } catch (error) {
            console.error("Không thể truy cập microphone:", error);
            setIsMicrophoneAvailable(false);
            return false;
        }
    };

    const initAudioRecording = async () => {
        try {
            setRecordingError(null);
            console.log("🔄 Đang khởi tạo thu âm...");

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    channelCount: 1,
                    sampleRate: 44100,
                    bitrate: 128000,
                },
            });

            streamRef.current = stream;

            // ƯU TIÊN ĐỊNH DẠNG CÓ METADATA TỐT HƠN
            const mimeTypes = [
                "audio/webm;codecs=opus",
                "audio/mp4;codecs=mp4a",
                "audio/ogg;codecs=opus",
                "audio/webm",
            ];

            let supportedType = "";
            for (const mimeType of mimeTypes) {
                if (MediaRecorder.isTypeSupported(mimeType)) {
                    supportedType = mimeType;
                    break;
                }
            }

            console.log("🎯 Định dạng được chọn:", supportedType);

            const recorder = new MediaRecorder(stream, {
                mimeType: supportedType,
                audioBitsPerSecond: 128000,
            });

            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                console.log("📹 Nhận dữ liệu thu âm:", e.data.size, "bytes");
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                console.log("⏹️ Đã dừng thu âm, tạo file...");

                if (audioChunksRef.current.length === 0) {
                    console.error("❌ Không có dữ liệu thu âm");
                    setRecordingError("Không có dữ liệu thu âm được ghi lại");
                    return;
                }

                const blobType = supportedType || "audio/webm;codecs=opus";
                const blob = new Blob(audioChunksRef.current, {
                    type: blobType,
                });

                console.log("✅ Blob được tạo:", {
                    size: blob.size,
                    type: blob.type,
                });

                // TẠO FILE VỚI METADATA ĐẦY ĐỦ
                const fileExtension = getFileExtension(blobType);
                const audioFile = new File(
                    [blob],
                    `recording_${Date.now()}.${fileExtension}`,
                    {
                        type: blobType,
                        lastModified: Date.now(),
                    },
                );

                const audioUrl = URL.createObjectURL(blob);

                // THÊM KIỂM TRA VÀ SỬA METADATA
                fixAudioMetadata(blob)
                    .then((fixedBlob) => {
                        const fixedAudioFile = new File(
                            [fixedBlob],
                            `recording_${Date.now()}.${fileExtension}`,
                            {
                                type: blobType,
                                lastModified: Date.now(),
                            },
                        );

                        setRecordedAudio(audioUrl);
                        setRecordedBlob(fixedBlob);
                        setRecordedFile(fixedAudioFile);
                        recordingCompletedRef.current = true;

                        // KIỂM TRA DURATION TRƯỚC KHI PHÂN TÍCH
                        testAudioDuration(audioUrl)
                            .then((duration) => {
                                console.log("⏱️ Duration thực tế:", duration);
                                analyzeVoice(fixedAudioFile, lyrics);
                            })
                            .catch((error) => {
                                console.warn(
                                    "⚠️ Không thể lấy duration:",
                                    error,
                                );
                                analyzeVoice(fixedAudioFile, lyrics);
                            });
                    })
                    .catch((error) => {
                        console.error("❌ Lỗi fix metadata:", error);
                        // FALLBACK: Sử dụng file gốc
                        setRecordedAudio(audioUrl);
                        setRecordedBlob(blob);
                        setRecordedFile(audioFile);
                        recordingCompletedRef.current = true;
                        analyzeVoice(audioFile, lyrics);
                    });

                if (streamRef.current) {
                    streamRef.current
                        .getTracks()
                        .forEach((track) => track.stop());
                    streamRef.current = null;
                }
            };

            setMediaRecorder(recorder);
            mediaRecorderRef.current = recorder;
            setIsMicrophoneAvailable(true);
            return true;
        } catch (error) {
            console.error("❌ Lỗi khởi tạo thu âm:", error);
            handleRecordingError(error);
            return false;
        }
    };

    // Hàm sửa metadata cho audio blob
    // Hàm sửa metadata cho audio blob - FIXED
    const fixAudioMetadata = (blob) => {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            const url = URL.createObjectURL(blob);

            let timeoutId = setTimeout(() => {
                console.warn("⚠️ Timeout khi load metadata, sử dụng blob gốc");
                URL.revokeObjectURL(url);
                resolve(blob);
            }, 3000);

            audio.onloadedmetadata = () => {
                clearTimeout(timeoutId);
                console.log(
                    "✅ Blob có metadata hợp lệ, duration:",
                    audio.duration,
                );

                // KIỂM TRA DURATION HỢP LỆ
                if (
                    audio.duration === Infinity ||
                    isNaN(audio.duration) ||
                    audio.duration === 0
                ) {
                    console.warn("⚠️ Duration không hợp lệ:", audio.duration);
                    // VẪN SỬ DỤNG BLOB GỐC NHƯNG CÓ CẢNH BÁO
                    URL.revokeObjectURL(url);
                    resolve(blob);
                } else {
                    URL.revokeObjectURL(url);
                    resolve(blob);
                }
            };

            audio.onerror = () => {
                clearTimeout(timeoutId);
                console.warn("⚠️ Lỗi load metadata, sử dụng blob gốc");
                URL.revokeObjectURL(url);
                resolve(blob);
            };

            audio.src = url;
            audio.load();
        });
    };

    // Hàm kiểm tra duration
    const testAudioDuration = (audioUrl) => {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.onloadedmetadata = () => {
                URL.revokeObjectURL(audioUrl);
                resolve(audio.duration);
            };
            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                reject(new Error("Không thể load audio metadata"));
            };
            audio.src = audioUrl;
            audio.load();
        });
    };

    // Hàm hỗ trợ lấy extension
    const getFileExtension = (mimeType) => {
        const extensions = {
            "audio/webm;codecs=opus": "webm",
            "audio/webm": "webm",
            "audio/mp4;codecs=mp4a": "m4a",
            "audio/ogg;codecs=opus": "ogg",
            "audio/mp3": "mp3",
        };
        return extensions[mimeType] || "webm";
    };

    const handleRecordingError = (error) => {
        let errorMessage = "Không thể truy cập microphone. ";
        if (error.name === "NotAllowedError") {
            errorMessage =
                "Bạn đã từ chối quyền truy cập microphone. Vui lòng cấp quyền trong trình duyệt và thử lại.";
        } else if (error.name === "NotFoundError") {
            errorMessage =
                "Không tìm thấy microphone. Vui lòng kiểm tra thiết bị của bạn.";
        } else if (error.name === "NotSupportedError") {
            errorMessage = "Trình duyệt của bạn không hỗ trợ thu âm.";
        } else {
            errorMessage = "Lỗi: " + error.message;
        }
        setRecordingError(errorMessage);
        setIsMicrophoneAvailable(false);
    };

    const startCountdown = () => {
        return new Promise((resolve) => {
            setCountdown(3);
            setRecordingStatus("countdown");

            countdownRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownRef.current);
                        setRecordingStatus("recording");
                        resolve();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        });
    };

    const stopRecordingAndAudio = async () => {
        console.log("🛑 Đang dừng thu âm và audio...");

        setIsPlaying(false);
        setRecordingStatus("stopping");

        // Dừng countdown trước
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }

        // Dừng animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        // Dừng audio trước
        pauseAudio();
        stopAudio();

        // Xử lý MediaRecorder một cách tuần tự
        if (mediaRecorderRef.current) {
            const recorder = mediaRecorderRef.current;

            if (recorder.state === "recording") {
                console.log("⏹️ Dừng MediaRecorder...");

                // Tạo promise để đợi sự kiện onstop hoàn tất
                await new Promise((resolve) => {
                    const onStopHandler = () => {
                        recorder.removeEventListener("stop", onStopHandler);
                        resolve();
                    };

                    recorder.addEventListener("stop", onStopHandler);
                    recorder.stop();

                    // Timeout dự phòng
                    setTimeout(resolve, 1000);
                });
            }
        }

        // Dừng stream
        if (streamRef.current) {
            console.log("🔇 Dừng stream...");
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        setIsRecording(false);
        setRecordingStatus("idle");
    };

    // Main control functions - FIXED
    const handleStart = async () => {
        if (!audioFile || !isAudioLoaded) {
            setShowAudioModal(true);
            return;
        }

        try {
            resetSessionState();
            const recordingInitialized = await initAudioRecording();
            if (!recordingInitialized) {
                setRecordingError(
                    "Không thể khởi tạo thu âm. Vui lòng kiểm tra microphone.",
                );
                return;
            }

            await startCountdown();

            if (
                !mediaRecorderRef.current ||
                mediaRecorderRef.current.state !== "inactive"
            ) {
                setRecordingError(
                    "Trạng thái thu âm không hợp lệ. Vui lòng thử lại.",
                );
                return;
            }

            console.log("🎤 Bắt đầu thu âm...");
            // TĂNG TIMESLICE LÊN 5000ms ĐỂ CÓ METADATA TỐT HƠN
            mediaRecorderRef.current.start(5000);
            setIsPlaying(true);
            playAudio();
        } catch (error) {
            console.error("❌ Lỗi khi bắt đầu thu âm:", error);
            setRecordingError(
                "Có lỗi xảy ra khi khởi động thu âm: " + error.message,
            );
            stopRecordingAndAudio();
        }
    };

    const resetSessionState = () => {
        setScore(null);
        setVoiceAnalysis(null);
        setCurrentWordIndex({ line: 0, word: 0 });
        setCurrentTimingIndex(0);
        setRecordedAudio(null);
        setRecordedBlob(null);
        setRecordedFile(null);
        setComboCount(0);
        setMaxCombo(0);
        setRecordingError(null);
        setRecordingStatus("idle");
        recordingCompletedRef.current = false; // Reset ref
        audioChunksRef.current = [];
    };

    const handleStop = async () => {
        setIsAnalyzing(true);
        try {
            // Đánh dấu là đang dừng để tránh xử lý trùng
            recordingCompletedRef.current = true;

            await stopRecordingAndAudio();

            // KIỂM TRA NGAY LẬP TỨC thay vì setTimeout
            if (audioChunksRef.current.length > 0) {
                console.log("🔄 Tạo file từ chunks hiện có...");
                const blob = new Blob(audioChunksRef.current, {
                    type: "audio/webm",
                });

                console.log("🔍 Blob được tạo:", {
                    size: blob.size,
                    type: blob.type,
                });

                if (blob.size > 0) {
                    const audioUrl = URL.createObjectURL(blob);
                    const audioFile = new File([blob], "recording.webm", {
                        type: "audio/webm",
                        lastModified: Date.now(),
                    });

                    console.log("✅ File được tạo:", audioFile);
                    setRecordedAudio(audioUrl);
                    setRecordedFile(audioFile);
                    analyzeVoice(audioFile, lyrics);
                } else {
                    console.error("❌ Blob bị rỗng");
                    setRecordingError("Không có dữ liệu thu âm được ghi lại");
                }
            } else {
                console.error("❌ Không có chunks để xử lý");
                setRecordingError("Không có dữ liệu thu âm");
            }
        } catch (error) {
            console.error("❌ Lỗi khi dừng thu âm:", error);
            setRecordingError("Lỗi khi dừng thu âm: " + error.message);
        }
    };

    const handleRetry = () => {
        console.log("🔄 Thử lại...");
        stopRecordingAndAudio();
        resetSessionState();
        stopAudio();
        setMediaRecorder(null);
        mediaRecorderRef.current = null;
    };

    // Scoring and analysis - IMPROVED
    const analyzeVoice = async (audioFile, lyricsText) => {
        setIsAnalyzing(true);
        if (!audioFile) {
            console.error("❌ Không có file audio để phân tích");
            setRecordingError("Không có dữ liệu thu âm để phân tích");
            generateScore();
            setIsAnalyzing(false);
            return;
        }

        try {
            const formData = new FormData();

            formData.append("record", audioFile);
            formData.append("lyric", lyricsText);

            const token = storage.getAccessToken();
            const response = await fetch(`${API_BASE_URL}/api/voice/analyst`, {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "ngrok-skip-browser-warning": true,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Lỗi API:", errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("✅ Kết quả phân tích:", result);

            if (result.success) {
                setVoiceAnalysis(result.data);
                const apiScores = result.data.scores;
                setScore({
                    total: apiScores.overall,
                    rhythm: apiScores.intonation,
                    melody: apiScores.fluency,
                    pronunciation: apiScores.pronunciation,
                    accuracy: apiScores.lyrichatch,
                    combo: maxCombo,
                });
                return result.data;
            } else {
                throw new Error(result.message || "Voice analysis failed");
            }
        } catch (error) {
            console.error("❌ Lỗi phân tích giọng hát:", error);

            let userErrorMessage = "Có lỗi xảy ra khi phân tích giọng hát";
            if (error.message.includes("Failed to fetch")) {
                userErrorMessage =
                    "Không thể kết nối đến server chấm điểm. Vui lòng kiểm tra kết nối mạng.";
            } else if (error.message.includes("HTTP error")) {
                userErrorMessage =
                    "Server chấm điểm đang gặp sự cố. Vui lòng thử lại sau.";
            }

            setRecordingError(userErrorMessage);
            generateScore();
            return null;
        } finally {
            setIsAnalyzing(false);
        }
    };

    const generateScore = () => {
        if (score) return;

        const accuracy = calculateTimingAccuracy();
        const comboBonus = Math.min(maxCombo * 0.5, 10);
        const baseScore = Math.floor(accuracy * 30 + 60 + comboBonus);

        setScore({
            total: Math.min(baseScore, 100),
            rhythm: Math.floor(Math.random() * 15 + baseScore - 10),
            melody: Math.floor(Math.random() * 15 + baseScore - 10),
            pronunciation: Math.floor(Math.random() * 15 + baseScore - 10),
            accuracy: Math.round(accuracy * 100),
            combo: maxCombo,
        });
    };

    const calculateTimingAccuracy = () => {
        if (wordTimings.length === 0) return 0.7;
        const progress = currentTimingIndex / Math.max(wordTimings.length, 1);
        return Math.min(0.7 + progress * 0.3, 0.95);
    };

    // Project management
    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        setLyrics(project.lyrics);
        setAudioFile(project.audio || null);
        setStep(2);

        if (!project.audio) {
            setShowAudioModal(true);
        }
    };

    const handleSave = () => {
        if (selectedProject) {
            setExistingProjects((prev) =>
                prev.map((project) =>
                    project.id === selectedProject.id
                        ? { ...project, isSaved: true }
                        : project,
                ),
            );
            setSelectedProject((prev) => ({ ...prev, isSaved: true }));
            alert("Dự án đã được lưu thành công!");
        }
    };

    const handleExportVideo = async () => {
        console.log("=== EXPORT VIDEO DATA ===");
        setIsExporting(true);
        try {
            const normalizedResult = (async () =>
                await normalizeAudio(recordedFile))();

            const filesToExport = {
                videoFile: null,
                audioFile: null,
                recordedFile: (await normalizedResult).file,
            };

            if (videoSelect) {
                filesToExport.videoFile = await processFileSource(
                    videoSelect,
                    "video.mp4",
                    "video",
                );
            }

            if (audioFile) {
                console.log(audioFile);
                filesToExport.audioFile = await processFileSource(
                    audioFile,
                    "video.mp3",
                    "video",
                );
            }

            // 5. Tạo FormData
            const formData = new FormData();
            if (filesToExport.videoFile) {
                formData.append("video", filesToExport.videoFile);
            }
            if (filesToExport.audioFile) {
                formData.append("music", filesToExport.audioFile);
            }
            if (filesToExport.recordedFile) {
                formData.append("lyric", filesToExport.recordedFile);
            }

            console.log("🚀 Đang gọi API...");
            await callMergeVideoAPI(formData);
        } catch (error) {
            console.error("❌ Lỗi trong quá trình xử lý export:", error);
            alert("Có lỗi khi xuất video: " + error.message);
        }
        setIsExporting(false);
    };

    // Audio file handling
    const handleAudioUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith("audio/")) {
                setAudioError(
                    "Vui lòng chọn file audio hợp lệ (mp3, wav, etc.)",
                );
                setShowAudioModal(true);
                return;
            }

            setAudioError(null);
            setAudioLoading(true);
            setShowAudioModal(false);

            const audioUrl = URL.createObjectURL(file);
            setAudioFile(audioUrl);

            if (selectedProject) {
                const updatedProject = { ...selectedProject, audio: audioUrl };
                setSelectedProject(updatedProject);
                setExistingProjects((prev) =>
                    prev.map((project) =>
                        project.id === selectedProject.id
                            ? updatedProject
                            : project,
                    ),
                );
            }

            event.target.value = "";
        }
    };

    const handleOpenAudioUpload = () => setShowAudioModal(true);
    const handleCloseAudioModal = () => setShowAudioModal(false);

    // Countdown overlay component
    const CountdownOverlay = () => {
        if (countdown === 0) return null;

        return (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
                <div className="text-center">
                    <div className="text-white text-9xl font-bold animate-bounce mb-4">
                        {countdown}
                    </div>
                </div>
            </div>
        );
    };

    // Recording status component
    const RecordingStatusDisplay = () => {
        if (recordingStatus === "countdown") {
            return (
                <div className="bg-blue-100 border border-blue-400 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        <div>
                            <p className="text-blue-800 font-semibold">
                                Đang chuẩn bị...
                            </p>
                            <p className="text-blue-700 text-sm">
                                Bắt đầu sau {countdown} giây
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        if (recordingStatus === "recording") {
            return (
                <div className="bg-green-100 border border-green-400 rounded-lg p-4">
                    <div className="flex items-center">
                        <Circle className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2" />
                        <div>
                            <p className="text-green-800 font-semibold">
                                Đang thu âm
                            </p>
                            <p className="text-green-700 text-sm">
                                Microphone đang hoạt động
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    // Render methods
    if (step === 0) {
        return <LoginPrompt location={location} />;
    }

    if (step === 1) {
        return (
            <ProjectSelection
                existingProjects={existingProjects}
                currentProjectPage={currentProjectPage}
                projectPages={Math.ceil(existingProjects.length / 2)}
                onProjectSelect={handleProjectSelect}
                onPageChange={setCurrentProjectPage}
                navigate={navigate}
                isLoading={isLoading}
            />
        );
    }

    return (
        <div
            className="w-full px-4 sm:px-6 lg:px-12 pt-2 pb-6 flex flex-col items-center overflow-auto"
            style={{
                background: selectedProject?.video
                    ? `url(${selectedProject.video}) no-repeat center/cover`
                    : "linear-gradient(to bottom, #4B5563, #1F2937)",
            }}
        >
            {/* Audio Upload Modal */}
            {showAudioModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Music className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Thiếu file nhạc nền
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Bạn cần tải lên file nhạc để bắt đầu hát
                                karaoke. Hãy chọn file audio từ thiết bị của
                                bạn.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleAudioUpload}
                                className="hidden"
                                id="audio-upload-modal"
                            />
                            <label
                                htmlFor="audio-upload-modal"
                                className="block w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-center cursor-pointer shadow-md hover:shadow-lg"
                            >
                                📁 Chọn file nhạc
                            </label>

                            {audioLoading && (
                                <div className="text-center py-2">
                                    <div className="inline-flex items-center gap-2 text-blue-600">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        Đang tải file...
                                    </div>
                                </div>
                            )}

                            {audioError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                                    <AlertCircle className="w-4 h-4 inline mr-1" />
                                    {audioError}
                                </div>
                            )}

                            <div className="text-xs text-gray-500 text-center">
                                Hỗ trợ các định dạng: MP3, WAV, OGG, M4A
                            </div>

                            <button
                                onClick={handleCloseAudioModal}
                                className="w-full bg-gray-300 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full flex flex-col gap-6 max-w-7xl">
                {/* Navigation Bar */}
                <div className="absolute top-4 left-4">
                    <button
                        onClick={() => navigate("/lyrics-composition")}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại sáng tác
                    </button>
                </div>

                {/* Project Info */}
                {selectedProject && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mt-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                        {/* Left Section - Project Info */}
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="flex items-center gap-2">
                                    <FolderOpen className="h-5 w-5 text-red-600" />
                                    <h3 className="font-semibold text-red-800 text-base">
                                        Dự án đã chọn:
                                    </h3>
                                </div>
                                <div className="bg-white px-3 py-2 rounded-lg border border-red-100 shadow-sm">
                                    <p className="text-red-700 font-medium text-sm">
                                        {selectedProject.name}
                                    </p>
                                </div>
                            </div>

                            {/* Audio File Status */}
                            {audioFile && (
                                <div className="flex items-center mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 w-fit">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                    <span className="text-green-700 text-sm font-medium">
                                        Đã tải file nhạc thành công
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            {/* Audio Upload Button */}
                            <button
                                onClick={handleOpenAudioUpload}
                                className={`
            flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold 
            transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105
            min-w-[140px]
            ${
                audioFile
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
            }
          `}
                            >
                                <Upload className="h-4 w-4" />
                                {audioFile ? "Thay đổi nhạc" : "Thêm nhạc"}
                            </button>

                            {/* Video Select */}
                            <div className="relative flex-1 sm:w-[200px]">
                                <select
                                    id="my-select"
                                    value={videoSelect}
                                    onChange={(e) => {
                                        setVideoSelect(e.target.value);
                                        console.log(e.target.value);
                                    }}
                                    className="
              w-full bg-white border border-gray-300 text-gray-800 px-4 py-2.5 
              rounded-xl hover:border-gray-400 focus:border-blue-500 focus:ring-2 
              focus:ring-blue-200 transition-all duration-200 font-medium 
              shadow-sm hover:shadow-md appearance-none pr-10
            "
                                >
                                    <option value="/videoKaraoke/7135449603513.mp4">
                                        🎬 Video mặc định
                                    </option>
                                    {listVideo
                                        ?.filter((x) => x.resultUrl)
                                        ?.map((option, index) => (
                                            <option
                                                key={index}
                                                value={option.resultUrl}
                                            >
                                                🎥{" "}
                                                {option?.resultUrl
                                                    ?.split("/")
                                                    .pop() ??
                                                    `Video ${index + 1}`}
                                            </option>
                                        ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <RecordingStatusDisplay />

                {recordingError && (
                    <div className="bg-red-100 border border-red-400 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                            <div>
                                <p className="text-red-800 font-semibold">
                                    Lỗi thu âm
                                </p>
                                <p className="text-red-700 text-sm">
                                    {recordingError}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!isMicrophoneAvailable && recordingStatus === "idle" && (
                    <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-2" />
                            <div>
                                <p className="text-yellow-800 font-semibold">
                                    Microphone chưa được cấp quyền
                                </p>
                                <p className="text-yellow-700 text-sm">
                                    Khi bạn nhấn "Bắt đầu hát", trình duyệt sẽ
                                    yêu cầu quyền truy cập microphone.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6">
                    <KaraokeDisplay
                        selectedProject={selectedProject}
                        lyrics={lyrics}
                        currentWordIndex={currentWordIndex}
                        isPlaying={isPlaying}
                        isRecording={isRecording}
                        wordTimings={wordTimings}
                        currentTimingIndex={currentTimingIndex}
                        comboCount={comboCount}
                        isMicrophoneAvailable={isMicrophoneAvailable}
                        videoRef={videoRef}
                        videoSelect={videoSelect}
                        CountdownOverlay={CountdownOverlay}
                    />

                    {/* Lyrics Panel */}
                    <div className="flex flex-col lg:w-1/3 bg-white bg-opacity-90 rounded-lg p-6 shadow-lg border border-gray-200">
                        <div className="text-center text-lg font-semibold text-gray-800 mb-4">
                            <span className="flex items-center justify-center">
                                <Music className="h-6 w-6 text-red-600 mr-2" />
                                Toàn bộ lời bài hát
                            </span>
                        </div>
                        <div className="h-96 overflow-y-auto text-gray-800 text-base leading-loose font-sans">
                            {lyrics
                                .split("\n")
                                .filter((line) => line.trim() !== "")
                                .map((line, index) => (
                                    <p
                                        key={index}
                                        className={`mb-2 transition-colors ${
                                            index === currentWordIndex.line
                                                ? "bg-yellow-100 rounded px-2 border-l-4 border-yellow-400"
                                                : ""
                                        }`}
                                    >
                                        {line}
                                    </p>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Control Panel */}
                {isAnalyzing ? (
                    <div className="flex justify-center text-center bg-black bg-opacity-50 rounded-lg p-6">
                        <div className="flex px-8 py-4 bg-gray-600 rounded-lg text-white space-x-4">
                            <RotateCw className="w-6 h-6 animate-spin" />
                            <span>Đang xử lý...</span>
                        </div>
                    </div>
                ) : (
                    <div>
                        {!score && (
                            <div className="flex justify-center text-center bg-black bg-opacity-50 rounded-lg p-6">
                                {!isPlaying &&
                                !isRecording &&
                                recordingStatus === "idle" ? (
                                    <button
                                        onClick={handleStart}
                                        disabled={
                                            !audioFile ||
                                            audioLoading ||
                                            !isAudioLoaded
                                        }
                                        className="relative px-8 py-4 rounded-lg transition-all duration-200 font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 flex items-center gap-3 group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-2xl"
                                        style={{
                                            boxShadow:
                                                "0 0 30px rgba(220, 38, 38, 0.7)",
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover:opacity-30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000" />

                                        <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />

                                        <span className="relative">
                                            {audioFile
                                                ? "Bắt đầu hát Karaoke"
                                                : "Cần file nhạc để bắt đầu"}
                                        </span>

                                        <div className="absolute inset-0 border-2 border-red-400 rounded-lg animate-ping opacity-0 group-hover:opacity-100" />
                                    </button>
                                ) : (
                                    <div className="flex space-x-4">
                                        <div className="mb-4">
                                            <Mic className="h-12 w-12 mx-auto text-red-500 animate-pulse" />
                                        </div>
                                        <p className="text-gray-300 text-base text-center">
                                            {isRecording
                                                ? "Đang thu âm... Hãy hát theo lời bài hát được highlight"
                                                : "Đang phát nhạc..."}
                                        </p>
                                        <button
                                            onClick={handleStop}
                                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                                        >
                                            <Square className="w-4 h-4" />
                                            Dừng thu âm
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {score && (
                    <ScoreDisplay
                        score={score}
                        isAnalyzing={isAnalyzing}
                        voiceAnalysis={voiceAnalysis}
                        recordedAudio={recordedAudio}
                        onSave={handleSave}
                        onRetry={handleRetry}
                        onExportVideo={handleExportVideo}
                        isExporting={isExporting}
                    />
                )}
            </div>
        </div>
    );
};

export default Karaoke;
