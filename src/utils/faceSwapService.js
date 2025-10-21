import { faceSwapApi } from "./apiService";

class FaceSwapService {
    // API bắt đầu xử lý face swap
    async processFaceSwap(sourceImage, targetVideo) {
        const formData = new FormData();
        formData.append("sourceImage", sourceImage);
        formData.append("targetVideo", targetVideo);

        return faceSwapApi.post("/process", formData);
    }

    // API kiểm tra trạng thái xử lý
    async checkProcessStatus(projectId) {
        return faceSwapApi.get(`/status/${projectId}`);
    }

    // API hủy quá trình xử lý
    async cancelProcess(projectId) {
        return faceSwapApi.post(`/cancel/${projectId}`);
    }

    // Lấy lịch sử projects
    async getProjects(limit = 10, offset = 0) {
        return faceSwapApi.get(`/projects?limit=${limit}&offset=${offset}`);
    }

    // Xóa project
    async deleteProject(projectId) {
        return faceSwapApi.delete(`/project/${projectId}`);
    }
}

export const faceSwapService = new FaceSwapService();
