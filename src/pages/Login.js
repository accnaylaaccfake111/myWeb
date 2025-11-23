import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import { storage } from "../utils/storage";
import {
    Eye,
    EyeOff,
    LogIn,
    User,
    Lock,
    ArrowLeft,
    CheckCircle,
    Mail,
    KeyRound,
    Shield,
} from "lucide-react";

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        usernameOrEmail: "",
        password: "",
        rememberMe: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
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
        setSuccessMessage("");

        if (!formData.usernameOrEmail.trim() || !formData.password.trim()) {
            setError("Vui lòng điền đầy đủ thông tin đăng nhập");
            setIsLoading(false);
            return;
        }

        try {
            const response = await authService.login(formData);

            if (response.success) {
                storage.setAuthData(response.data);
                onLogin(response.data.user);

                setSuccessMessage(
                    "🎉 Đăng nhập thành công! Đang chuyển hướng...",
                );

                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 1500);
            }
        } catch (error) {
            console.error("Login error:", error);
            setError(
                error.response?.data?.message ||
                    "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-full bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 flex items-center justify-center px-4 py-8 relative overflow-hidden rounded-xl">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-slow"></div>
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-slow delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float-slow delay-500"></div>
            </div>

            <div className="max-w-xl w-full relative z-10">
                {/* Main Login Card */}
                <div className="p-8 transform transition-all duration-500 hover:shadow-3xl">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-red-600 bg-clip-text text-transparent mb-2">
                            Đăng Nhập
                        </h1>
                        <p className="text-gray-600">
                            Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục
                        </p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center animate-fade-in">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                            <p className="text-green-700 font-medium">
                                {successMessage}
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

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username/Email Field */}
                        <div className="space-y-3">
                            <label
                                htmlFor="usernameOrEmail"
                                className="block text-sm font-semibold text-gray-700"
                            >
                                <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span>Tên đăng nhập hoặc Email</span>
                                </div>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors duration-300" />
                                </div>
                                <input
                                    type="text"
                                    id="usernameOrEmail"
                                    name="usernameOrEmail"
                                    value={formData.usernameOrEmail}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:bg-white focus:bg-white"
                                    placeholder="username@example.com"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

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
                                    <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors duration-300" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-300 text-gray-800 placeholder-gray-400 hover:bg-white focus:bg-white"
                                    placeholder="••••••••"
                                    required
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
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        className="sr-only"
                                        disabled={isLoading}
                                    />
                                    <div
                                        className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                                            formData.rememberMe
                                                ? "bg-rose-500 border-rose-500 shadow-md shadow-rose-500/25"
                                                : "bg-white border-gray-300"
                                        }`}
                                    >
                                        {formData.rememberMe && (
                                            <CheckCircle className="h-3 w-3 text-white animate-pop-in" />
                                        )}
                                    </div>
                                </div>
                                <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-200">
                                    Ghi nhớ đăng nhập
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white py-4 px-6 rounded-xl disabled:from-gray-400 disabled:to-gray-500 transition-all duration-500 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none flex items-center justify-center space-x-3 relative overflow-hidden group"
                        >
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span className="relative">
                                        Đang xác thực...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5 relative transform group-hover:scale-110 transition-transform duration-300" />
                                    <span className="relative">Đăng nhập</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="text-center mt-4">
                        <p className="text-gray-600">
                            Chưa có tài khoản?{" "}
                            <Link
                                to="/register"
                                className="text-rose-600 hover:text-rose-700 font-bold transition-all duration-300 inline-flex items-center group"
                            >
                                Đăng ký ngay
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

export default Login;
