import { storage } from "../utils/storage";
const API_BASE_URL = process.env.REACT_APP_BE_API || "";

export const getFaceData = async () => {
    try {
        const token = storage.getAccessToken();

        const response = await fetch(`${API_BASE_URL}/api/face-swap`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "ngrok-skip-browser-warning": true,
            },
        });

        return await response.json();
    } catch (ex) {
        console.log(ex);
        return null;
    }
};

export const fetchFaceSwapProjects = async (
    setFaceSwapProjects,
    setLoadingFaceSwap,
    setError,
) => {
    try {
        setLoadingFaceSwap(true);
        const result = await getFaceData();
        console.log("Face swap projects:", result);

        if (result.success) {
            setFaceSwapProjects(result.data);
        } else {
            setError(result.message || "Lỗi khi tải danh sách ghép mặt");
        }
    } catch (err) {
        console.error("Error fetching face swap projects:", err);
        setError(err.message);
    } finally {
        setLoadingFaceSwap(false);
    }
};

// Fetch sheet music projects
export const fetchSheetMusicProjects = async (
    setSheetMusicProjects,
    setLoadingSheetMusic,
    setError,
) => {
    try {
        setLoadingSheetMusic(true);
        const token = storage.getAccessToken();

        const response = await fetch(`${API_BASE_URL}/api/sheets`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "ngrok-skip-browser-warning": true,
            },
        });

        const result = await response.json();
        console.log("Sheet music projects:", result);

        if (result.success) {
            setSheetMusicProjects(result.data);
        } else {
            setError(result.message || "Lỗi khi tải danh sách bài hát");
        }
    } catch (err) {
        console.error("Error fetching sheet music projects:", err);
        setError(err.message);
    } finally {
        setLoadingSheetMusic(false);
    }
};
