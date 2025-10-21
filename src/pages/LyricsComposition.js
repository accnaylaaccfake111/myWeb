// LyricsComposition.jsx (Component chính)
import React, {
    useState,
    useCallback,
    useRef,
    useMemo,
    useEffect,
} from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import ThemeSelectionStage from "../components/lyricscomposition/ThemeSelectionStage";
import LyricsDisplayStage from "../components/lyricscomposition/LyricsDisplayStage";
import MusicGenerationStage from "../components/lyricscomposition/MusicGenerationStage";
import { storage } from "../utils/storage";
import MusicXMLViewer from "../components/MusicXMLViewer";
import { formatLyrics } from "../utils/util";

// Constants for status - Updated to match new requirements
const STATUS = {
    DRAFT: "DRAFT",
    MUSIC_GENERATE_PROCESSING: "MUSIC_GENERATE_PROCESSING",
    SHEET_GENERATE_PROCESSING: "SHEET_GENERATE_PROCESSING",
    MUSIC_COMPLETED: "MUSIC_COMPLETED",
    SHEET_COMPLETED: "SHEET_COMPLETED",
    MUSIC_FAILED: "MUSIC_FAILED",
    SHEET_FAILED: "SHEET_FAILED",
    DELETED: "DELETED",
};

// Map server status to frontend status
const STATUS_MAPPING = {
    // Music status mapping
    PROCESSING: STATUS.MUSIC_GENERATE_PROCESSING,
    PENDING: STATUS.MUSIC_GENERATE_PROCESSING,
    COMPLETED: STATUS.MUSIC_COMPLETED,
    SUCCESS: STATUS.MUSIC_COMPLETED,
    FAILED: STATUS.MUSIC_FAILED,
    ERROR: STATUS.MUSIC_FAILED,

    // Sheet status mapping
    SHEET_PROCESSING: STATUS.SHEET_GENERATE_PROCESSING,
    SHEET_PENDING: STATUS.SHEET_GENERATE_PROCESSING,
    SHEET_COMPLETED: STATUS.SHEET_COMPLETED,
    SHEET_SUCCESS: STATUS.SHEET_COMPLETED,
    SHEET_FAILED: STATUS.SHEET_FAILED,
    SHEET_ERROR: STATUS.SHEET_FAILED,
};

