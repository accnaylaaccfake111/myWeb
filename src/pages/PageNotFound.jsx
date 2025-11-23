import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, AlertCircle, Sparkles } from "lucide-react";

const PageNotFound = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setIsVisible(true);

        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const floatingElements = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        size: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 10,
        x: Math.random() * 100,
    }));

    return (
        <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden rounded-3xl">
            {/* Floating background elements */}
            <div className="absolute inset-0 overflow-hidden">
                {floatingElements.map((element) => (
                    <div
                        key={element.id}
                        className="absolute rounded-full bg-gradient-to-r from-red-100/30 to-amber-100/30 backdrop-blur-sm"
                        style={{
                            width: `${element.size}px`,
                            height: `${element.size}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${element.x}%`,
                            animation: `float ${element.duration}s ease-in-out ${element.delay}s infinite alternate`,
                        }}
                    />
                ))}
            </div>

            {/* Mouse follower gradient */}
            <div
                className="absolute pointer-events-none w-96 h-96 bg-gradient-to-r from-red-200/20 to-amber-200/20 rounded-full blur-3xl transition-all duration-100 ease-out"
                style={{
                    transform: `translate(${mousePosition.x - 192}px, ${
                        mousePosition.y - 192
                    }px)`,
                }}
            />

            <div
                className={`max-w-lg w-full text-center relative z-10 transition-all duration-1000 ${
                    isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8"
                }`}
            >
                {/* Animated 404 number with icon */}
                <div className="flex justify-center items-center mb-8">
                    <div className="relative">
                        <div className="text-8xl md:text-9xl font-black text-slate-900 flex items-center gap-2 md:gap-4">
                            <span
                                className="animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                            >
                                4
                            </span>
                            <div className="relative">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                    <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-white" />
                                </div>
                                <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-500 to-amber-500 rounded-full opacity-75 animate-ping" />
                            </div>
                            <span
                                className="animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                            >
                                4
                            </span>
                        </div>

                        {/* Floating sparkles */}
                        <Sparkles
                            className="absolute -top-4 -left-4 w-6 h-6 text-amber-400 animate-spin"
                            style={{ animationDuration: "3s" }}
                        />
                        <Sparkles
                            className="absolute -bottom-4 -right-4 w-6 h-6 text-red-400 animate-spin"
                            style={{
                                animationDuration: "4s",
                                animationDirection: "reverse",
                            }}
                        />
                    </div>
                </div>

                {/* Title with gradient text */}
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6 animate-pulse">
                    Trang không tồn tại
                </h1>

                {/* Description with fade in */}
                <div
                    className={`transition-all duration-700 delay-300 ${
                        isVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                    }`}
                >
                    <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed max-w-md mx-auto">
                        Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm
                        kiếm. Trang này có thể đã bị di chuyển hoặc không tồn
                        tại.
                    </p>
                </div>

                {/* Action buttons with stagger animation */}
                <div
                    className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-700 delay-500 ${
                        isVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                    }`}
                >
                    <Link
                        to="/"
                        className="group px-8 py-4 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-full font-semibold hover:from-red-700 hover:to-amber-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-base transform hover:-translate-y-1"
                    >
                        <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Về trang chủ
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="group px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 rounded-full font-semibold hover:bg-white transition-all duration-300 border-2 border-slate-200 hover:border-slate-300 hover:scale-105 shadow-lg hover:shadow-xl text-base flex items-center justify-center gap-3 transform hover:-translate-y-1"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Quay lại
                    </button>
                </div>

                {/* Tips section with slide up */}
                <div
                    className={`mb-8 transition-all duration-700 delay-700 ${
                        isVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                    }`}
                >
                    <div className="p-6 bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-sm rounded-2xl border border-amber-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 max-w-md mx-auto">
                        <p className="text-sm font-semibold text-amber-800 mb-4 flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            Mẹo hữu ích
                            <Sparkles className="w-4 h-4 text-amber-600" />
                        </p>
                        <ul className="text-sm text-amber-700 text-left space-y-3">
                            {[
                                "Kiểm tra lại đường dẫn URL",
                                "Sử dụng thanh tìm kiếm để tìm nội dung",
                                "Truy cập các tính năng chính từ trang chủ",
                            ].map((tip, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-3 animate-fade-in"
                                    style={{
                                        animationDelay: `${
                                            800 + index * 100
                                        }ms`,
                                    }}
                                >
                                    <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0" />
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Quick links with stagger animation */}
                <div
                    className={`transition-all duration-700 delay-900 ${
                        isVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                    }`}
                >
                    <p className="text-sm font-medium text-slate-500 mb-4">
                        Hoặc truy cập nhanh các tính năng:
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            { to: "/dancing", label: "Múa truyền thống" },
                            { to: "/face-swap", label: "Ghép mặt" },
                            {
                                to: "/lyrics-composition",
                                label: "Sáng tác nhạc",
                            },
                            { to: "/karaoke", label: "Karaoke" },
                        ].map((link, index) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="px-4 py-2 text-sm bg-white/80 backdrop-blur-sm text-slate-700 rounded-full hover:bg-white transition-all duration-300 border border-slate-200 hover:border-slate-300 hover:scale-105 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                style={{
                                    animationDelay: `${1000 + index * 100}ms`,
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Custom animations in Tailwind */}
            <style>{`
                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-20px) rotate(180deg);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default PageNotFound;
