// frontend/src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/userService";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  X,
  Download,
  Shield,
  Clock,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { storage } from "../utils/storage";

export default function Profile({ setUser }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      console.log("📊 Profile data loaded:", res);
      setProfile(res);
      setFormData(res);
      const file = await fetch(res.avatarUrl);
      console.log(file);
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    console.log("✏️ Entering edit mode");
    setIsEditing(true);
    setFormData({ ...profile });
    setAvatarFile(null);
  };

  const handleCancel = () => {
    console.log("❌ Canceling edit");
    setIsEditing(false);
    setFormData({ ...profile });
    setAvatarFile(null);
  };

  const handleSave = async () => {
    console.log("💾 Saving profile changes...");
    setSaving(true);

    try {
      console.log("📁 Avatar file to upload:", avatarFile);
      console.log("📝 Form data:", formData);

      const updateData = {
        fullName: formData.fullName || "",
        email: formData.email || "",
        phoneNumber: formData.phoneNumber || "",
        bio: formData.bio || "",
        username: formData.username || false,
        avatarFile: avatarFile,
      };

      console.log("🚀 Sending update data:", updateData);

      const res = await updateProfile(updateData);
      console.log("✅ Update successful:", res);
      storage.setAuthData({ user: res });
      setUser(res);

      setProfile(res);
      setIsEditing(false);
      setAvatarFile(null);
      toast.success("Cập nhật thành công!");
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      toast.error("Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log("🖼️ File selected:", file);

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.warning("Vui lòng chọn file ảnh!");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.warning("Kích thước file không được vượt quá 5MB!");
        return;
      }

      setAvatarFile(file);
      console.log(
        "✅ File validated and set:",
        file.name,
        file.size,
        file.type
      );

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          avatarPreview: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      console.log("⚠️ No file selected");
    }
  };

  const handleDownloadAvatar = async () => {
    if (profile?.avatarUrl) {
      try {
        console.log("📥 Downloading avatar...");
        const response = await fetch(profile.avatarUrl);
        if (!response.ok) throw new Error("Network response was not ok");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `avatar-${profile.username}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log("✅ Avatar downloaded successfully");
      } catch (error) {
        console.error("❌ Error downloading avatar:", error);
        toast.error("Lỗi khi tải ảnh về");
      }
    }
  };

  const getAvatarDisplayUrl = () => {
    if (isEditing && formData.avatarPreview) {
      return formData.avatarPreview;
    }
    return profile?.avatarUrl;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center rounded-3xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center rounded-3xl">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Không thể tải thông tin hồ sơ</p>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-100 py-8 rounded-3xl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hồ Sơ Cá Nhân
          </h1>
          <p className="text-lg text-gray-600">
            {isEditing
              ? "Chỉnh sửa thông tin cá nhân"
              : "Quản lý thông tin tài khoản của bạn"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <img
                    src={getAvatarDisplayUrl()}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";
                    }}
                  />

                  {/* Edit Button */}
                  {isEditing ? (
                    <label className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors cursor-pointer">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-full">
                      <button
                        onClick={handleDownloadAvatar}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                        title="Tải ảnh về"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleEdit}
                        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* File Info */}
                {isEditing && avatarFile && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      Ảnh mới:
                    </p>
                    <p className="text-xs text-blue-600 max-w-full overflow-hidden">
                      {avatarFile.name}
                    </p>
                    <p className="text-xs text-blue-600">
                      {(avatarFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fullName || ""}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      className="text-center border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none py-1 bg-transparent w-full"
                      placeholder="Họ và tên"
                    />
                  ) : (
                    profile.fullName
                  )}
                </h2>

                <p className="text-gray-500 text-sm mb-3">
                  @{profile.username}
                </p>

                <div className="mb-4">
                  {isEditing ? (
                    <textarea
                      value={formData.bio || ""}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none resize-none"
                      rows="3"
                      placeholder="Thêm tiểu sử về bản thân..."
                    />
                  ) : (
                    <p className="text-gray-600 text-sm italic">
                      {profile.bio || "Chưa có tiểu sử"}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Mã người dùng</div>
                  <div className="font-mono text-lg font-bold text-gray-900">
                    #{profile.id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-blue-500" />
                    Thông Tin Liên Hệ
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center flex-1">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Email</p>
                          {isEditing ? (
                            <input
                              type="email"
                              value={formData.email || ""}
                              onChange={(e) =>
                                handleChange("email", e.target.value)
                              }
                              className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-1"
                            />
                          ) : (
                            <p className="font-medium text-gray-900">
                              {profile.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center flex-1">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Số điện thoại</p>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={formData.phoneNumber || ""}
                              onChange={(e) =>
                                handleChange("phoneNumber", e.target.value)
                              }
                              className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none py-1"
                            />
                          ) : (
                            <p className="font-medium text-gray-900">
                              {profile.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-orange-500" />
                    Thông Tin Hệ Thống
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500">Tên đăng nhập</p>
                      <p className="font-medium text-gray-900">
                        {profile.username}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500">
                        Đăng nhập lần cuối
                      </p>
                      <p className="font-medium text-gray-900">
                        {formatDate(profile.lastLoginAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Chỉnh sửa hồ sơ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
