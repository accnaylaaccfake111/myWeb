import api from "./api";

export const authService = {
  /**
   * Đăng nhập người dùng
   * @param {Object} loginData - Dữ liệu đăng nhập
   * @param {string} loginData.usernameOrEmail - Tên đăng nhập hoặc email
   * @param {string} loginData.password - Mật khẩu
   * @param {boolean} loginData.rememberMe - Ghi nhớ đăng nhập
   * @returns {Promise} Promise chứa response từ API
   */
  async login(loginData) {
    try {
      const response = await api.post("/auth/login", loginData);
      return response.data;
    } catch (error) {
      console.error("Login service error:", error);
      throw error;
    }
  },

  /**
   * Đăng ký người dùng mới
   * @param {Object} registerData - Dữ liệu đăng ký
   * @param {string} registerData.username - Tên đăng nhập
   * @param {string} registerData.email - Email
   * @param {string} registerData.password - Mật khẩu
   * @param {string} registerData.fullName - Họ và tên
   * @param {string} registerData.phoneNumber - Số điện thoại (optional)
   * @returns {Promise} Promise chứa response từ API
   */
  async register(registerData) {
    try {
      const response = await api.post("/auth/register", registerData);
      return response.data;
    } catch (error) {
      console.error("Register service error:", error);
      throw error;
    }
  },

  /**
   * Đăng xuất người dùng
   * @returns {Promise} Promise chứa response từ API
   */
  async logout() {
    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch (error) {
      console.error("Logout service error:", error);
      throw error;
    }
  },

  /**
   * Làm mới access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} Promise chứa response từ API
   */
  async refreshToken(refreshToken) {
    try {
      const response = await api.post("/auth/refresh", null, {
        params: { refreshToken },
      });
      return response.data;
    } catch (error) {
      console.error("Refresh token service error:", error);
      throw error;
    }
  },

  /**
   * Xác thực email
   * @param {string} token - Token xác thực email
   * @returns {Promise} Promise chứa response từ API
   */
  async verifyEmail(token) {
    try {
      const response = await api.get("/auth/verify-email", {
        params: { token },
      });
      return response.data;
    } catch (error) {
      console.error("Verify email service error:", error);
      throw error;
    }
  },

  /**
   * Gửi lại email xác thực
   * @param {string} email - Email cần gửi lại xác thực
   * @returns {Promise} Promise chứa response từ API
   */
  async resendVerificationEmail(email) {
    try {
      const response = await api.post("/auth/resend-verification", null, {
        params: { email },
      });
      return response.data;
    } catch (error) {
      console.error("Resend verification email service error:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin người dùng hiện tại (nếu cần)
   * @returns {Promise} Promise chứa thông tin user
   */
  async getCurrentUser() {
    try {
      // Giả sử bạn có endpoint /auth/me để lấy thông tin user
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Get current user service error:", error);
      throw error;
    }
  },

  /**
   * Quên mật khẩu (nếu backend có hỗ trợ)
   * @param {string} email - Email để gửi link reset password
   * @returns {Promise} Promise chứa response từ API
   */
  async forgotPassword(email) {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      console.error("Forgot password service error:", error);
      throw error;
    }
  },

  /**
   * Đặt lại mật khẩu (nếu backend có hỗ trợ)
   * @param {string} token - Token reset password
   * @param {string} newPassword - Mật khẩu mới
   * @returns {Promise} Promise chứa response từ API
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Reset password service error:", error);
      throw error;
    }
  },
};

export default authService;
