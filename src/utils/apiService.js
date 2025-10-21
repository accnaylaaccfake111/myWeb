import { storage } from "./storage";

class ApiService {
    constructor(baseURL) {
        this.baseURL =
            baseURL || "https://wavy-supercoincident-artie.ngrok-free.dev/api";
    }

    // Hàm lấy headers với token
    getHeaders(includeToken = true, customHeaders = {}) {
        const headers = {
            Accept: "application/json",
            "ngrok-skip-browser-warning": true,
            ...customHeaders,
        };

        if (includeToken) {
            const token = storage.getAccessToken();
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Hàm kiểm tra token có hợp lệ không
    isValidToken(token) {
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp * 1000 > Date.now();
        } catch (error) {
            return false;
        }
    }

    // Hàm xử lý response
    async handleResponse(response) {
        if (response.status === 401) {
            throw new Error("Token không hợp lệ, vui lòng đăng nhập lại");
        }

        if (response.status === 403) {
            throw new Error("Bạn không có quyền truy cập tính năng này");
        }

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;

            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorMessage;
            } catch {
                errorMessage = errorText || errorMessage;
            }

            throw new Error(errorMessage);
        }

        return response.json();
    }

    // GET request
    async get(endpoint, includeToken = true) {
        const token = storage.getAccessToken();
        if (includeToken && (!token || !this.isValidToken(token))) {
            throw new Error("Token không hợp lệ, vui lòng đăng nhập lại");
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: "GET",
            headers: this.getHeaders(includeToken),
        });

        return this.handleResponse(response);
    }

    // POST request
    async post(endpoint, data = null, includeToken = true) {
        const token = storage.getAccessToken();
        if (includeToken && (!token || !this.isValidToken(token))) {
            throw new Error("Token không hợp lệ, vui lòng đăng nhập lại");
        }

        const isFormData = data instanceof FormData;
        const headers = this.getHeaders(
            includeToken,
            isFormData ? {} : { "Content-Type": "application/json" },
        );

        const body = isFormData ? data : JSON.stringify(data);

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: "POST",
            headers,
            body,
        });

        return this.handleResponse(response);
    }

    // PUT request
    async put(endpoint, data = null, includeToken = true) {
        const token = storage.getAccessToken();
        if (includeToken && (!token || !this.isValidToken(token))) {
            throw new Error("Token không hợp lệ, vui lòng đăng nhập lại");
        }

        const headers = this.getHeaders(includeToken, {
            "Content-Type": "application/json",
        });

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(data),
        });

        return this.handleResponse(response);
    }

    // DELETE request
    async delete(endpoint, includeToken = true) {
        const token = storage.getAccessToken();
        if (includeToken && (!token || !this.isValidToken(token))) {
            throw new Error("Token không hợp lệ, vui lòng đăng nhập lại");
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: "DELETE",
            headers: this.getHeaders(includeToken),
        });

        return this.handleResponse(response);
    }

    // PATCH request
    async patch(endpoint, data = null, includeToken = true) {
        const token = storage.getAccessToken();
        if (includeToken && (!token || !this.isValidToken(token))) {
            throw new Error("Token không hợp lệ, vui lòng đăng nhập lại");
        }

        const headers = this.getHeaders(includeToken, {
            "Content-Type": "application/json",
        });

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(data),
        });

        return this.handleResponse(response);
    }
}

// Tạo instance chính
export const apiService = new ApiService();

// Hoặc tạo các instance cho từng module
export const authApi = new ApiService(
    "https://wavy-supercoincident-artie.ngrok-free.dev/api/auth",
);
export const faceSwapApi = new ApiService(
    "https://wavy-supercoincident-artie.ngrok-free.dev/api/face-swap",
);
export const userApi = new ApiService(
    "https://wavy-supercoincident-artie.ngrok-free.dev/api/user",
);
export const projectApi = new ApiService(
    "https://wavy-supercoincident-artie.ngrok-free.dev/api/project",
);
