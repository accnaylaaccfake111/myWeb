import React from "react";
import { Link } from "react-router-dom";
import { Star, Video, LogIn, ArrowRight } from "lucide-react";
import scoreImage from "../assets/img/score.png";
import dance3DImage from "../assets/img/3ddance.png";

const DancingHandle = ({ isLoggedIn }) => {
    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-12">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-4xl sm:text-5xl font-bold text-red-700 mb-4 animate-pulse">
                    Công Cụ Hỗ Trợ Múa
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Khám phá các công cụ hỗ trợ học tập và thực hành điệu múa
                    với công nghệ AI tiên tiến
                </p>
            </div>

            {/* Cards Grid */}
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Chấm điểm điệu múa Card */}
                    <div className="bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
                        <div className="h-64 bg-gradient-to-r from-red-500 to-red-600 relative overflow-hidden">
                            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                            <img
                                src={scoreImage}
                                alt="Chấm điểm điệu múa"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-red-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    AI Scoring
                                </span>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                                    <Star className="w-6 h-6 text-red-700" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Chấm Điểm Điệu Múa
                                </h2>
                            </div>

                            {isLoggedIn ? (
                                <Link
                                    to="/dancing-scoring"
                                    className="flex items-center justify-center w-full bg-red-600 text-white text-center py-4 px-6 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    Bắt Đầu Chấm Điểm
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    state={{ from: "/dancing-scoring" }}
                                    className="flex items-center justify-center w-full bg-gray-400 text-white text-center py-4 px-6 rounded-xl font-semibold hover:bg-gray-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Đăng Nhập Để Sử Dụng
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mô phỏng điệu múa Card */}
                    <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
                        <div className="h-64 bg-gradient-to-r from-blue-500 to-blue-600 relative overflow-hidden">
                            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                            <img
                                src={dance3DImage}
                                alt="Mô phỏng điệu múa 3D"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    3D Simulation
                                </span>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                    <Video className="w-6 h-6 text-blue-700" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Mô Phỏng 3D
                                </h2>
                            </div>

                            {isLoggedIn ? (
                                <Link
                                    to="/dancing-simulation"
                                    className="flex items-center justify-center w-full bg-blue-600 text-white text-center py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    Bắt Đầu Mô Phỏng
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    state={{ from: "/dancing-simulation" }}
                                    className="flex items-center justify-center w-full bg-gray-400 text-white text-center py-4 px-6 rounded-xl font-semibold hover:bg-gray-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Đăng Nhập Để Sử Dụng
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                .animate-pulse {
                    animation: pulse 2s infinite;
                }

                .shadow-3xl {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
            `}</style>
        </div>
    );
};

export default DancingHandle;
