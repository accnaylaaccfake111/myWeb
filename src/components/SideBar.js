import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Sparkles,
    Music,
    Mic,
    History,
    FolderOpen,
    Star,
    X,
    ArrowRight,
    Zap,
    Camera,
} from "lucide-react";

const Sidebar = ({ showSidebar, toggleSidebar }) => {
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1280);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const mainMenuItems = [
        {
            id: 1,
            name: "Công Cụ Hỗ Trợ Múa",
            path: "/dancing",
            icon: <Sparkles className="w-4 h-4 md:w-5 md:h-5" />,
            description: "Tạo điệu múa với AI",
            color: "from-rose-500 to-red-600",
            bgColor: "purple",
            // badge: "Popular",
        },
        {
            id: 2,
            name: "Ghép mặt vui nhộn",
            path: "/face-swap",
            icon: <Camera className="w-4 h-4 md:w-5 md:h-5" />,
            description: "Biến hóa khuôn mặt",
            color: "from-rose-500 to-red-500",
            bgColor: "blue",
        },
        {
            id: 3,
            name: "Sáng tác lời bài hát",
            path: "/lyrics-composition",
            icon: <Music className="w-4 h-4 md:w-5 md:h-5" />,
            description: "Viết lời bài hát AI",
            color: "from-rose-500 to-red-600",
            bgColor: "green",
            // badge: "New",
        },
        {
            id: 4,
            name: "Karaoke và chấm điểm",
            path: "/karaoke",
            icon: <Mic className="w-4 h-4 md:w-5 md:h-5" />,
            description: "Hát và nhận điểm",
            color: "from-rose-600 to-red-500",
            bgColor: "orange",
        },
    ];

    const mobileMenuItems = [
        {
            id: 6.1,
            name: "Trang chủ",
            path: "/",
            icon: <History className="w-4 h-4 md:w-5 md:h-5" />,
        },
        {
            id: 7,
            name: "Lịch sử văn hóa",
            path: "/cultural-history",
            icon: <History className="w-4 h-4 md:w-5 md:h-5" />,
        },
        {
            id: 8,
            name: "Dự án của tôi",
            path: "/my-projects",
            icon: <FolderOpen className="w-4 h-4 md:w-5 md:h-5" />,
        },
        {
            id: 9,
            name: "Đánh giá & Góp ý",
            path: "/feedback",
            icon: <Star className="w-4 h-4 md:w-5 md:h-5" />,
        },
    ];

    const isActivePath = (path) => {
        return (
            location.pathname === path ||
            location.pathname.includes(path) ||
            location.pathname.startsWith(path + "/")
        );
    };

    const handleLinkClick = () => {
        if (isMobile) {
            toggleSidebar();
        }
    };

    const getBgColorClass = (color) => {
        const colorMap = {
            purple: "bg-purple-100 text-purple-600",
            blue: "bg-blue-100 text-blue-600",
            green: "bg-green-100 text-green-600",
            orange: "bg-orange-100 text-orange-600",
            indigo: "bg-indigo-100 text-indigo-600",
            rose: "bg-rose-100 text-rose-600",
        };
        return colorMap[color] || "bg-gray-100 text-gray-600";
    };

    const getBadgeColor = (badge) => {
        const badgeMap = {
            Popular: "bg-orange-100 text-orange-700 border-orange-200",
            New: "bg-green-100 text-green-700 border-green-200",
            Pro: "bg-purple-100 text-purple-700 border-purple-200",
        };
        return badgeMap[badge] || "bg-gray-100 text-gray-700 border-gray-200";
    };

    return (
        <>
            {/* Mobile Overlay */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 transform ${
                    showSidebar ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0 transition-transform duration-300 ease-out z-50 w-80 sm:w-96 lg:w-80 lg:w-96 bg-white/98 backdrop-blur-xl border-r border-gray-200/80 shadow-2xl overflow-hidden`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200/80 bg-white/95">
                        <div className="flex items-center space-x-4 min-w-0">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                    Bộ công cụ AI
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Sáng tạo văn hóa Việt Nam
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 active:scale-95"
                            aria-label="Đóng menu"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6">
                            {/* Main Menu Grid */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 px-2">
                                    Công cụ sáng tạo
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {mainMenuItems.map((item) => {
                                        const isActive = isActivePath(
                                            item.path,
                                        );
                                        return (
                                            <Link
                                                key={item.id}
                                                to={item.path}
                                                onClick={handleLinkClick}
                                                className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                                                    isActive
                                                        ? `bg-gradient-to-r ${item.color} text-white shadow-xl border-transparent`
                                                        : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg"
                                                }`}
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div
                                                        className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${
                                                            isActive
                                                                ? "bg-white/20 text-white"
                                                                : getBgColorClass(
                                                                      item.bgColor,
                                                                  )
                                                        } group-hover:scale-110`}
                                                    >
                                                        {item.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <div
                                                                className={`font-semibold transition-colors duration-300 text-base truncate ${
                                                                    isActive
                                                                        ? "text-white"
                                                                        : "text-gray-900 group-hover:text-gray-950"
                                                                }`}
                                                            >
                                                                {item.name}
                                                            </div>
                                                            {item.badge &&
                                                                !isActive && (
                                                                    <span
                                                                        className={`text-xs px-1.5 py-0.5 rounded-full border ${getBadgeColor(
                                                                            item.badge,
                                                                        )} flex-shrink-0`}
                                                                    >
                                                                        {
                                                                            item.badge
                                                                        }
                                                                    </span>
                                                                )}
                                                        </div>
                                                        <div
                                                            className={`transition-colors duration-300 text-sm truncate ${
                                                                isActive
                                                                    ? "text-white/90"
                                                                    : "text-gray-500 group-hover:text-gray-600"
                                                            }`}
                                                        >
                                                            {item.description}
                                                        </div>
                                                    </div>
                                                    {isActive && (
                                                        <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse flex-shrink-0"></div>
                                                    )}
                                                </div>
                                                {!isActive && (
                                                    <div
                                                        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                                                    ></div>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Promo Card */}
                            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-red-50/80 to-orange-50/80 border border-red-200/80 shadow-lg overflow-hidden">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-300 rounded-full -translate-y-16 translate-x-16"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-300 rounded-full -translate-x-12 translate-y-12"></div>
                                </div>
                                <div className="relative">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
                                            <Sparkles className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 text-lg truncate">
                                                Khám phá ngay
                                            </h3>
                                            <p className="text-sm text-gray-600 truncate">
                                                Di sản văn hóa độc đáo
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-4 leading-relaxed text-sm">
                                        Trải nghiệm vẻ đẹp văn hóa Việt Nam qua
                                        các công cụ AI hiện đại. Sáng tạo nội
                                        dung độc đáo và ý nghĩa.
                                    </p>
                                    <Link
                                        to="/cultural-history"
                                        onClick={handleLinkClick}
                                        className="relative inline-flex items-center space-x-2 px-4 py-3 bg-white text-red-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group text-sm"
                                    >
                                        <span>Bắt đầu khám phá</span>
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                                    </Link>
                                </div>
                            </div>

                            {/* Mobile Only Navigation */}
                            <div className="lg:hidden mt-8">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                                    Điều hướng
                                </h3>
                                <div className="space-y-2">
                                    {mobileMenuItems.map((item) => {
                                        const isActive = isActivePath(
                                            item.path,
                                        );
                                        return (
                                            <Link
                                                key={item.id}
                                                to={item.path}
                                                onClick={handleLinkClick}
                                                className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                                                    isActive
                                                        ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg"
                                                        : "bg-gray-50/80 text-gray-700 hover:bg-gray-100/80 hover:shadow-md"
                                                }`}
                                            >
                                                <div
                                                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                                                        isActive
                                                            ? "bg-white/20"
                                                            : "bg-white"
                                                    }`}
                                                >
                                                    {item.icon}
                                                </div>
                                                <span className="font-semibold text-base truncate">
                                                    {item.name}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200/80 bg-white/95">
                        <div className="text-center">
                            <p className="text-xs text-gray-500">
                                Phiên bản 2.0 • Sắc bùa Phú Lễ
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Di sản văn hóa Việt Nam
                            </p>
                            <div className="mt-2 flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-600 font-medium">
                                    Tất cả hệ thống hoạt động tốt
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Desktop Spacer */}
            <div className="hidden lg:block w-96 flex-shrink-0" />
        </>
    );
};

export default Sidebar;
