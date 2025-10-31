// services/apiService.js
import { storage } from "../utils/storage";

const API_BASE_URL = process.env.REACT_APP_BE_API;

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
    const token = storage.getAccessToken();

    const defaultHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": true,
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `HTTP error! status: ${response.status}, ${errorText}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error(`API call error for ${endpoint}:`, error);
        throw error;
    }
};

// Lyrics API Service
export const lyricsService = {
    // Generate new lyrics
    generate: async (themeData) => {
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

        return await apiCall("/api/lyrics/generate", {
            method: "POST",
            body: JSON.stringify(requestBody),
        });
    },

    // Update existing lyrics
    update: async (lyricId, lyric) => {
        return await apiCall(`/api/lyrics/update`, {
            method: "PUT",
            body: JSON.stringify({
                id: lyricId,
                lyrics: lyric
            }),
        });
    },
};

// Music API Service
export const musicService = {
    // Generate music from lyrics
    generate: async (lyricId, themeData) => {
        const requestBody = {
            lyricId: lyricId,
            userName: null,
            theme: themeData.theme,
            mood: themeData.mood,
            duration: 16,
        };

        return await apiCall("/api/music/generate", {
            method: "POST",
            body: JSON.stringify(requestBody),
        });
    },

    // Check music generation status
    checkStatus: async (taskId) => {
        return await apiCall(`/api/music/status/${taskId}`);
    },
};

// Sheet Music API Service
export const sheetMusicService = {
    // Generate sheet music from AI music
    generate: async (musicId, lyricId) => {
        const requestBody = {
            musicId: musicId,
            lyricId: lyricId,
        };

        return await apiCall("/api/sheets/generate", {
            method: "POST",
            body: JSON.stringify(requestBody),
        });
    },

    // Upload audio file and generate sheet music
    uploadAndGenerate: async (file, lyricId) => {
        const token = storage.getAccessToken();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("lyricId", lyricId);

        const response = await fetch(`${API_BASE_URL}/api/sheets/file-upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": true,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }

        return await response.json();
    },

    // Check sheet music generation status
    checkStatus: async (taskId) => {
        return await apiCall(`/api/music/status/${taskId}`);
    },
};

// Network utility
export const networkService = {
    checkConnection: async () => {
        try {
            await fetch("https://httpbin.org/get", {
                method: "GET",
                mode: "no-cors",
            });
            return true;
        } catch (error) {
            return false;
        }
    },
};

export default {
    lyrics: lyricsService,
    music: musicService,
    sheetMusic: sheetMusicService,
    network: networkService,
};
