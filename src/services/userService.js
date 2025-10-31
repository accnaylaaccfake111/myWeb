import axios from "axios";
import { storage } from "../utils/storage";
import api from "./api";

const API_BASE_URL = process.env.REACT_APP_BE_API || "http://localhost:8080";
// const API_BASE_URL = "http://localhost:5000";
const BEARER_TOKEN = storage.getAccessToken();

export async function getProfile() {
    try {
        const response = await api.get(`${API_BASE_URL}/api/users/my-profile`, {
            headers: {
                Authorization: `Bearer ${BEARER_TOKEN}`,
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to get profile:", error);
        throw error;
    }
}

export const updateProfile = async (profileData) => {
    try {
        console.log("📦 Received profile data:", profileData.avatarFile);

        const formData = new FormData();
        if (profileData.avatarFile)
            formData.append("file", profileData.avatarFile);

        const userData = {
            username: profileData.username || "",
            email: profileData.email || "",
            fullName: profileData.fullName || "",
            phoneNumber: profileData.phoneNumber || "",
            bio: profileData.bio || "",
        };

        formData.append("user", JSON.stringify(userData));

        // Debug FormData contents
        console.log("📋 FormData contents:");
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}:`, value);
        }

        const response = await axios.put(
            `${API_BASE_URL}/api/users/update`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${BEARER_TOKEN}`,
                    Accept: "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
            },
        );

        console.log("✅ File upload successful:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Profile update failed:", error);
        if (error.response) {
            console.error("📊 Error response:", error.response.data);
            console.error("🚦 Error status:", error.response.status);
        }
        return null;
    }
};
