import { storage } from "../utils/storage";

const API_BASE_URL = process.env.REACT_APP_BE_API || "http://localhost:8080";
// const API_BASE_URL = "http://localhost:5000";

class FeedbackService {
    constructor() {
        this.BEARER_TOKEN = storage.getAccessToken();
    }

    getHeaders() {
        return {
            Authorization: `Bearer ${this.BEARER_TOKEN}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": true,
        };
    }

    async getFeedbackSummary() {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/feedbacks/summary`,
                {
                    method: "GET",
                    headers: this.getHeaders(),
                },
            );

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                console.error(
                    "Failed to fetch feedback summary:",
                    response.status,
                );
                throw new Error(
                    `Failed to fetch feedback summary: ${response.status}`,
                );
            }
        } catch (error) {
            console.error("Error fetching feedback summary:", error);
            return null;
        }
    }

    // Fetch recent feedbacks with pagination
    async getRecentFeedbacks(page = 1, size = 10, rate = null) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/feedbacks?page=${page}&size=${size}${rate ? "&rating=" + rate : ""}`,
                {
                    method: "GET",
                    headers: this.getHeaders(),
                },
            );

            if (response.ok) {
                const data = await response.json();
                return this.processFeedbacksResponse(data);
            } else {
                console.error(
                    "Failed to fetch recent feedbacks:",
                    response.status,
                );
                throw new Error(
                    `Failed to fetch recent feedbacks: ${response.status}`,
                );
            }
        } catch (error) {
            console.error("Error fetching recent feedbacks:", error);
            return null;
        }
    }

    // Submit new feedback
    async submitFeedback(feedbackData) {
        if (!feedbackData.content?.trim() || feedbackData.content.length < 10) {
            throw new Error(
                "Feedback content must be at least 10 characters long",
            );
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/feedbacks`, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify({
                    content: feedbackData.content.trim(),
                    rating: feedbackData.rating,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Feedback submitted:", result);
                return result;
            } else {
                const errorText = await response.text();
                console.error(
                    "Failed to submit feedback:",
                    response.status,
                    errorText,
                );
                throw new Error(
                    `Failed to submit feedback: ${response.status}`,
                );
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            return null;
        }
    }

    // Process different API response structures
    processFeedbacksResponse(data) {
        let feedbacks = [];
        let totalPages = 1;
        let totalElements = 0;

        // Extract feedbacks array from different response structures
        if (data.success && data.data && Array.isArray(data.data)) {
            feedbacks = data.data;
        } else if (Array.isArray(data)) {
            feedbacks = data;
        } else if (data.content && Array.isArray(data.content)) {
            feedbacks = data.content;
        } else if (data.feedbacks && Array.isArray(data.feedbacks)) {
            feedbacks = data.feedbacks;
        }

        // Extract pagination info from different response structures
        if (data.totalPages !== undefined) {
            totalPages = data.totalPages;
        } else if (data.totalElements !== undefined) {
            totalElements = data.totalElements;
        } else if (data.totalFeedBack !== undefined) {
            totalElements = data.totalFeedBack;
        }

        return {
            feedbacks,
            totalPages,
            totalElements,
        };
    }

    // Calculate total pages based on total items and items per page
    calculateTotalPages(totalItems, itemsPerPage) {
        return Math.ceil(totalItems / itemsPerPage) || 1;
    }
}

// Create and export a singleton instance
export const feedbackService = new FeedbackService();
export default FeedbackService;
