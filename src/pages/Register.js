import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import { storage } from "../utils/storage";
import {
    Eye,
    EyeOff,
    UserPlus,
    User,
    Mail,
    Lock,
    ArrowLeft,
    CheckCircle,
    Phone,
    KeyRound,
    Sparkles,
    Shield,
    Smartphone,
    UserCheck,
} from "lucide-react";

const Register = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        phoneNumber: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from || "/";

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        // Enhanced validation
        if (formData.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            setIsLoading(false);
            return;
        }

        if (!formData.email.includes("@")) {
            setError("Email không hợp lệ");
            setIsLoading(false);
            return;
        }

        try {
            const response = await authService.register(formData);

            if (response.success) {
                setSuccess(
                    "🎉 Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
                );

                // Optional: Auto login after registration
                // storage.setAuthData(response.data);
                // onLogin(response.data.user);

                // Redirect after 3 seconds
                setTimeout(() => {
                    navigate("/login", {
                        state: { from: from },
                        replace: true,
                    });
                }, 3000);
            }
        } catch (error) {
            console.error("Register error:", error);
            setError(
                error.response?.data?.message ||
                    "Đăng ký thất bại. Vui lòng thử lại.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="min-h-full bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 flex items-center justify-center p-4 relative overflow-hidden rounded-xl">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-slow"></div>
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-slow delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-slow delay-500"></div>
            </div>

            <div className="max-w-3xl w-full relative z-10">
                {/* Main Register Card */}
                <div className="p-8 transform transition-all duration-500 hover:shadow-3xl">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-red-600 bg-clip-text text-transparent mb-2">
                            Đăng Ký Tài Khoản
                        </h1>
                        <p className="text-gray-600">
                            Tạo tài khoản mới để khám phá di sản văn hóa Việt
                            Nam
                        </p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center animate-fade-in">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                            <p className="text-green-700 font-medium">
                                {success}
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center animate-shake">
                            <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="text-white text-xs font-bold">
                                    !
                                </span>
                            </div>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name Field */}
                            <div className="space-y-3">
                                <label
                                    htmlFor="fullName"
                                    className="block text-sm font-semibold text-gray-700"
                                >
                                    <div className="flex items-center space-x-2">
                                        <UserCheck className="h-4 w-4 text-gray-500" />
                                        <span>Họ và tên</span>
                                    </div>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
                                    </div>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:bg-white focus:bg-white"
                                        placeholder="Nguyễn Văn A"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Username Field */}
                            <div className="space-y-3">
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-semibold text-gray-700"
                                >
                                    <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span>Tên đăng nhập</span>
                                    </div>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserCheck className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
                                    </div>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:bg-white focus:bg-white"
                                        placeholder="username"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email Field */}
                            <div className="space-y-3">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-gray-700"
                                >
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <span>Email</span>
                                    </div>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:bg-white focus:bg-white"
                                        placeholder="username@example.com"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Phone Number Field */}
                            <div className="space-y-3">
                                <label
                                    htmlFor="phoneNumber"
                                    className="block text-sm font-semibold text-gray-700"
                                >
                                    <div className="flex items-center space-x-2">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span>Số điện thoại</span>
                                    </div>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Smartphone className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
                                    </div>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:bg-white focus:bg-white"
                                        placeholder="+84 123 456 789"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Password Field */}
                            <div className="space-y-3">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-gray-700"
                                >
                                    <div className="flex items-center space-x-2">
                                        <Lock className="h-4 w-4 text-gray-500" />
                                        <span>Mật khẩu</span>
                                    </div>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
                                    </div>
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:bg-white focus:bg-white"
                                        placeholder="••••••••"
                                        required
                                        minLength="6"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-amber-600 font-medium">
                                    ⓘ Mật khẩu phải có ít nhất 6 ký tự
                                </p>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-3">
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-semibold text-gray-700"
                                >
                                    <div className="flex items-center space-x-2">
                                        <Lock className="h-4 w-4 text-gray-500" />
                                        <span>Xác nhận mật khẩu</span>
                                    </div>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" />
                                    </div>
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:bg-white focus:bg-white"
                                        placeholder="••••••••"
                                        required
                                        minLength="6"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={
                                            toggleConfirmPasswordVisibility
                                        }
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-amber-600 font-medium">
                                    ⓘ Nhập lại mật khẩu để xác nhận
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="w-[16rem] bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-4 px-6 mx-auto rounded-xl disabled:from-gray-400 disabled:to-gray-500 transition-all duration-500 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none flex items-center justify-center space-x-3 relative overflow-hidden group"
                        >
                            {/* Shine effect */}
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span className="relative">
                                        Đang xử lý...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-5 w-5 relative transform group-hover:scale-110 transition-transform duration-300" />
                                    <span className="relative">Đăng ký</span>
                                </>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="text-center mt-6">
                        <p className="text-gray-600">
                            Đã có tài khoản?{" "}
                            <Link
                                to="/login"
                                className="text-orange-600 hover:text-orange-700 font-bold transition-all duration-300 inline-flex items-center group"
                            >
                                Đăng nhập ngay
                                <ArrowLeft className="h-4 w-4 ml-1 transform rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>
                        </p>
                    </div>

                    {/* Security Badge */}
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                        <div className="flex items-center space-x-3">
                            <Shield className="h-5 w-5 text-amber-600" />
                            <div>
                                <p className="text-amber-800 font-semibold text-sm">
                                    Bảo mật an toàn
                                </p>
                                <p className="text-amber-600 text-xs">
                                    Thông tin của bạn được mã hóa end-to-end
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-gray-500 text-sm">
                        © 2024 Di sản Văn hóa Việt Nam. Bảo tồn và phát huy giá
                        trị lịch sử.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes shake {
                    0%,
                    100% {
                        transform: translateX(0);
                    }
                    25% {
                        transform: translateX(-5px);
                    }
                    75% {
                        transform: translateX(5px);
                    }
                }
                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }
                @keyframes float-slow {
                    0%,
                    100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    33% {
                        transform: translateY(-10px) rotate(2deg);
                    }
                    66% {
                        transform: translateY(5px) rotate(-2deg);
                    }
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes pop-in {
                    0% {
                        transform: scale(0);
                    }
                    70% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-float-slow {
                    animation: float-slow 6s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
                .animate-pop-in {
                    animation: pop-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Register;
