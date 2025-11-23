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
import {
  lyricsService,
  musicService,
  sheetMusicService,
  networkService,
} from "../services/lyricService";

// Constants for status
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
  PROCESSING: STATUS.MUSIC_GENERATE_PROCESSING,
  PENDING: STATUS.MUSIC_GENERATE_PROCESSING,
  COMPLETED: STATUS.MUSIC_COMPLETED,
  SUCCESS: STATUS.MUSIC_COMPLETED,
  FAILED: STATUS.MUSIC_FAILED,
  ERROR: STATUS.MUSIC_FAILED,

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
  const [uploadedAudio, setUploadedAudio] = useState(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Thêm state mới cho chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const audioRef = useRef(null);
  const musicPollingRef = useRef(null);
  const sheetPollingRef = useRef(null);
  const fileInputRef = useRef(null);
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
    []
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

  // Hàm dừng polling
  const stopMusicPolling = useCallback(() => {
    if (musicPollingRef.current) {
      clearTimeout(musicPollingRef.current);
      musicPollingRef.current = null;
      console.log("🛑 Music polling stopped");
    }
  }, []);

  const stopSheetPolling = useCallback(() => {
    if (sheetPollingRef.current) {
      clearTimeout(sheetPollingRef.current);
      sheetPollingRef.current = null;
      console.log("🛑 Sheet music polling stopped");
    }
  }, []);

  // Hàm reset audio state
  const resetAudioState = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  // Hàm xử lý upload file nhạc
  const handleAudioUpload = useCallback(
    async (file) => {
      if (!file) return;

      const allowedTypes = [
        "audio/mpeg",
        "audio/wav",
        "audio/mp3",
        "audio/x-m4a",
        "audio/aac",
        "audio/ogg",
      ];

      const allowedExtensions = [
        ".mp3",
        ".wav",
        ".m4a",
        ".aac",
        ".ogg",
        ".mp4",
      ];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));

      if (
        !allowedTypes.includes(file.type) &&
        !allowedExtensions.includes(fileExtension)
      ) {
        setError("Chỉ chấp nhận file audio (MP3, WAV, M4A, AAC, OGG)");
        return;
      }

      if (file.size > 1000 * 1024 * 1024) {
        setError("File không được lớn hơn 1000MB");
        return;
      }

      try {
        setIsUploadingAudio(true);
        setError("");

        const objectUrl = URL.createObjectURL(file);
        resetAudioState();
        setAudioUrl(objectUrl);
        setUploadedAudio(file);
        setMusicStatus(STATUS.MUSIC_COMPLETED);

        console.log("🎵 Audio file uploaded successfully:", file.name);
      } catch (error) {
        console.error("❌ Audio upload error:", error);
        setError("Lỗi khi tải lên file nhạc: " + error.message);
      } finally {
        setIsUploadingAudio(false);
      }
    },
    [resetAudioState]
  );

  // Hàm xử lý khi chọn file
  const handleFileSelect = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (file) {
        handleAudioUpload(file);
      }
      event.target.value = "";
    },
    [handleAudioUpload]
  );

  // Hàm kích hoạt chọn file
  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Hàm xóa file đã upload
  const handleRemoveUploadedAudio = useCallback(() => {
    if (uploadedAudio) {
      resetAudioState();
      setUploadedAudio(null);
      setAudioUrl(null);
      setMusicStatus(STATUS.DRAFT);
    }
  }, [uploadedAudio, resetAudioState]);

  // Hàm map server status to frontend status
  const mapServerToFrontendStatus = useCallback(
    (serverStatus, type = "music") => {
      if (!serverStatus) return STATUS.DRAFT;

      const upperStatus = serverStatus.toUpperCase();

      if (STATUS_MAPPING[upperStatus]) {
        return STATUS_MAPPING[upperStatus];
      }

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
        if (upperStatus.includes("FAIL") || upperStatus.includes("ERROR")) {
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
        if (upperStatus.includes("FAIL") || upperStatus.includes("ERROR")) {
          return STATUS.SHEET_FAILED;
        }
      }

      return STATUS.DRAFT;
    },
    []
  );

  // Các hàm điều khiển phát nhạc
  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          setError("Lỗi khi phát nhạc: " + error.message);
        });
    }
  }, [isPlaying]);

  const handleSeek = useCallback((newTime) => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  // Format time helper
  const formatTime = useCallback((time) => {
    if (!time || isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Hàm xử lý chỉnh sửa lời bài hát
  const handleStartEditing = useCallback(() => {
    setIsEditing(true);
    setEditedLyrics(lyrics);
  }, [lyrics]);

  const handleCancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditedLyrics("");
    setError("");
  }, []);

  const handleSaveLyrics = useCallback(async () => {
    if (!editedLyrics.trim()) {
      setError("Lời bài hát không được để trống");
      return;
    }

    if (!projectInfor.id) {
      setError("Không tìm thấy ID bài hát để cập nhật");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const result = await lyricsService.update(projectInfor.id, editedLyrics);
      console.log("✅ Lyrics updated successfully:", result);

      // Cập nhật lyrics hiển thị
      setLyrics(editedLyrics);
      setIsEditing(false);

      // Hiển thị thông báo thành công
      alert("Đã lưu chỉnh sửa lời bài hát thành công!");
    } catch (error) {
      console.error("❌ Error saving lyrics:", error);
      setError("Lỗi khi lưu chỉnh sửa: " + error.message);
    } finally {
      setIsSaving(false);
    }
  }, [editedLyrics, projectInfor]);

  const handleLyricsChange = useCallback((e) => {
    setEditedLyrics(e.target.value);
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopMusicPolling();
      stopSheetPolling();
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [stopMusicPolling, stopSheetPolling, audioUrl]);

  // Effect để dừng polling khi status là FAILED
  useEffect(() => {
    if (musicStatus === STATUS.MUSIC_FAILED) {
      stopMusicPolling();
    }
  }, [musicStatus, stopMusicPolling]);

  useEffect(() => {
    if (sheetStatus === STATUS.SHEET_FAILED) {
      stopSheetPolling();
    }
  }, [sheetStatus, stopSheetPolling]);

  useEffect(() => {
    console.log("Location state:", location);
    if (location?.state?.video) {
      setVideo(location.state.video);
    }
  }, [location.state?.video]);

  // Hàm parse lyrics data từ response
  const parseLyricsData = useCallback(
    (data) => {
      if (!data) return "";

      try {
        if (typeof data === "string") {
          return formatLyrics(data);
        }

        if (typeof data === "object") {
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

          if (Array.isArray(data.lyricsVerses)) {
            const cleanVerses = data.lyricsVerses.flat().filter((line) => {
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

        return formatLyrics(String(data));
      } catch (error) {
        console.error("Error parsing lyrics data:", error);
        return "Không thể phân tích dữ liệu lời bài hát từ server.";
      }
    },
    [formatLyrics]
  );

  // Hàm tạo URL audio an toàn
  const createSafeAudioUrl = useCallback((url) => {
    if (!url) return null;

    try {
      if (url.startsWith("http")) {
        return url;
      }

      if (url.startsWith("/")) {
        return `${process.env.REACT_APP_BE_API}${url}`;
      }

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
    let retryCount = 0;
    const maxRetries = 3;

    const attemptFetch = async () => {
      try {
        console.log(`🔍 Checking music task status for: ${taskId}`);
        const result = await musicService.checkStatus(taskId);
        console.log(`📊 Music task status response:`, result);
        return result;
      } catch (error) {
        console.error(
          `❌ Error checking music task status (attempt ${retryCount + 1}):`,
          error
        );

        if (retryCount < maxRetries) {
          retryCount++;
          console.log(
            `🔄 Retrying music status check (${retryCount}/${maxRetries})...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 2000 * retryCount)
          );
          return attemptFetch();
        }
        throw error;
      }
    };

    return attemptFetch();
  }, []);

  // Hàm kiểm tra trạng thái task sheet music
  const checkSheetTaskStatus = useCallback(async (taskId) => {
    let retryCount = 0;
    const maxRetries = 3;

    const attemptFetch = async () => {
      try {
        console.log(`🔍 Checking sheet music task status for: ${taskId}`);
        const result = await sheetMusicService.checkStatus(taskId);
        console.log(`📊 Sheet music task status response:`, result);
        return result;
      } catch (error) {
        console.error(
          `❌ Error checking sheet music task status (attempt ${
            retryCount + 1
          }):`,
          error
        );

        if (retryCount < maxRetries) {
          retryCount++;
          console.log(
            `🔄 Retrying sheet status check (${retryCount}/${maxRetries})...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 2000 * retryCount)
          );
          return attemptFetch();
        }
        throw error;
      }
    };

    return attemptFetch();
  }, []);

  // Hàm chờ cho đến khi task nhạc hoàn thành với polling - ĐÃ SỬA
  const waitForMusicCompletion = useCallback(
    async (taskId, interval = 5000) => {
      let attempts = 0;
      const maxAttempts = 72;

      const poll = async () => {
        // Kiểm tra nếu polling đã bị dừng
        if (musicPollingRef.current === null && attempts > 0) {
          console.log("🛑 Music polling stopped manually");
          return null;
        }

        if (attempts >= maxAttempts) {
          setMusicStatus(STATUS.MUSIC_FAILED);
          stopMusicPolling();
          throw new Error("Music generation timeout after 6 minutes");
        }

        attempts++;

        try {
          const result = await checkMusicTaskStatus(taskId);

          console.log(`🔄 Music polling attempt ${attempts}:`, {
            taskId,
            status: result.status,
            message: result.message,
          });

          const frontendStatus = mapServerToFrontendStatus(
            result.status,
            "music"
          );
          setMusicStatus(frontendStatus);

          switch (frontendStatus) {
            case STATUS.MUSIC_COMPLETED:
              console.log("🎵 Music generation COMPLETED!", result);
              stopMusicPolling();

              const audioUrl =
                result.outputUrl || result.result || result.audioUrl;
              if (!audioUrl) {
                setMusicStatus(STATUS.MUSIC_FAILED);
                throw new Error("No audio URL found in response");
              }

              setProjectInfor((prev) => ({
                ...prev,
                ...result,
              }));

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
              });
              stopMusicPolling();
              throw new Error(
                result.errorMessage ||
                  result.message ||
                  "Music generation failed"
              );

            case STATUS.MUSIC_GENERATE_PROCESSING:
            case STATUS.DRAFT:
              console.log(
                `⏳ Music generation in progress (${attempts}/${maxAttempts})`
              );

              // LUÔN TIẾP TỤC POLLING CHO TRẠNG THÁI PROCESSING
              await new Promise((resolve) => {
                musicPollingRef.current = setTimeout(resolve, interval);
              });
              return await poll();

            default:
              console.warn("⚠️ Unknown music task status:", result.status);
              // TIẾP TỤC POLLING CHO CÁC TRẠNG THÁI KHÁC
              await new Promise((resolve) => {
                musicPollingRef.current = setTimeout(resolve, interval);
              });
              return await poll();
          }
        } catch (error) {
          console.error(`❌ Music polling error attempt ${attempts}:`, error);

          if (attempts >= maxAttempts) {
            stopMusicPolling();
            setMusicStatus(STATUS.MUSIC_FAILED);
            throw error;
          }

          // THỬ LẠI SAU KHI BỊ LỖI
          console.log("🔄 Retrying after error...");
          await new Promise((resolve) => {
            musicPollingRef.current = setTimeout(resolve, interval);
          });
          return await poll();
        }
      };

      return await poll();
    },
    [checkMusicTaskStatus, mapServerToFrontendStatus, stopMusicPolling]
  );

  // Hàm chờ cho đến khi task sheet music hoàn thành với polling - ĐÃ SỬA
  const waitForSheetCompletion = useCallback(
    async (taskId, interval = 10000) => {
      let attempts = 0;
      const maxAttempts = 120;

      const poll = async () => {
        // Kiểm tra nếu polling đã bị dừng
        if (sheetPollingRef.current === null && attempts > 0) {
          console.log("🛑 Sheet music polling stopped manually");
          return null;
        }

        if (attempts >= maxAttempts) {
          setSheetStatus(STATUS.SHEET_FAILED);
          stopSheetPolling();
          throw new Error("Sheet music generation timeout after 20 minutes");
        }

        attempts++;

        try {
          const result = await checkSheetTaskStatus(projectInfor.taskId);
          console.log(`🔄 Sheet music polling attempt ${attempts}:`, {
            taskId,
            status: result.status,
            message: result.message,
          });

          const frontendStatus = mapServerToFrontendStatus(
            result.status,
            "sheet"
          );
          setSheetStatus(frontendStatus);

          switch (frontendStatus) {
            case STATUS.SHEET_COMPLETED:
              console.log("🎼 Sheet music generation COMPLETED!", result);
              stopSheetPolling();

              // Lưu sheet music
              const sheetData =
                result.sheetMusic || result.result || result.data;
              if (sheetData) {
                setSheetMusic(sheetData);
              }

              return result;

            case STATUS.SHEET_FAILED:
              console.error("❌ Sheet music generation failed:", {
                taskId,
                error: result.errorMessage,
                status: result.status,
              });
              stopSheetPolling();
              throw new Error(
                result.errorMessage ||
                  result.message ||
                  "Sheet music generation failed"
              );

            case STATUS.SHEET_GENERATE_PROCESSING:
              console.log(
                `⏳ Sheet music generation in progress (${attempts}/${maxAttempts})`
              );

              // LUÔN TIẾP TỤC POLLING CHO TRẠNG THÁI PROCESSING
              await new Promise((resolve) => {
                sheetPollingRef.current = setTimeout(resolve, interval);
              });
              return await poll();

            default:
              console.warn(
                "⚠️ Unknown sheet music task status:",
                result.status
              );
              // TIẾP TỤC POLLING CHO CÁC TRẠNG THÁI KHÁC
              await new Promise((resolve) => {
                sheetPollingRef.current = setTimeout(resolve, interval);
              });
              return await poll();
          }
        } catch (error) {
          console.error(
            `❌ Sheet music polling error attempt ${attempts}:`,
            error
          );

          if (attempts >= maxAttempts) {
            stopSheetPolling();
            setSheetStatus(STATUS.SHEET_FAILED);
            throw error;
          }

          // THỬ LẠI SAU KHI BỊ LỖI
          console.log("🔄 Retrying after error...");
          await new Promise((resolve) => {
            sheetPollingRef.current = setTimeout(resolve, interval);
          });
          return await poll();
        }
      };

      return await poll();
    },
    [checkSheetTaskStatus, mapServerToFrontendStatus, stopSheetPolling]
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
        setError("");

        resetAudioState();
        setAudioUrl(null);
        setUploadedAudio(null);

        console.log("🎶 Starting music generation with parameters:", {
          theme: themeData.theme,
          mood: themeData.mood,
        });

        const taskData = await musicService.generate(id, themeData);
        console.log("🎵 Music generation task started:", taskData);

        setMusicTask(taskData);

        const taskId = taskData.taskId || taskData.processId;

        if (!taskId) {
          throw new Error("No task ID received from server");
        }

        console.log(`🆔 Starting music polling for task: ${taskId}`);

        // ĐẢM BẢO POLLING BẮT ĐẦU
        musicPollingRef.current = true;

        const finalResult = await waitForMusicCompletion(taskId);

        if (!finalResult) {
          throw new Error("Music generation was cancelled");
        }

        console.log("🎉 Music generation completed successfully:", finalResult);

        const safeAudioUrl = createSafeAudioUrl(finalResult.audioUrl);
        if (!safeAudioUrl) {
          throw new Error("Invalid audio URL received");
        }

        resetAudioState();
        setAudioUrl(safeAudioUrl);

        return finalResult;
      } catch (error) {
        console.error("❌ Music generation error:", error);
        setError("Lỗi khi tạo nhạc: " + error.message);
        setMusicStatus(STATUS.MUSIC_FAILED);
        throw error;
      } finally {
        setIsGeneratingMusic(false);
      }
    },
    [themeData, waitForMusicCompletion, createSafeAudioUrl, resetAudioState]
  );

  // Hàm tạo sheet music - ĐÃ SỬA
  const generateSheetMusic = useCallback(async () => {
    try {
      setIsGeneratingSheet(true);
      setSheetStatus(STATUS.SHEET_GENERATE_PROCESSING);
      setError("");

      console.log("🎼 Starting sheet music generation...");

      let taskData;

      if (uploadedAudio) {
        console.log("🎼 Using NEW API for uploaded file:", uploadedAudio.name);
        taskData = await sheetMusicService.uploadAndGenerate(
          uploadedAudio,
          projectInfor.id
        );
      } else {
        console.log({ projectInfor });
        console.log("🎼 Using OLD API for AI-generated music");
        taskData = await sheetMusicService.generate(
          projectInfor.sheetMusicId,
          projectInfor.sheetMusicId
          //   projectInfor.id,
          //   projectInfor.id
        );
      }

      console.log("🎼 Sheet music generation task started:", taskData);

      setSheetTask(taskData);

      const taskId = taskData.data?.taskId || taskData.processId || taskData.id;

      console.log("Task ID for sheet music:", taskId);

      if (!taskId) {
        console.warn("⚠️ No task ID available for sheet music polling");
        setSheetStatus(STATUS.SHEET_COMPLETED);
        const sheetData =
          taskData.sheetMusic || taskData.result || taskData.data;
        if (sheetData) {
          setSheetMusic(sheetData);
        }
        return taskData;
      }

      console.log(`🆔 Starting sheet music polling for task: ${taskId}`);

      // ĐẢM BẢO POLLING BẮT ĐẦU
      sheetPollingRef.current = true;

      const finalResult = await waitForSheetCompletion(taskId);

      if (!finalResult) {
        console.warn("Sheet music generation returned null result");
        return null;
      }

      // Lưu sheet music
      const sheetData =
        finalResult.sheetMusic || finalResult.result || finalResult.data;
      if (sheetData) {
        setSheetMusic(sheetData);
      }

      return finalResult;
    } catch (error) {
      console.error("❌ Error generating sheet music:", error);
      setError("Lỗi khi tạo nốt nhạc: " + error.message);
      setSheetStatus(STATUS.SHEET_FAILED);
      throw error;
    } finally {
      setIsGeneratingSheet(false);
    }
  }, [projectInfor, waitForSheetCompletion, uploadedAudio]);

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
        setUploadedAudio(null);
        setSheetMusic(null);
        setSheetTask(null);
        setMusicStatus(STATUS.DRAFT);
        setSheetStatus(STATUS.DRAFT);
        setIsEditing(false);
        setEditedLyrics("");

        // Dừng mọi polling đang chạy
        stopMusicPolling();
        stopSheetPolling();

        const isOnline = await networkService.checkConnection();
        if (!isOnline) {
          throw new Error(
            "Không có kết nối internet. Vui lòng kiểm tra mạng của bạn."
          );
        }

        const token = storage.getAccessToken();

        if (!token) {
          throw new Error("Bạn cần đăng nhập để sử dụng tính năng này");
        }

        const responseData = await lyricsService.generate(themeData);
        console.log("Raw API response:", responseData);

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
            "Không thể tìm thấy lời bài hát trong phản hồi từ server."
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
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.";
        } else if (error.message.includes("Token không hợp lệ")) {
          errorMessage = error.message;
          storage.clearAuthData();
          setTimeout(() => {
            navigate("/login", {
              state: { from: "/lyrics-composition" },
            });
          }, 3000);
        } else if (error.message.includes("Không có kết nối internet")) {
          errorMessage = error.message;
        } else {
          errorMessage += error.message;
        }

        setError(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    },
    [
      navigate,
      parseLyricsData,
      resetAudioState,
      stopMusicPolling,
      stopSheetPolling,
    ]
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
    [generateLyrics]
  );

  const handleGenerateMusic = useCallback(async () => {
    try {
      if (!lyrics) {
        setError("Vui lòng tạo lời bài hát trước khi tạo nhạc");
        return;
      }
      console.log("Starting music generation for project:", projectInfor);
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
        return uploadedAudio ? "Đã tải lên file nhạc" : "Đang chờ tạo nhạc...";
      case STATUS.MUSIC_GENERATE_PROCESSING:
        return "Đang tạo nhạc...";
      case STATUS.MUSIC_COMPLETED:
        return uploadedAudio
          ? "Đã tải lên file nhạc thành công!"
          : "Tạo nhạc thành công!";
      case STATUS.MUSIC_FAILED:
        return "Tạo nhạc thất bại!";
      default:
        return "";
    }
  }, [musicStatus, uploadedAudio]);

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
      <div className="min-h-full w-full flex items-center justify-center bg-gray-50 px-12 py-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 w-full max-w-md">
          <div className="text-5xl mb-6 text-red-700 animate-bounce">🎵</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Vui lòng đăng nhập
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Bạn cần đăng nhập để truy cập chức năng sáng tác lời bài hát
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
      {/* Input file ẩn cho upload audio */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="audio/*"
        className="hidden"
      />

      {/* Audio element ẩn với event handlers - SỬA: dùng undefined thay vì "" */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

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
            onUploadAudio={triggerFileSelect}
            onRemoveUploadedAudio={handleRemoveUploadedAudio}
            isGeneratingMusic={isGeneratingMusic}
            isGeneratingSheet={isGeneratingSheet}
            isUploadingAudio={isUploadingAudio}
            musicUrl={audioUrl}
            hasSheetMusic={!!sheetMusic}
            uploadedAudio={uploadedAudio}
            musicStatusMessage={getMusicStatusMessage()}
            sheetStatusMessage={getSheetStatusMessage()}
            videoUrl={video}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            formatTime={formatTime}
            // Thêm props mới cho chỉnh sửa
            isEditing={isEditing}
            editedLyrics={editedLyrics}
            isSaving={isSaving}
            onStartEditing={handleStartEditing}
            onCancelEditing={handleCancelEditing}
            onSaveLyrics={handleSaveLyrics}
            onLyricsChange={handleLyricsChange}
          />

          <MusicGenerationStage
            musicStatusMessage={getMusicStatusMessage()}
            isGeneratingMusic={isGeneratingMusic}
            audioUrl={audioUrl}
            onError={setError}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            formatTime={formatTime}
          />
        </div>
      </div>
      {sheetMusic && <MusicXMLViewer src={sheetMusic} />}
    </div>
  );
};

export default LyricsComposition;
