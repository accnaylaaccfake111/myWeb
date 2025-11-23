import React from "react";
import { Link } from "react-router-dom";
import {
    Star,
    Video,
    LogIn,
    ArrowRight,
    Zap,
    Users,
    Shield,
    Sparkles,
} from "lucide-react";
import scoreImage from "../assets/img/score.png";
import dance3DImage from "../assets/img/3ddance.png";

const DancingHandle = ({ isLoggedIn }) => {
    const tools = [
        {
            id: 1,
            title: "Chấm Điểm Điệu Múa",
            description:
                "So sánh video múa của bạn với video mẫu và nhận kết quả đánh giá chi tiết, chính xác",
            image: scoreImage,
            path: "/dancing-scoring",
            icon: Star,
            color: "from-red-500 to-orange-500",
            buttonText: "Bắt Đầu Chấm Điểm",
            features: [
                "Đánh giá tự động",
                "Phân tích chi tiết",
                "Gợi ý cải thiện",
            ],
        },
        {
            id: 2,
            title: "Mô Phỏng 3D",
            description:
                "Chuyển đổi video múa thành mô hình 3D để phân tích chuyển động chuyên sâu",
            image: dance3DImage,
            path: "/dancing-simulation",
            icon: Video,
            color: "from-blue-500 to-cyan-500",
            buttonText: "Bắt Đầu Mô Phỏng",
            features: [
                "Mô hình 3D chi tiết",
                "Phân tích góc độ",
                "Xem đa chiều",
            ],
        },
    ];

    const features = [
        {
            icon: Zap,
            title: "Công Nghệ AI",
            description: "Sử dụng trí tuệ nhân tạo tiên tiến nhất",
        },
        {
            icon: Users,
            title: "Thân Thiện",
            description: "Giao diện dễ sử dụng cho mọi người dùng",
        },
        {
            icon: Shield,
            title: "Bảo Mật",
            description: "Bảo vệ dữ liệu và quyền riêng tư",
        },
    ];

    return (
        <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Enhanced Header */}
                <div className="text-center mb-12 lg:mb-20">
                    <div className="flex justify-center items-center space-x-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center">
                            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-red-700" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 py-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent animate-pulse">
                            Công Cụ Hỗ Trợ Múa
                        </h1>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-100">
                        <Zap className="w-4 h-4" />
                        Công Nghệ AI Tiên Tiến
                    </div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Khám phá bộ công cụ AI mạnh mẽ giúp phân tích, đánh giá
                        và cải thiện kỹ năng múa một cách chuyên nghiệp và hiệu
                        quả
                    </p>
                </div>

                {/* Enhanced Tools Grid */}
                <div className="w-full mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        {tools.map((tool) => (
                            <div
                                key={tool.id}
                                className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200"
                            >
                                {/* Enhanced Image Section */}
                                <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                                    <img
                                        src={tool.image}
                                        alt={tool.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
                                    <div className="absolute bottom-4 left-6">
                                        <div
                                            className={`w-14 h-14 bg-gradient-to-r ${tool.color} rounded-2xl flex items-center justify-center shadow-lg`}
                                        >
                                            <tool.icon className="w-7 h-7 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Content Section */}
                                <div className="p-4 lg:p-6">
                                    <div className="mb-6">
                                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                                            {tool.title}
                                        </h2>
                                        <p className="text-gray-600 text-md leading-relaxed mb-4">
                                            {tool.description}
                                        </p>

                                        {/* Features List */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {tool.features.map(
                                                (feature, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                                                    >
                                                        {feature}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    {/* Enhanced Action Button */}
                                    {isLoggedIn ? (
                                        <Link
                                            to={tool.path}
                                            className={`group/btn flex items-center justify-center w-full bg-gradient-to-r ${tool.color} text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] text-lg shadow-md hover:shadow-xl`}
                                        >
                                            <span className="font-bold">
                                                {tool.buttonText}
                                            </span>
                                            <ArrowRight className="w-5 h-5 ml-3 group-hover/btn:translate-x-2 transition-transform duration-300" />
                                        </Link>
                                    ) : (
                                        <Link
                                            to="/login"
                                            state={{ from: tool.path }}
                                            className="group/btn flex items-center justify-center w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] text-lg shadow-md"
                                        >
                                            <LogIn className="w-5 h-5 mr-3" />
                                            <span>Đăng Nhập Để Sử Dụng</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 lg:mt-12">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]"
                        >
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DancingHandle;
