import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Home,
    Menu,
    ChevronDown,
    User,
    LogOut,
    FolderOpen,
    Star,
    History,
    Sparkles,
    Search,
    X,
} from "lucide-react";

const Header = ({ isLoggedIn, user, onLogout, toggleSidebar }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const mobileSearchRef = useRef(null);

    // Hiệu ứng scroll với debounce
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 10);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
            if (
                mobileSearchRef.current &&
                !mobileSearchRef.current.contains(event.target) &&
                showMobileSearch
            ) {
                setShowMobileSearch(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMobileSearch]);

    // Đóng search khi nhấn ESC
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === "Escape" && showMobileSearch) {
                setShowMobileSearch(false);
            }
        };

        document.addEventListener("keydown", handleEscKey);
        return () => document.removeEventListener("keydown", handleEscKey);
    }, [showMobileSearch]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log("Search:", searchQuery);
            setShowMobileSearch(false);
        }
    };

    // Hàm xử lý navigation từ dropdown
    const handleDropdownNavigation = (path) => {
        setShowDropdown(false);
        navigate(path);
    };

    // Hàm xử lý logout
    const handleLogout = () => {
        setShowDropdown(false);
        onLogout();
        navigate("/login");
    };

    // Lấy thông tin hiển thị từ user data
    const displayName =
        user?.fullName ||
        user?.name ||
        (user?.email ? user.email.split("@")[0] : "Người dùng");
    const avatarUrl = user?.avatarUrl;
    const avatarInitial = displayName.charAt(0).toUpperCase();

    const navItems = [
        { path: "/", label: "Trang chủ", icon: <Home className="w-4 h-4" /> },
        {
            path: "/cultural-history",
            label: "Lịch sử văn hóa",
            icon: <History className="w-4 h-4" />,
        },
        {
            path: "/my-projects",
            label: "Dự án của tôi",
            icon: <FolderOpen className="w-4 h-4" />,
        },
        {
            path: "/feedback",
            label: "Đánh giá",
            icon: <Star className="w-4 h-4" />,
        },
    ];

    // Dropdown menu component tái sử dụng
    const DropdownMenu = () => (
        <div className="absolute right-0 mt-2 lg:mt-3 w-48 lg:w-56 xl:w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/80 py-2 z-50">
            {isLoggedIn ? (
                <>
                    <div className="px-4 py-3 border-b border-gray-100/80">
                        <p className="font-semibold text-gray-900 text-sm lg:text-base">
                            {displayName}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-500 mt-1">
                            {user?.email || "Thành viên"}
                        </p>
                    </div>
                    <div className="space-y-1 px-2 py-2">
                        <button
                            onClick={() => handleDropdownNavigation("/profile")}
                            className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-gray-700 hover:bg-red-50/80 transition-all duration-200 group text-left"
                        >
                            <User className="h-4 w-4 lg:h-5 lg:w-5" />
                            <span className="font-medium text-sm lg:text-base">
                                Hồ sơ cá nhân
                            </span>
                        </button>
                        <button
                            onClick={() =>
                                handleDropdownNavigation("/my-projects")
                            }
                            className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-gray-700 hover:bg-red-50/80 transition-all duration-200 group text-left"
                        >
                            <FolderOpen className="h-4 w-4 lg:h-5 lg:w-5" />
                            <span className="font-medium text-sm lg:text-base">
                                Dự án của tôi
                            </span>
                        </button>
                    </div>
                    <div className="border-t border-gray-100/80 mt-2 pt-2">
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50/80 transition-all duration-200 group rounded-xl text-left"
                        >
                            <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
                            <span className="font-medium text-sm lg:text-base">
                                Đăng xuất
                            </span>
                        </button>
                    </div>
                </>
            ) : (
                <div className="space-y-2 p-2">
                    <button
                        onClick={() => handleDropdownNavigation("/login")}
                        className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base"
                    >
                        Đăng nhập ngay
                    </button>
                    <button
                        onClick={() => handleDropdownNavigation("/register")}
                        className="flex items-center justify-center w-full px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50/80 transition-all duration-300 text-sm lg:text-base"
                    >
                        Tạo tài khoản
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? "bg-white/98 backdrop-blur-xl border-b border-gray-200/80 shadow-lg"
                    : "bg-white/95 backdrop-blur-lg border-b border-gray-100"
            }`}
        >
            <div className="mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                {/* Main Header - Responsive cho tất cả kích thước */}
                <div className="flex items-center justify-between h-14 lg:h-16 xl:h-20 py-2">
                    {/* Left Section - Logo & Menu Toggle */}
                    <div className="flex items-center space-x-2 lg:space-x-3 xl:space-x-4 flex-shrink-0">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-xl hover:bg-red-50 transition-all duration-200 active:scale-95 lg:hidden xl:hidden"
                            aria-label="Toggle menu"
                        >
                            <Menu className="h-5 w-5 text-red-600" />
                        </button>

                        <Link
                            to="/"
                            className="flex items-center space-x-2 lg:space-x-3 group flex-shrink-0"
                        >
                            <div className="relative">
                                <div className="h-8 w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                    <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-base lg:text-lg xl:text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                    Sắc bùa Phú Lễ
                                </span>
                                <p className="text-xs text-gray-500 mt-0.5 hidden md:block">
                                    Di sản văn hóa Việt Nam
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Center Navigation - Ẩn trên mobile, hiện trên tablet+ */}
                    <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 mx-4 lg:mx-8">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative flex items-center space-x-2 px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 xl:py-3 rounded-xl lg:rounded-2xl font-semibold transition-all duration-300 group ${
                                        isActive
                                            ? "text-white bg-gradient-to-r from-red-500 to-pink-600 shadow-lg shadow-red-200/50"
                                            : "text-gray-700 hover:text-red-700 hover:bg-red-50/80"
                                    }`}
                                >
                                    <span
                                        className={`transition-colors duration-200 ${
                                            isActive
                                                ? "text-white"
                                                : "text-gray-400 group-hover:text-red-600"
                                        }`}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="text-sm lg:text-base whitespace-nowrap">
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <div className="absolute -bottom-1 lg:-bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white rounded-full shadow-lg"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Section - Search & Account */}
                    <div className="flex items-center space-x-1 lg:space-x-2 xl:space-x-3 flex-shrink-0">
                        {/* Search Button - Ẩn trên mobile nhỏ, hiện trên tablet+ */}
                        <button
                            onClick={() =>
                                setShowMobileSearch(!showMobileSearch)
                            }
                            className="hidden sm:flex p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                            aria-label="Tìm kiếm"
                        >
                            {showMobileSearch ? (
                                <X className="h-5 w-5 text-gray-600" />
                            ) : (
                                <Search className="h-5 w-5 text-gray-600" />
                            )}
                        </button>

                        {/* Account Section */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center space-x-2 bg-white pl-2 lg:pl-3 xl:pl-4 pr-1 lg:pr-2 xl:pr-3 py-1.5 lg:py-2 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-red-100 transition-all duration-300 group active:scale-95"
                                aria-label="Tài khoản"
                            >
                                <div className="relative">
                                    {isLoggedIn && avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Avatar"
                                            className="h-6 w-6 lg:h-8 lg:w-8 xl:h-9 xl:w-9 rounded-full object-cover shadow-inner border-2 border-white"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                                e.target.nextSibling.style.display =
                                                    "flex";
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className={`rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white font-semibold shadow-inner border-2 border-white ${
                                            isLoggedIn
                                                ? "h-6 w-6 lg:h-8 lg:w-8 xl:h-9 xl:w-9 text-xs lg:text-sm"
                                                : "h-6 w-6 lg:h-8 lg:w-8"
                                        } ${
                                            avatarUrl && isLoggedIn
                                                ? "hidden"
                                                : "flex"
                                        }`}
                                    >
                                        {isLoggedIn ? (
                                            avatarInitial
                                        ) : (
                                            <User className="h-3 w-3 lg:h-4 lg:w-4" />
                                        )}
                                    </div>
                                    {isLoggedIn && (
                                        <div className="absolute -bottom-0.5 -right-0.5 lg:-bottom-1 lg:-right-1 w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>

                                <div className="hidden lg:block text-left">
                                    <span className="font-semibold text-gray-900 block leading-tight text-sm">
                                        {isLoggedIn ? displayName : "Đăng nhập"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {isLoggedIn
                                            ? "Tài khoản"
                                            : "Truy cập ngay"}
                                    </span>
                                </div>

                                <ChevronDown
                                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                                        showDropdown ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {showDropdown && <DropdownMenu />}
                        </div>

                        {/* Mobile Search Button - Chỉ hiện trên mobile nhỏ */}
                        <button
                            onClick={() =>
                                setShowMobileSearch(!showMobileSearch)
                            }
                            className="sm:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                            aria-label="Tìm kiếm"
                        >
                            {showMobileSearch ? (
                                <X className="h-5 w-5 text-gray-600" />
                            ) : (
                                <Search className="h-5 w-5 text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search - Hiện khi bật search */}
                {showMobileSearch && (
                    <div className="pb-3" ref={mobileSearchRef}>
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative"
                        >
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm công cụ, dự án..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 text-sm"
                                autoFocus
                            />
                        </form>
                    </div>
                )}

                {/* Bottom Navigation - Chỉ hiện trên mobile */}
                <nav className="flex md:hidden items-center justify-around py-2 border-t border-gray-100/80 bg-white/95">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center space-y-1 p-1 rounded-xl transition-all duration-200 flex-1 mx-0.5 ${
                                    isActive
                                        ? "text-red-600 bg-red-50/80"
                                        : "text-gray-600 hover:text-red-600 hover:bg-gray-50/80"
                                }`}
                            >
                                <div
                                    className={`p-1.5 rounded-lg transition-colors ${
                                        isActive
                                            ? "bg-red-100 text-red-600"
                                            : "bg-gray-100 text-gray-500"
                                    }`}
                                >
                                    {React.cloneElement(item.icon, {
                                        className: "h-4 w-4",
                                    })}
                                </div>
                                <span className="text-xs font-medium text-center leading-tight whitespace-nowrap">
                                    {item.label.split(" ")[0]}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
};

export default Header;
