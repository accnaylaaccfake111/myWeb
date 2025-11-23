// frontend/src/components/NavigationSystem.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
    Home,
    Menu,
    ChevronDown,
    User,
    LogOut,
    FolderOpen,
    Star,
    Sparkles,
    X,
    Music,
    Mic,
    Camera,
    BookOpen,
} from "lucide-react";

const NavigationSystem = ({ isLoggedIn, user, onLogout }) => {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const displayName =
        user?.fullName ||
        user?.name ||
        (user?.email ? user.email.split("@")[0] : "Người dùng");
    const avatarInitial = displayName.charAt(0).toUpperCase();

    // Creative Tools với thiết kế thân thiện
    const creativeTools = [
        {
            id: 1,
            name: "Công cụ hỗ trợ múa",
            path: "/dancing",
            icon: <Sparkles className="w-5 h-5" />,
            description: "Biến ý tưởng thành điệu múa",
            color: "from-pink-500 to-rose-500",
        },
        {
            id: 2,
            name: "Ghép mặt vui nhộn",
            path: "/face-swap",
            icon: <Camera className="w-5 h-5" />,
            description: "Tạo ảnh ghép mặt hài hước",
            color: "from-rose-400 to-red-500",
        },
        {
            id: 3,
            name: "Sáng tác ca dao",
            path: "/lyrics-composition",
            icon: <Music className="w-5 h-5" />,
            description: "Viết lời bài hát với AI",
            color: "from-purple-500 to-pink-500",
        },
        {
            id: 4,
            name: "Hát karaoke",
            path: "/karaoke",
            icon: <Mic className="w-5 h-5" />,
            description: "Hát và nhận điểm thú vị",
            color: "from-blue-500 to-cyan-500",
        },
    ];

    const mainNavItems = [
        {
            path: "/",
            label: "Khám phá",
            icon: <Home className="w-5 h-5" />,
            description: "Trang chủ",
        },
        {
            path: "/cultural-history",
            label: "Di sản văn hóa",
            icon: <BookOpen className="w-5 h-5" />,
            description: "Tìm hiểu lịch sử",
        },
        {
            path: "/my-projects",
            label: "Dự án của tôi",
            icon: <FolderOpen className="w-5 h-5" />,
            description: "Công việc đã lưu",
        },
        {
            path: "/feedback",
            label: "Đánh giá",
            icon: <Star className="w-5 h-5" />,
            description: "Chia sẻ ý kiến",
        },
    ];

    const isActivePath = (path) => {
        return (
            location.pathname === path ||
            location.pathname.startsWith(path + "/")
        );
    };

    // Dropdown Menu thân thiện hơn
    const DropdownMenu = () => (
        <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 py-3 z-50">
            {isLoggedIn ? (
                <>
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-semibold text-sm">
                                {avatarInitial}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">
                                    {displayName}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {user?.email || "Thành viên"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1 px-2 py-2">
                        <button
                            onClick={() => {
                                setShowDropdown(false);
                                navigate("/profile");
                            }}
                            className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-gray-700 hover:bg-pink-50 transition-all duration-200 group"
                        >
                            <User className="h-4 w-4 text-gray-500 group-hover:text-pink-500" />
                            <span className="font-medium text-sm">
                                Hồ sơ cá nhân
                            </span>
                        </button>
                        <button
                            onClick={() => {
                                setShowDropdown(false);
                                navigate("/my-projects");
                            }}
                            className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-gray-700 hover:bg-pink-50 transition-all duration-200 group"
                        >
                            <FolderOpen className="h-4 w-4 text-gray-500 group-hover:text-pink-500" />
                            <span className="font-medium text-sm">
                                Dự án của tôi
                            </span>
                        </button>
                    </div>

                    <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                        <button
                            onClick={() => {
                                setShowDropdown(false);
                                onLogout();
                            }}
                            className="flex items-center space-x-3 w-full px-3 py-2.5 text-gray-500 hover:bg-gray-50 transition-all duration-200 rounded-xl group"
                        >
                            <LogOut className="h-4 w-4 group-hover:text-red-500" />
                            <span className="font-medium text-sm">
                                Đăng xuất
                            </span>
                        </button>
                    </div>
                </>
            ) : (
                <div className="space-y-3 p-3">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">
                            Tham gia cộng đồng sáng tạo
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setShowDropdown(false);
                            navigate("/login");
                        }}
                        className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm"
                    >
                        <User className="h-4 w-4 mr-2" />
                        Đăng nhập ngay
                    </button>
                    <button
                        onClick={() => {
                            setShowDropdown(false);
                            navigate("/register");
                        }}
                        className="flex items-center justify-center w-full px-4 py-3 border-2 border-pink-200 text-pink-600 rounded-xl font-semibold hover:bg-pink-50/80 transition-all duration-300 text-sm"
                    >
                        Tạo tài khoản mới
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-dvh bg-gradient-to-br from-rose-50 via-white to-pink-50">
            <header
                className={`sticky top-0 z-40 transition-all duration-500 ${
                    isScrolled
                        ? "bg-white/90 backdrop-blur-xl border-b border-rose-100/50 shadow-lg"
                        : "bg-white/80 backdrop-blur-lg border-b border-rose-50"
                }`}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between h-20">
                        {/* Left - Logo & Menu */}
                        <div className="flex items-center">
                            <button
                                onClick={() =>
                                    setShowMobileSidebar(!showMobileSidebar)
                                }
                                className="p-2 rounded-xl hover:bg-pink-100 transition-all duration-300 lg:hidden"
                            >
                                <Menu className="h-5 w-5 text-rose-600" />
                            </button>

                            <Link
                                to="/"
                                className="flex items-center space-x-3 group"
                            >
                                <div className="relative">
                                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                                </div>
                                <div className="hidden sm:block">
                                    <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                                        Sắc Bùa Phú Lễ
                                    </span>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Khám phá văn hóa Việt
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* Right - User & Actions */}
                        <div className="flex items-center space-x-4">
                            {/* User Menu */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() =>
                                        setShowDropdown(!showDropdown)
                                    }
                                    className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm pl-3 pr-3 py-2 rounded-2xl shadow-sm border border-pink-100 hover:shadow-lg hover:border-pink-200 transition-all duration-300 group"
                                >
                                    <div className="relative">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-semibold text-sm group-hover:scale-110 transition-transform duration-300">
                                            {isLoggedIn ? (
                                                avatarInitial
                                            ) : (
                                                <User className="h-4 w-4" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <span className="font-semibold text-gray-900 text-sm block">
                                            {isLoggedIn
                                                ? displayName
                                                : "Xin chào!"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {isLoggedIn
                                                ? "Tài khoản"
                                                : "Đăng nhập ngay"}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                                            showDropdown ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                {showDropdown && <DropdownMenu />}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex max-w-7xl mx-auto">
                {/* Desktop Sidebar - Thân thiện hơn */}
                <aside className="sticky top-20 hidden lg:block w-80 h-fit flex-shrink-0 py-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-pink-100/50 p-6 sticky top-24">
                        {/* Main Navigation */}
                        <nav className="mb-8">
                            <div className="space-y-2">
                                {mainNavItems.map((item) => {
                                    const isActive = isActivePath(item.path);
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 group ${
                                                isActive
                                                    ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg"
                                                    : "text-gray-700 hover:bg-pink-50 hover:shadow-md"
                                            }`}
                                        >
                                            <div
                                                className={`p-2 rounded-xl transition-colors ${
                                                    isActive
                                                        ? "bg-white/20"
                                                        : "bg-pink-100 text-pink-600 group-hover:bg-pink-200"
                                                }`}
                                            >
                                                {item.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-sm">
                                                    {item.label}
                                                </div>
                                                <div
                                                    className={`text-xs ${
                                                        isActive
                                                            ? "text-white/90"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    {item.description}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>

                        {/* Creative Tools Section */}
                        <div className="mb-8">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                <Sparkles className="h-4 w-4 text-pink-500 mr-2" />
                                Công cụ sáng tạo
                            </h4>
                            <div className="space-y-3">
                                {creativeTools.map((tool) => {
                                    const isActive = isActivePath(tool.path);
                                    return (
                                        <Link
                                            key={tool.id}
                                            to={tool.path}
                                            className={`block p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 group ${
                                                isActive
                                                    ? `bg-gradient-to-r ${tool.color} text-white shadow-xl border-transparent`
                                                    : "border-pink-100 bg-white hover:border-pink-200 hover:shadow-lg"
                                            }`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div
                                                    className={`p-3 rounded-xl transition-all duration-300 ${
                                                        isActive
                                                            ? "bg-white/20"
                                                            : "bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600 group-hover:scale-110"
                                                    }`}
                                                >
                                                    {tool.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-semibold text-sm">
                                                            {tool.name}
                                                        </span>
                                                        {tool.popular && (
                                                            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                                                                Phổ biến
                                                            </span>
                                                        )}
                                                        {tool.new && (
                                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                                                Mới
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={`text-xs ${
                                                            isActive
                                                                ? "text-white/90"
                                                                : "text-gray-500"
                                                        }`}
                                                    >
                                                        {tool.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>
                {/* Mobile Sidebar */}
                {showMobileSidebar && (
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setShowMobileSidebar(false)}
                    />
                )}

                <aside
                    className={`fixed inset-y-0 left-0 transform ${
                        showMobileSidebar
                            ? "translate-x-0"
                            : "-translate-x-full"
                    } lg:hidden transition-transform duration-300 z-50 w-80 bg-white/95 backdrop-blur-xl border-r border-pink-100 shadow-2xl overflow-y-auto`}
                >
                    <div className="p-6">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900">
                                        Sắc Bùa Phú Lễ
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Khám phá văn hóa
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowMobileSidebar(false)}
                                className="p-2 rounded-xl hover:bg-pink-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="space-y-2 mb-6">
                            {mainNavItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setShowMobileSidebar(false)}
                                    className="flex items-center space-x-3 p-4 rounded-2xl bg-pink-50 hover:bg-pink-100 transition-colors"
                                >
                                    <div className="p-2 rounded-xl bg-white text-pink-600">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">
                                            {item.label}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {item.description}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile Creative Tools */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 text-sm">
                                Công cụ sáng tạo
                            </h4>
                            {creativeTools.map((tool) => (
                                <Link
                                    key={tool.id}
                                    to={tool.path}
                                    onClick={() => setShowMobileSidebar(false)}
                                    className="block p-4 rounded-2xl bg-white border border-pink-100 hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600">
                                            {tool.icon}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm">
                                                {tool.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {tool.description}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>
                {/* Main Content */}
                <main className="flex-1 py-8 ml-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default NavigationSystem;
