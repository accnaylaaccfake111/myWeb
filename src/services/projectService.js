import api from "./api";
import { storage } from "../utils/storage";

const API_BASE_URL = process.env.REACT_APP_BE_API || "";

export const projectService = {
    // Cloth Swap Projects
    async fetchClothSwapProjects() {
        const token = storage.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/outfit`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        });
        const result = await response.json();
        if (!result.error) return result.data;
        throw new Error(result.message || "Lỗi khi tải dự án ghép trang phục");
    },

    // Dance Simulation Projects
    async fetchDanceSimulationProjects() {
        const token = storage.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/video-3d`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        });
        const result = await response.json();
        if (result.success) return result.data;
        throw new Error(
            result.message || "Lỗi khi tải dự án mô phỏng điệu múa",
        );
    },

    // Sheet Music Projects
    async fetchSheetMusicProjects() {
        const token = storage.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/sheets`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        });
        const result = await response.json();
        if (result.success) return result.data;
        throw new Error(
            result.message || "Lỗi khi tải dự án sáng tác bài hát",
        );
    },

    // Face Swap Projects
    async fetchFaceSwapProjects() {
        const token = storage.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/face-swap`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        });
        const result = await response.json();
        if (result.success) return result.data;
        throw new Error(
            result.message || "Lỗi khi tải dự án ghép mặt",
        );
    },

    // Sheet Music Detail
    async fetchSheetMusicDetail(id) {
        try {
            const response = await api.get(`/sheets/${id}`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(
                response.data.message || "Lỗi khi tải chi tiết bài hát",
            );
        } catch (error) {
            throw new Error(
                error.response?.data?.message || "Lỗi khi tải chi tiết bài hát",
            );
        }
    },

    // Dance Simulation Detail
    async fetchDanceSimulationDetail(id) {
        const token = storage.getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/video-3d/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "ngrok-skip-browser-warning": true,
            },
        });
        const result = await response.json();
        return result.data;
    },

    // Delete Project
    async deleteProject(projectId, projectType) {
        const token = storage.getAccessToken();

        let endpoint = "";
        switch (projectType) {
            case "FACE_SWAP":
                endpoint = `${API_BASE_URL}/api/face-swap/${projectId}`;
                break;
            case "CLOTH_SWAP":
                endpoint = `${API_BASE_URL}/api/outfit/${projectId}`;
                break;
            case "SHEET_MUSIC":
                endpoint = `${API_BASE_URL}/api/sheets/${projectId}`;
                break;
            case "DANCE_SIMULATION":
                endpoint = `${API_BASE_URL}/api/video-3d/${projectId}`;
                break;
            default:
                endpoint = `${API_BASE_URL}/api/projects/${projectId}`;
        }

        const response = await fetch(endpoint, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "ngrok-skip-browser-warning": true,
            },
        });

        const result = await response.json();

        if (response.ok && result.success) {
            return result;
        }
        throw new Error(result.message || "Lỗi khi xóa dự án");
    },
};

// Export các hàm cũ để tương thích ngược
export const fetchSheetMusicProjects = async (
    setSheetMusicProjects,
    setLoadingSheetMusic,
    setError,
) => {
    try {
        setLoadingSheetMusic(true);
        const data = await projectService.fetchSheetMusicProjects();
        setSheetMusicProjects(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoadingSheetMusic(false);
    }
};

export const fetchFaceSwapProjects = async (
    setFaceSwapProjects,
    setLoadingFaceSwap,
    setError,
) => {
    try {
        setLoadingFaceSwap(true);
        const data = await projectService.fetchFaceSwapProjects();
        setFaceSwapProjects(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoadingFaceSwap(false);
    }
};
