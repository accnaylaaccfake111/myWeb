export const storage = {
  // Lưu token và user info
  setAuthData(authData) {
    const { accessToken, refreshToken, user } = authData;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  },

  // Lấy access token
  getAccessToken() {
    return localStorage.getItem("accessToken");
  },

  // Lấy refresh token
  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  },

  // Lấy thông tin user
  getUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Xóa tất cả auth data
  clearAuthData() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated() {
    return !!this.getAccessToken();
  },
};