const LyricsComposition = ({ isLoggedIn }) => {
    const [themeData, setThemeData] = useState({});
    const [lyrics, setLyrics] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
    const [musicStatus, setMusicStatus] = useState(STATUS.DRAFT);
    const [sheetStatus, setSheetStatus] = useState(STATUS.DRAFT);
    const [audioUrl, setAudioUrl] = useState(null);
    const [error, setError] = useState("");
    const [musicTask, setMusicTask] = useState(null);
    const [projectInfor, setProjectInfor] = useState({});
    const [sheetMusic, setSheetMusic] = useState(null);
    const [isGeneratingSheet, setIsGeneratingSheet] = useState(false);
    const [sheetTask, setSheetTask] = useState(null);
    const [video, setVideo] = useState(null);

    const audioRef = useRef(null);
    const musicPollingRef = useRef(null);
    const sheetPollingRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Các chủ đề có sẵn
    const themeOptions = useMemo(
        () => [
            { id: "mở cửa", name: "mở cửa", description: "", emoji: "" },
            { id: "mở rào", name: "mở rào", description: "", emoji: "" },
            { id: "mở ngõ", name: "mở ngõ", description: "", emoji: "" },
            { id: "khai môn", name: "khai môn", description: "", emoji: "" },
            {
                id: "chúc gia chủ",
                name: "chúc gia chủ",
                description: "",
                emoji: "",
            },
            { id: "chúc tụng", name: "chúc tụng", description: "", emoji: "" },
            {
                id: "chúc mùa màng",
                name: "chúc mùa màng",
                description: "",
                emoji: "",
            },
            { id: "ban lộc", name: "ban lộc", description: "", emoji: "" },
            { id: "cầu an", name: "cầu an", description: "", emoji: "" },
            { id: "cầu phúc", name: "cầu phúc", description: "", emoji: "" },
            { id: "quê hương", name: "quê hương", description: "", emoji: "" },
            {
                id: "ca ngợi quê hương",
                name: "ca ngợi quê hương",
                description: "",
                emoji: "",
            },
            { id: "tiễn biệt", name: "tiễn biệt", description: "", emoji: "" },
            { id: "kết thúc", name: "kết thúc", description: "", emoji: "" },
        ],
        [],
    );

    // Các phong cách/tâm trạng
    const moodOptions = [
        { id: "vui tươi", name: "vui tươi" },
        { id: "phấn khởi", name: "phấn khởi" },
        { id: "rộn ràng", name: "rộn ràng" },
        { id: "trang nghiêm", name: "trang nghiêm" },
        { id: "thành kính", name: "thành kính" },
        { id: "thân mật", name: "thân mật" },
        { id: "dí dỏm", name: "dí dỏm" },
        { id: "hóm hỉnh", name: "hóm hỉnh" },
        { id: "tự hào", name: "tự hào" },
        { id: "yêu quê hương", name: "yêu quê hương" },
        { id: "ân cần", name: "ân cần" },
    ];

    // Hàm map server status to frontend status
    const mapServerToFrontendStatus = useCallback(
        (serverStatus, type = "music") => {
            if (!serverStatus) return STATUS.DRAFT;

            const upperStatus = serverStatus.toUpperCase();

            // Direct mapping first
            if (STATUS_MAPPING[upperStatus]) {
                return STATUS_MAPPING[upperStatus];
            }

            // Type-specific mapping
            if (type === "music") {
                if (
                    upperStatus.includes("PROCESS") ||
                    upperStatus.includes("PENDING") ||
                    upperStatus.includes("DRAFT")
                ) {
                    return STATUS.MUSIC_GENERATE_PROCESSING;
                }
                if (
                    upperStatus.includes("COMPLETE") ||
                    upperStatus.includes("SUCCESS")
                ) {
                    return STATUS.MUSIC_COMPLETED;
                }
                if (
                    upperStatus.includes("FAIL") ||
                    upperStatus.includes("ERROR")
                ) {
                    return STATUS.MUSIC_FAILED;
                }
            } else if (type === "sheet") {
                if (
                    upperStatus.includes("PROCESS") ||
                    upperStatus.includes("PENDING") ||
                    upperStatus.includes("DRAFT")
                ) {
                    return STATUS.SHEET_GENERATE_PROCESSING;
                }
                if (
                    upperStatus.includes("COMPLETE") ||
                    upperStatus.includes("SUCCESS")
                ) {
                    return STATUS.SHEET_COMPLETED;
                }
                if (
                    upperStatus.includes("FAIL") ||
                    upperStatus.includes("ERROR")
                ) {
                    return STATUS.SHEET_FAILED;
                }
            }

            return STATUS.DRAFT;
        },
        [],
    );

    // Hàm reset audio state
    const resetAudioState = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current.load();
        }

        if (audioUrl && audioUrl.startsWith("blob:")) {
            URL.revokeObjectURL(audioUrl);
        }
    }, [audioUrl]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (musicPollingRef.current) {
                clearTimeout(musicPollingRef.current);
            }
            if (sheetPollingRef.current) {
                clearTimeout(sheetPollingRef.current);
            }
            resetAudioState();
        };
    }, [resetAudioState]);

    useEffect(() => {
        console.log(location);
        setVideo(location?.state?.video);
    }, [location.state?.video])

    // Hàm parse lyrics data từ response
    const parseLyricsData = useCallback(
        (data) => {
            if (!data) return "";

            try {
                // Trường hợp 1: data là string trực tiếp
                if (typeof data === "string") {
                    return formatLyrics(data);
                }

                // Trường hợp 2: data là object với các trường khác nhau
                if (typeof data === "object") {
                    // Ưu tiên các trường có thể chứa lyrics
                    const possibleLyricsFields = [
                        "lyrics",
                        "formattedLyrics",
                        "text",
                        "content",
                        "data.lyrics",
                        "data.text",
                        "data.content",
                        "result",
                        "message",
                        "id",
                    ];

                    for (const field of possibleLyricsFields) {
                        if (field.includes(".")) {
                            const [parent, child] = field.split(".");
                            if (data[parent] && data[parent][child]) {
                                return formatLyrics(data[parent][child]);
                            }
                        } else if (data[field]) {
                            return formatLyrics(data[field]);
                        }
                    }

                    // Trường hợp 3: data có thể là array của lyrics lines
                    if (Array.isArray(data.lyricsLines)) {
                        const cleanLines = data.lyricsLines.filter((line) => {
                            const trimmed = line.trim();
                            return (
                                trimmed !== "" &&
                                !trimmed.startsWith("**") &&
                                !trimmed.startsWith("(") &&
                                !/^\d+\./.test(trimmed) &&
                                /[a-zA-ZÀ-ỹ]/.test(trimmed)
                            );
                        });
                        return formatLyrics(cleanLines.join("\n"));
                    }

                    // Trường hợp 4: data có thể là array của verses
                    if (Array.isArray(data.lyricsVerses)) {
                        const cleanVerses = data.lyricsVerses
                            .flat()
                            .filter((line) => {
                                const trimmed = line.trim();
                                return (
                                    trimmed !== "" &&
                                    !trimmed.startsWith("**") &&
                                    !trimmed.startsWith("(") &&
                                    !/^\d+\./.test(trimmed) &&
                                    /[a-zA-ZÀ-ỹ]/.test(trimmed)
                                );
                            });
                        return formatLyrics(cleanVerses.join("\n"));
                    }
                }

                // Fallback: chuyển thành string và format
                return formatLyrics(String(data));
            } catch (error) {
                console.error("Error parsing lyrics data:", error);
                return "Không thể phân tích dữ liệu lời bài hát từ server.";
            }
        },
        [formatLyrics],
    );

    // Hàm tạo URL audio an toàn
    const createSafeAudioUrl = useCallback((url) => {
        if (!url) return null;

        try {
            // Nếu URL đã là absolute URL, sử dụng trực tiếp
            if (url.startsWith("http")) {
                return url;
            }

            // Nếu là relative URL, kết hợp với base URL
            if (url.startsWith("/")) {
                return `${process.env.REACT_APP_BE_API}${url}`;
            }

            // Nếu là blob URL hoặc data URL, giữ nguyên
            if (url.startsWith("blob:") || url.startsWith("data:")) {
                return url;
            }

            return url;
        } catch (error) {
            console.error("Error creating safe audio URL:", error);
            return null;
        }
    }, []);

    // Hàm kiểm tra trạng thái task nhạc
    const checkMusicTaskStatus = useCallback(async (taskId) => {
        try {
            const token = storage.getAccessToken();
            console.log(`🔍 Checking music task status for: ${taskId}`);

            const response = await fetch(
                `${process.env.REACT_APP_BE_API}/api/music/status/${taskId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": true,
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`📊 Music task status response:`, data);

            return data;
        } catch (error) {
            console.error("❌ Error checking music task status:", error);
            throw error;
        }
    }, []);

    // Hàm kiểm tra trạng thái task sheet music
    const checkSheetTaskStatus = useCallback(async (taskId) => {
        try {
            const token = storage.getAccessToken();
            console.log(`🔍 Checking sheet music task status for: ${taskId}`);

            const response = await fetch(
                `${process.env.REACT_APP_BE_API}/api/music/status/${taskId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": true,
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`📊 Sheet music task status response:`, data);

            return data;
        } catch (error) {
            console.error("❌ Error checking sheet music task status:", error);
            throw error;
        }
    }, []);

    // Hàm chờ cho đến khi task nhạc hoàn thành với polling
    const waitForMusicCompletion = useCallback(
        async (taskId, interval = 5000) => {
            let attempts = 0;
            const maxAttempts = 60; // 3 phút timeout

            const poll = async () => {
                if (attempts >= maxAttempts) {
                    setMusicStatus(STATUS.MUSIC_FAILED);
                    throw new Error("Music generation timeout after 3 minutes");
                }

                attempts++;

                try {
                    const result = await checkMusicTaskStatus(taskId);

                    // Log chi tiết trạng thái
                    console.log(`🔄 Music polling attempt ${attempts}:`, {
                        taskId,
                        status: result.status,
                        message: result.message,
                        projectId: result.projectId,
                    });

                    // Map server status to frontend status
                    const frontendStatus = mapServerToFrontendStatus(
                        result.status,
                        "music",
                    );
                    setMusicStatus(frontendStatus);

                    switch (frontendStatus) {
                        case STATUS.MUSIC_COMPLETED:
                            console.log(
                                "🎵 Music generation COMPLETED!",
                                result,
                            );

                            // QUAN TRỌNG: Đảm bảo có URL audio hợp lệ
                            const audioUrl =
                                result.outputUrl ||
                                result.result ||
                                result.audioUrl;
                            if (!audioUrl) {
                                setMusicStatus(STATUS.MUSIC_FAILED);
                                throw new Error(
                                    "No audio URL found in response",
                                );
                            }

                            setProjectInfor({
                                ...projectInfor,
                                ...result,
                            });

                            return {
                                ...result,
                                audioUrl,
                                sheetMusicId: result.sheetMusicId,
                            };

                        case STATUS.MUSIC_FAILED:
                            console.error("❌ Music generation failed:", {
                                taskId,
                                error: result.errorMessage,
                                status: result.status,
                                message: result.message,
                            });
                            throw new Error(
                                result.errorMessage ||
                                    result.message ||
                                    "Music generation failed",
                            );

                        case STATUS.MUSIC_GENERATE_PROCESSING:
                            console.log(
                                `⏳ Music generation in progress (${attempts}/${maxAttempts}):`,
                                result.message || result.status,
                            );

                            // Tiếp tục chờ với interval
                            await new Promise((resolve) => {
                                musicPollingRef.current = setTimeout(
                                    resolve,
                                    interval,
                                );
                            });
                            return await poll();

                        default:
                            console.warn(
                                "⚠️ Unknown music task status:",
                                result.status,
                            );
                            setMusicStatus(STATUS.MUSIC_FAILED);
                            throw new Error(`Unknown status: ${result.status}`);
                    }
                } catch (error) {
                    console.error(
                        `❌ Music polling error attempt ${attempts}:`,
                        error,
                    );

                    if (
                        error.message.includes("Failed to fetch") &&
                        attempts < maxAttempts
                    ) {
                        // Server có thể đang tạm thời không phản hồi, tiếp tục thử
                        console.log("🔄 Retrying after fetch failure...");
                        await new Promise((resolve) => {
                            musicPollingRef.current = setTimeout(
                                resolve,
                                interval,
                            );
                        });
                        return await poll();
                    }

                    setMusicStatus(STATUS.MUSIC_FAILED);
                    throw error;
                }
            };

            return await poll();
        },
        [checkMusicTaskStatus, mapServerToFrontendStatus],
    );

    // Hàm chờ cho đến khi task sheet music hoàn thành với polling
    const waitForSheetCompletion = useCallback(
        async (taskId, interval = 30000) => {
            let attempts = 0;
            const maxAttempts = 60; // 3 phút timeout

            const poll = async () => {
                if (attempts >= maxAttempts) {
                    setSheetStatus(STATUS.SHEET_FAILED);
                    throw new Error(
                        "Sheet music generation timeout after 3 minutes",
                    );
                }

                attempts++;

                try {
                    const result = await checkSheetTaskStatus(taskId);

                    // Log chi tiết trạng thái
                    console.log(`🔄 Sheet music polling attempt ${attempts}:`, {
                        taskId,
                        status: result.status,
                        message: result.message,
                    });

                    // Map server status to frontend status
                    const frontendStatus = mapServerToFrontendStatus(
                        result.status,
                        "sheet",
                    );
                    setSheetStatus(frontendStatus);

                    switch (frontendStatus) {
                        case STATUS.SHEET_COMPLETED:
                            console.log(
                                "🎼 Sheet music generation COMPLETED!",
                                {
                                    taskId,
                                    result: result.result,
                                    message: result.message,
                                },
                            );

                            return result;

                        case STATUS.SHEET_FAILED:
                            console.error("❌ Sheet music generation failed:", {
                                taskId,
                                error: result.errorMessage,
                                status: result.status,
                                message: result.message,
                            });
                            throw new Error(
                                result.errorMessage ||
                                    result.message ||
                                    "Sheet music generation failed",
                            );

                        case STATUS.SHEET_GENERATE_PROCESSING:
                            console.log(
                                `⏳ Sheet music generation in progress (${attempts}/${maxAttempts}):`,
                                result.message || result.status,
                            );

                            // Tiếp tục chờ với interval
                            await new Promise((resolve) => {
                                sheetPollingRef.current = setTimeout(
                                    resolve,
                                    interval,
                                );
                            });
                            return await poll();

                        default:
                            console.warn(
                                "⚠️ Unknown sheet music task status:",
                                result.status,
                            );
                            setSheetStatus(STATUS.SHEET_FAILED);
                            throw new Error(`Unknown status: ${result.status}`);
                    }
                } catch (error) {
                    console.error(
                        `❌ Sheet music polling error attempt ${attempts}:`,
                        error,
                    );

                    if (
                        error.message.includes("Failed to fetch") &&
                        attempts < maxAttempts
                    ) {
                        // Server có thể đang tạm thời không phản hồi, tiếp tục thử
                        console.log("🔄 Retrying after fetch failure...");
                        await new Promise((resolve) => {
                            sheetPollingRef.current = setTimeout(
                                resolve,
                                interval,
                            );
                        });
                        return await poll();
                    }

                    setSheetStatus(STATUS.SHEET_FAILED);
                    throw error;
                }
            };

            return await poll();
        },
        [checkSheetTaskStatus, mapServerToFrontendStatus],
    );

    // Hàm tạo nhạc
    const generateMusic = useCallback(
        async (id) => {
            try {
                const token = storage.getAccessToken();
                if (!token) {
                    throw new Error("Bạn cần đăng nhập để tạo nhạc");
                }

                setIsGeneratingMusic(true);
                setMusicStatus(STATUS.MUSIC_GENERATE_PROCESSING);

                // QUAN TRỌNG: Reset audio state trước khi tạo mới
                resetAudioState();
                setAudioUrl(null);

                console.log("🎶 Starting music generation with parameters:", {
                    theme: themeData.theme,
                    mood: themeData.mood,
                    lyrics: lyrics.substring(0, 100) + "...",
                });

                const response = await fetch(
                    `${process.env.REACT_APP_BE_API}/api/music/generate`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            lyricId: id,
                            userName: null,
                            theme: themeData.theme,
                            mood: themeData.mood,
                            duration: 16,
                        }),
                    },
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(
                        `HTTP error! status: ${response.status}, ${errorText}`,
                    );
                }

                const taskData = await response.json();
                console.log("🎵 Music generation task started:", taskData);

                // Lưu thông tin task
                setMusicTask(taskData);

                // Xác định taskId (hỗ trợ cả taskId và processId từ API)
                const taskId = taskData.taskId || taskData.processId;

                if (!taskId) {
                    throw new Error("No task ID received from server");
                }

                console.log(`🆔 Starting music polling for task: ${taskId}`);

                // Bắt đầu polling để kiểm tra trạng thái
                const finalResult = await waitForMusicCompletion(taskId);

                console.log(
                    "🎉 Music generation completed successfully:",
                    finalResult,
                );

                // QUAN TRỌNG: Tạo URL audio an toàn
                const safeAudioUrl = createSafeAudioUrl(finalResult.audioUrl);
                if (!safeAudioUrl) {
                    throw new Error("Invalid audio URL received");
                }

                console.log("🔊 Setting safe audio URL:", safeAudioUrl);

                // Reset audio state trước khi set URL mới
                resetAudioState();
                setAudioUrl(safeAudioUrl);

                return finalResult;
            } catch (error) {
                console.error("❌ Music generation error:", error);
                setError("Lỗi khi tạo nhạc: " + error.message);
                throw error;
            } finally {
                setIsGeneratingMusic(false);
            }
        },
        [
            themeData,
            lyrics,
            waitForMusicCompletion,
            createSafeAudioUrl,
            resetAudioState,
        ],
    );

    // Hàm tạo sheet music (nốt nhạc) với cơ chế polling
    const generateSheetMusic = useCallback(async () => {
        // console.log(projectInfor);
        // if (!projectInfor.id) {
        //     setError("Không có thông tin dự án để tạo nốt nhạc");
        //     return;
        // }

        try {
            setIsGeneratingSheet(true);
            setSheetStatus(STATUS.SHEET_GENERATE_PROCESSING);

            const token = storage.getAccessToken();
            console.log(projectInfor);
            const response = await fetch(
                `${process.env.REACT_APP_BE_API}/api/sheets?musicId=${projectInfor.sheetMusicId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": true,
                    },
                    body: JSON.stringify({
                        musicId: projectInfor.id,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const taskData = await response.json();
            console.log("🎼 Sheet music generation task started:", taskData);

            // Lưu thông tin task
            setSheetTask(taskData);
            console.log("task data: ", projectInfor);

            // Xác định taskId
            const taskId = projectInfor.taskId;

            if (!taskId) {
                return null;
            }

            console.log(`🆔 Starting sheet music polling for task: ${taskId}`);
            const finalResult = await waitForSheetCompletion(taskId);
            console.log(
                "🎉 Sheet music generation completed successfully:",
                finalResult,
            );

            // Lưu sheet music vào state
            setSheetMusic(finalResult.sheetMusic || finalResult.result);

            return finalResult;
        } catch (error) {
            console.error("❌ Error generating sheet music:", error);
            setError("Lỗi khi tạo nốt nhạc: " + error.message);
            throw error;
        } finally {
            setIsGeneratingSheet(false);
        }
    }, [projectInfor.id, waitForSheetCompletion]);

    // Hàm kiểm tra kết nối mạng
    const checkNetworkConnection = useCallback(async () => {
        try {
            await fetch("https://httpbin.org/get", {
                method: "GET",
                mode: "no-cors",
            });
            return true;
        } catch (error) {
            return false;
        }
    }, []);

    // Hàm generate lyrics
    const generateLyrics = useCallback(
        async (themeData) => {
            try {
                if (!themeData.theme) {
                    setError("Vui lòng chọn hoặc nhập chủ đề");
                    return;
                }

                setIsGenerating(true);
                setError("");
                setLyrics("");
                setMusicTask(null);
                resetAudioState();
                setAudioUrl(null);
                setSheetMusic(null); // Reset sheet music khi tạo lời mới
                setSheetTask(null); // Reset sheet task
                setMusicStatus(STATUS.DRAFT); // Reset music status
                setSheetStatus(STATUS.DRAFT); // Reset sheet status

                // Kiểm tra kết nối mạng trước
                const isOnline = await checkNetworkConnection();
                if (!isOnline) {
                    throw new Error(
                        "Không có kết nối internet. Vui lòng kiểm tra mạng của bạn.",
                    );
                }

                const token = storage.getAccessToken();

                if (!token) {
                    throw new Error(
                        "Bạn cần đăng nhập để sử dụng tính năng này",
                    );
                }

                const requestBody = {
                    theme: themeData.theme,
                    note: themeData.customTheme || "",
                    mood: themeData.mood || "thân mật",
                    minLines: 8,
                    maxLines: 32,
                    language: "vi",
                    useAI: true,
                    title: themeData.nameTitle,
                };

                const API_URL = `${process.env.REACT_APP_BE_API}/api/lyrics/generate`;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 300000);

                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                        Origin: window.location.origin,
                        "ngrok-skip-browser-warning": true,
                    },
                    body: JSON.stringify(requestBody),
                    signal: controller.signal,
                    mode: "cors",
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    let errorData;
                    try {
                        const errorText = await response.text();
                        errorData = JSON.parse(errorText);
                    } catch (e) {
                        errorData = {
                            message: `HTTP error! status: ${response.status}`,
                        };
                    }

                    switch (response.status) {
                        case 401:
                            throw new Error(
                                "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
                            );
                        case 403:
                            throw new Error(
                                "Bạn không có quyền truy cập tính năng này.",
                            );
                        case 404:
                            throw new Error("API endpoint không tồn tại.");
                        case 500:
                            throw new Error(
                                "Lỗi server. Vui lòng thử lại sau.",
                            );
                        default:
                            throw new Error(
                                errorData.message ||
                                    `Lỗi server: ${response.status}`,
                            );
                    }
                }

                const responseData = await response.json();
                console.log("Raw API response:", responseData);

                // Sử dụng hàm parseLyricsData để xử lý dữ liệu
                let generatedLyrics = "";
                setProjectInfor(responseData.data);

                if (responseData.data) {
                    generatedLyrics = parseLyricsData(responseData.data);
                } else {
                    generatedLyrics = parseLyricsData(responseData);
                }

                if (generatedLyrics && generatedLyrics.trim() !== "") {
                    setLyrics(generatedLyrics);
                    setThemeData(themeData);
                } else {
                    throw new Error(
                        "Không thể tìm thấy lời bài hát trong phản hồi từ server.",
                    );
                }
            } catch (error) {
                console.error("Generate lyrics error:", error);

                let errorMessage = "Lỗi khi tạo lời bài hát: ";

                if (error.name === "AbortError") {
                    errorMessage =
                        "Request timeout: Server không phản hồi sau 20 giây. Vui lòng thử lại sau.";
                } else if (
                    error.name === "TypeError" &&
                    error.message.includes("Failed to fetch")
                ) {
                    errorMessage =
                        "Không thể kết nối đến server. Có thể do:\n\n• Server API không hoạt động\n• Lỗi CORS (Cross-Origin Resource Sharing)\n• Kết nối mạng không ổn định\n• Tường lửa chặn kết nối\n\nVui lòng kiểm tra:\n1. Kết nối internet\n2. URL API có đúng không\n3. Server có đang chạy không";
                } else if (error.message.includes("Token không hợp lệ")) {
                    errorMessage = error.message;
                    storage.clearAuthData();
                    setTimeout(() => {
                        navigate("/login", {
                            state: { from: "/lyrics-composition" },
                        });
                    }, 300000);
                } else if (
                    error.message.includes("Không có kết nối internet")
                ) {
                    errorMessage = error.message;
                } else {
                    errorMessage += error.message;
                }

                setError(errorMessage);
            } finally {
                setIsGenerating(false);
            }
        },
        [checkNetworkConnection, navigate, parseLyricsData, resetAudioState],
    );

    // Các hàm xử lý sự kiện
    const handleGenerateLyrics = useCallback(
        (themeData) => {
            try {
                const token = storage.getAccessToken();
                if (!token) {
                    setError("Bạn cần đăng nhập để sử dụng tính năng này");
                    return;
                }

                if (!themeData.theme) {
                    setError("Vui lòng chọn hoặc nhập chủ đề");
                    return;
                }

                generateLyrics(themeData);
            } catch (error) {
                console.error("Handle generate lyrics error:", error);
                setError("Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại.");
            }
        },
        [generateLyrics],
    );

    const handleGenerateMusic = useCallback(async () => {
        try {
            if (!lyrics) {
                setError("Vui lòng tạo lời bài hát trước khi tạo nhạc");
                return;
            }
            console.log(projectInfor);
            await generateMusic(projectInfor.id);
        } catch (error) {
            console.error("Handle generate music error:", error);
            setError("Lỗi khi tạo nhạc: " + error.message);
        }
    }, [lyrics, generateMusic, projectInfor]);

    const handleRegenerate = useCallback(() => {
        generateLyrics(themeData);
    }, [generateLyrics, themeData]);

    const handleCopyLyrics = useCallback(() => {
        try {
            navigator.clipboard.writeText(lyrics);
            alert("Đã sao chép lời bài hát!");
        } catch (error) {
            console.error("Copy lyrics error:", error);
            const textArea = document.createElement("textarea");
            textArea.value = lyrics;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            alert("Đã sao chép lời bài hát!");
        }
    }, [lyrics]);

    const handleCloseError = useCallback(() => {
        setError("");
    }, []);

    // Hàm để lấy message hiển thị từ status
    const getMusicStatusMessage = useCallback(() => {
        switch (musicStatus) {
            case STATUS.DRAFT:
                return "Đang chờ tạo nhạc...";
            case STATUS.MUSIC_GENERATE_PROCESSING:
                return "Đang tạo nhạc...";
            case STATUS.MUSIC_COMPLETED:
                return "Tạo nhạc thành công!";
            case STATUS.MUSIC_FAILED:
                return "Tạo nhạc thất bại!";
            default:
                return "";
        }
    }, [musicStatus]);

    const getSheetStatusMessage = useCallback(() => {
        switch (sheetStatus) {
            case STATUS.DRAFT:
                return "Đang chờ tạo nốt nhạc...";
            case STATUS.SHEET_GENERATE_PROCESSING:
                return "Đang tạo nốt nhạc...";
            case STATUS.SHEET_COMPLETED:
                return "Tạo nốt nhạc thành công!";
            case STATUS.SHEET_FAILED:
                return "Tạo nốt nhạc thất bại!";
            default:
                return "";
        }
    }, [sheetStatus]);

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-12 py-6">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 w-full max-w-md">
                    <div className="text-5xl mb-6 text-red-700 animate-bounce">
                        🎵
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                        Vui lòng đăng nhập
                    </h2>
                    <p className="text-gray-600 mb-6 text-center">
                        Bạn cần đăng nhập để truy cập chức năng sáng tác lời bài
                        hát
                    </p>
                    <Link
                        to="/login"
                        state={{ from: "/lyrics-composition" }}
                        className="block bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 text-center"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full pt-2 pb-6 bg-white">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-red-700 mb-2">
                    Sáng tác lời bài hát
                </h1>
                <p className="text-gray-600 text-lg">
                    Để AI sáng tác lời bài hát độc đáo dựa trên chủ đề bạn chọn
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Giai đoạn 1: Lựa chọn chủ đề */}
                <ThemeSelectionStage
                    onGenerateLyrics={handleGenerateLyrics}
                    isGenerating={isGenerating}
                    error={error}
                    onCloseError={handleCloseError}
                    themeOptions={themeOptions}
                    moodOptions={moodOptions}
                />

                {/* Giai đoạn 2 & 3: Hiển thị lời và tạo nhạc */}
                <div className="w-full lg:w-1/2 space-y-6">
                    <LyricsDisplayStage
                        lyrics={lyrics}
                        isGenerating={isGenerating}
                        onCopyLyrics={handleCopyLyrics}
                        onRegenerate={handleRegenerate}
                        onGenerateMusic={handleGenerateMusic}
                        onGenerateSheetMusic={generateSheetMusic}
                        isGeneratingMusic={isGeneratingMusic}
                        isGeneratingSheet={isGeneratingSheet}
                        musicUrl={audioUrl}
                        hasSheetMusic={!!sheetMusic}
                        musicStatusMessage={getMusicStatusMessage()}
                        sheetStatusMessage={getSheetStatusMessage()}
                        videoUrl={video}
                    />

                    <MusicGenerationStage
                        musicStatusMessage={getMusicStatusMessage()}
                        isGeneratingMusic={isGeneratingMusic}
                        audioUrl={audioUrl}
                        onError={setError}
                    />
                </div>
            </div>
            {sheetMusic && <MusicXMLViewer src={sheetMusic} />}
        </div>
    );
};

export default LyricsComposition;
