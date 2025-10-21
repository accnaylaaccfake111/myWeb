import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { storage } from "../utils/storage";
import MusicXMLViewer from "../components/MusicXMLViewer";
import {
    fetchFaceSwapProjects,
    fetchSheetMusicProjects,
} from "../services/getDataApi";

const API_BASE_URL = process.env.REACT_APP_BE_API || "";

const MyProjects = ({ isLoggedIn }) => {
    const [activeTab, setActiveTab] = useState("FACE_SWAP");
    const [modalContent, setModalContent] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clothSwapProjects, setClothSwapProjects] = useState([]);
    const [loadingClothSwap, setLoadingClothSwap] = useState(false);
    const [sheetMusicProjects, setSheetMusicProjects] = useState([]);
    const [loadingSheetMusic, setLoadingSheetMusic] = useState(false);
    const [faceSwapProjects, setFaceSwapProjects] = useState([]);
    const [loadingFaceSwap, setLoadingFaceSwap] = useState(false);
    const [danceSimulationProjects, setDanceSimulationProjects] = useState([]);
    const [loadingDanceSimulation, setLoadingDanceSimulation] = useState(false);

    // States for delete functionality
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    // Map project types từ backend sang tên hiển thị
    const projectTypeMap = {
        FACE_SWAP: "Ghép Mặt Vui Nhộn",
        DANCE_SIMULATION: "Mô Phỏng Điệu Múa",
        SHEET_MUSIC: "Sáng Tác Bài Hát",
        CLOTH_SWAP: "Ghép Trang Phục",
    };

    const projectTypeColors = {
        FACE_SWAP: "bg-purple-100 text-purple-600",
        DANCE_SIMULATION: "bg-red-100 text-red-600",
        CLOTH_SWAP: "bg-emerald-100 text-emerald-600",
        SHEET_MUSIC: "bg-orange-100 text-orange-600",
    };

    const projectTypeIcons = {
        FACE_SWAP: "😊",
        DANCE_SIMULATION: "💃",
        CLOTH_SWAP: "👕",
        SHEET_MUSIC: "🎵",
    };

    const projectTypes = Object.keys(projectTypeMap);

    // Hàm chuyển đổi status sang tiếng Việt
    const getStatusText = (status) => {
        const statusMap = {
            DRAFT: "Bản nháp",
            PROCESSING: "Đang xử lý",
            COMPLETED: "Hoàn thành",
            FAILED: "Thất bại",
            SHEET_COMPLETED: "Hoàn thành",
        };
        return statusMap[status] || status;
    };

    // Hàm lấy màu cho status
    const getStatusColor = (status) => {
        const colorMap = {
            DRAFT: "bg-gray-100 text-gray-600",
            PROCESSING: "bg-blue-100 text-blue-600",
            COMPLETED: "bg-green-100 text-green-600",
            FAILED: "bg-red-100 text-red-600",
            SHEET_COMPLETED: "bg-green-100 text-green-600",
        };
        return colorMap[status] || "bg-gray-100 text-gray-600";
    };

    // Hàm format date
    const formatDate = (dateString) => {
        if (!dateString) return "Chưa có";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    // Hàm lấy tên hiển thị từ title
    const getDisplayName = (project) => {
        if (project.title && project.title.includes("Face Swap")) {
            return `Ghép mặt ${formatDate(
                project.createdAt || project.publishedAt,
            )}`;
        }
        return project.title || `Dự án ${projectTypeMap[project.projectType]}`;
    };

    // Hàm lấy tên hiển thị cho cloth swap project
    const getClothSwapDisplayName = (project) => {
        return `Ghép trang phục ${formatDate(project.createAt)}`;
    };

    // Hàm lấy tên hiển thị cho sheet music project
    const getSheetMusicDisplayName = (project) => {
        return project.title || `Bài hát ${formatDate(project.createdAt)}`;
    };

    // Hàm lấy tên hiển thị cho face swap project
    const getFaceSwapDisplayName = (project) => {
        return `Ghép mặt ${formatDate(project.createdAt)}`;
    };

    // Hàm lấy tên hiển thị cho dance simulation project
    const getDanceSimulationDisplayName = (project) => {
        return project.title || `Điệu múa ${formatDate(project.createAt)}`;
    };

    // Fetch cloth swap projects
    const fetchClothSwapProjects = async () => {
        try {
            setLoadingClothSwap(true);
            const token = storage.getAccessToken();

            const response = await fetch(`${API_BASE_URL}/api/outfit`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "ngrok-skip-browser-warning": true,
                },
            });

            const result = await response.json();
            console.log(result);

            if (!result.error) setClothSwapProjects(result.data);
        } catch (err) {
            console.error("Error fetching cloth swap projects:", err);
            setClothSwapProjects(null);
            setError(err.message);
        } finally {
            setLoadingClothSwap(false);
        }
    };

    // Fetch dance simulation projects
    const fetchDanceSimulationProjects = async () => {
        try {
            setLoadingDanceSimulation(true);
            const token = storage.getAccessToken();

            const response = await fetch(`${API_BASE_URL}/api/video-3d`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "ngrok-skip-browser-warning": true,
                },
            });

            const result = await response.json();
            console.log("Dance simulation projects:", result);

            if (result.success) {
                setDanceSimulationProjects(result.data);
            } else {
                throw new Error(
                    result.message || "Lỗi khi tải dự án mô phỏng điệu múa",
                );
            }
        } catch (err) {
            console.error("Error fetching dance simulation projects:", err);
            setDanceSimulationProjects([]);
            setError(err.message);
        } finally {
            setLoadingDanceSimulation(false);
        }
    };

    // Fetch chi tiết sheet music
    const fetchSheetMusicDetail = async (id) => {
        try {
            const token = storage.getAccessToken();
            const response = await fetch(`${API_BASE_URL}/api/sheets/${id}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "ngrok-skip-browser-warning": true,
                },
            });

            const result = await response.json();
            console.log(result);
            if (result.success) {
                return result.data;
            } else {
                throw new Error(
                    result.message || "Lỗi khi tải chi tiết bài hát",
                );
            }
        } catch (err) {
            console.error("Error fetching sheet music detail:", err);
            throw err;
        }
    };

    // Fetch chi tiết face swap
    const fetchFaceSwapDetail = async (id) => {
        try {
            const response = faceSwapProjects.find((x) => x.id === id);
            console.log(response);
            return response;
        } catch (err) {
            console.error("Error fetching face swap detail:", err);
            throw err;
        }
    };

    // Fetch chi tiết dance simulation
    const fetchDanceSimulationDetail = async (id) => {
        try {
            const token = storage.getAccessToken();
            const response = await fetch(`${API_BASE_URL}/api/video-3d/${id}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "ngrok-skip-browser-warning": true,
                },
            });

            const result = await response.json();
            console.log("Dance simulation detail:", result);
            if (result.success) {
                return result.data;
            } else {
                throw new Error(
                    result.message || "Lỗi khi tải chi tiết mô phỏng điệu múa",
                );
            }
        } catch (err) {
            console.error("Error fetching dance simulation detail:", err);
            throw err;
        }
    };

    // Hàm xử lý xóa dự án
    const handleDeleteProject = (project, projectType) => {
        setProjectToDelete({ ...project, projectType });
        setDeleteModalOpen(true);
    };

    // Hàm xác nhận xóa
    const confirmDelete = async () => {
        if (!projectToDelete) return;

        try {
            setDeleteLoading(true);
            setDeleteError(null);
            const token = storage.getAccessToken();

            let endpoint = "";
            let method = "DELETE";

            // Xác định endpoint dựa trên loại dự án
            switch (projectToDelete.projectType) {
                case "FACE_SWAP":
                    endpoint = `${API_BASE_URL}/api/face-swap/${projectToDelete.id}`;
                    break;
                case "CLOTH_SWAP":
                    endpoint = `${API_BASE_URL}/api/outfit/${projectToDelete.id}`;
                    break;
                case "SHEET_MUSIC":
                    endpoint = `${API_BASE_URL}/api/sheets/${projectToDelete.id}`;
                    break;
                case "DANCE_SIMULATION":
                    endpoint = `${API_BASE_URL}/api/video-3d/${projectToDelete.id}`;
                    break;
                default:
                    endpoint = `${API_BASE_URL}/api/projects/${projectToDelete.id}`;
            }

            const response = await fetch(endpoint, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "ngrok-skip-browser-warning": true,
                },
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Cập nhật lại danh sách dự án sau khi xóa
                if (projectToDelete.projectType === "FACE_SWAP") {
                    setFaceSwapProjects((prev) =>
                        prev.filter(
                            (project) => project.id !== projectToDelete.id,
                        ),
                    );
                } else if (projectToDelete.projectType === "CLOTH_SWAP") {
                    setClothSwapProjects((prev) =>
                        prev.filter(
                            (project) => project.id !== projectToDelete.id,
                        ),
                    );
                } else if (projectToDelete.projectType === "SHEET_MUSIC") {
                    setSheetMusicProjects((prev) =>
                        prev.filter(
                            (project) => project.id !== projectToDelete.id,
                        ),
                    );
                } else if (projectToDelete.projectType === "DANCE_SIMULATION") {
                    setDanceSimulationProjects((prev) =>
                        prev.filter(
                            (project) => project.id !== projectToDelete.id,
                        ),
                    );
                } else {
                    setProjects((prev) =>
                        prev.filter(
                            (project) => project.id !== projectToDelete.id,
                        ),
                    );
                }

                setDeleteModalOpen(false);
                setProjectToDelete(null);
            } else {
                throw new Error(result.message || "Lỗi khi xóa dự án");
            }
        } catch (err) {
            console.error("Error deleting project:", err);
            setDeleteError(err.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Hàm hủy xóa
    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setProjectToDelete(null);
        setDeleteError(null);
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(false);
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        console.log(activeTab);
        if (isLoggedIn) {
            if (activeTab === "CLOTH_SWAP") {
                fetchClothSwapProjects();
            } else if (activeTab === "SHEET_MUSIC") {
                fetchSheetMusicProjects(
                    setSheetMusicProjects,
                    setLoadingSheetMusic,
                    setError,
                );
            } else if (activeTab === "FACE_SWAP") {
                fetchFaceSwapProjects(
                    setFaceSwapProjects,
                    setLoadingFaceSwap,
                    setError,
                );
            } else if (activeTab === "DANCE_SIMULATION") {
                fetchDanceSimulationProjects();
            } else {
                fetchProjects();
            }
            setLoading(false);
        }
    }, [isLoggedIn, activeTab]);

    const handleView = async (
        project,
        isClothSwap = false,
        isSheetMusic = false,
        isFaceSwap = false,
        isDanceSimulation = false,
    ) => {
        if (isSheetMusic) {
            try {
                const detail = await fetchSheetMusicDetail(project.id);
                setModalContent({ ...detail, isSheetMusic: true });
            } catch (err) {
                setError("Lỗi khi tải chi tiết bài hát");
            }
        } else if (isFaceSwap) {
            try {
                const detail = await fetchFaceSwapDetail(project.id);
                setModalContent({ ...detail, isFaceSwap: true });
            } catch (err) {
                setError("Lỗi khi tải chi tiết ghép mặt");
            }
        } else if (isDanceSimulation) {
            try {
                const detail = await fetchDanceSimulationDetail(project.id);
                setModalContent({ ...detail, isDanceSimulation: true });
            } catch (err) {
                setError("Lỗi khi tải chi tiết mô phỏng điệu múa");
            }
        } else {
            setModalContent({ ...project, isClothSwap });
        }
    };

    const closeModal = () => {
        setModalContent(null);
    };

    // Render project card với giao diện được cải thiện
    const renderProjectCard = (project, options = {}) => {
        const {
            isClothSwap = false,
            isSheetMusic = false,
            isFaceSwap = false,
            isDanceSimulation = false,
            customDisplayName = null,
        } = options;

        const displayName =
            customDisplayName ||
            (isSheetMusic
                ? getSheetMusicDisplayName(project)
                : isClothSwap
                ? getClothSwapDisplayName(project)
                : isFaceSwap
                ? getFaceSwapDisplayName(project)
                : isDanceSimulation
                ? getDanceSimulationDisplayName(project)
                : getDisplayName(project));

        const projectType = isSheetMusic
            ? "SHEET_MUSIC"
            : isClothSwap
            ? "CLOTH_SWAP"
            : isFaceSwap
            ? "FACE_SWAP"
            : isDanceSimulation
            ? "DANCE_SIMULATION"
            : project.projectType;

        return (
            <div
                key={project.id}
                className="bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
            >
                <div className="flex items-center justify-between mb-3">
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${projectTypeColors[projectType]} font-bold text-lg group-hover:scale-110 transition-transform duration-200`}
                    >
                        {projectTypeIcons[projectType]}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div
                            className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                project.status,
                            )}`}
                        >
                            {getStatusText(project.status)}
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-2 min-h-[3rem]">
                    {displayName}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                    {projectTypeMap[projectType]}
                </p>

                {/* Additional info based on project type */}
                {isClothSwap && project.timeProcessing && (
                    <p className="text-xs text-gray-500 mb-2">
                        ⏱️ Thời gian xử lý:{" "}
                        {Math.round(project.timeProcessing / 1000)}s
                    </p>
                )}

                {isSheetMusic && (
                    <div className="text-xs text-gray-500 mb-2 space-y-1">
                        {project.theme && (
                            <div className="flex items-center">
                                🎨 Chủ đề: {project.theme}
                            </div>
                        )}
                        {project.mood && (
                            <div className="flex items-center">
                                😊 Tâm trạng: {project.mood}
                            </div>
                        )}
                        {project.duration && (
                            <div className="flex items-center">
                                ⏱️ Thời lượng: {project.duration}s
                            </div>
                        )}
                    </div>
                )}

                {isFaceSwap && (
                    <div className="text-xs text-gray-500 mb-2 space-y-1">
                        {project.aiModelVersion && (
                            <div className="flex items-center">
                                🤖 Model: {project.aiModelVersion}
                            </div>
                        )}
                        {(project.processingTimeMs ||
                            project.processingTime) && (
                            <div className="flex items-center">
                                ⏱️ Thời gian xử lý:{" "}
                                {Math.round(
                                    (project.processingTimeMs ||
                                        project.processingTime) / 1000,
                                )}
                                s
                            </div>
                        )}
                        {project.swapType && (
                            <div className="flex items-center">
                                🔄 Loại ghép: {project.swapType}
                            </div>
                        )}
                    </div>
                )}

                {isDanceSimulation && (
                    <div className="text-xs text-gray-500 mb-2 space-y-1">
                        {project.type && (
                            <div className="flex items-center">
                                🎯 Loại: {project.type}
                            </div>
                        )}
                        {project.videout1 && (
                            <div className="flex items-center">
                                🎥 Video: {project.videout1}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-500 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        {formatDate(project.createdAt || project.createAt)}
                    </span>
                    <div className="flex space-x-2">
                        <button
                            onClick={() =>
                                handleView(
                                    project,
                                    isClothSwap,
                                    isSheetMusic,
                                    isFaceSwap,
                                    isDanceSimulation,
                                )
                            }
                            className="text-blue-500 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                            title="Xem chi tiết"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={() =>
                                handleDeleteProject(project, projectType)
                            }
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            title="Xóa dự án"
                            disabled={deleteLoading}
                        >
                            {deleteLoading &&
                            projectToDelete?.id === project.id ? (
                                <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Render cloth swap modal content
    const renderClothSwapModalContent = (project) => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                    <strong>Loại dự án:</strong> Ghép Trang Phục
                </div>
                <div>
                    <strong>Trạng thái:</strong> {getStatusText(project.status)}
                </div>
                <div>
                    <strong>Model AI:</strong> {project.modelA1 || "Không có"}
                </div>
                <div>
                    <strong>Ngày tạo:</strong> {formatDate(project.createAt)}
                </div>
                <div>
                    <strong>Thời gian xử lý:</strong>{" "}
                    {Math.round(project.timeProcessing / 1000)} giây
                </div>
                <div>
                    <strong>Cập nhật lần cuối:</strong>{" "}
                    {formatDate(project.updateAt)}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                    <h4 className="font-semibold mb-2">Ảnh trang phục</h4>
                    {project.garmentImage ? (
                        <img
                            src={project.garmentImage}
                            alt="Trang phục"
                            className="w-full object-cover rounded-lg"
                        />
                    ) : (
                        <div className="w-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">Không có ảnh</span>
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <h4 className="font-semibold mb-2">Ảnh người mẫu</h4>
                    {project.modelImage ? (
                        <img
                            src={project.modelImage}
                            alt="Người mẫu"
                            className="w-full object-cover rounded-lg"
                        />
                    ) : (
                        <div className="w-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">Không có ảnh</span>
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <h4 className="font-semibold mb-2">Kết quả</h4>
                    {project.resultImage ? (
                        <img
                            src={project.resultImage}
                            alt="Kết quả"
                            className="w-full object-cover rounded-lg"
                        />
                    ) : (
                        <div className="w-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">
                                Không có kết quả
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Render sheet music modal content
    const renderSheetMusicModalContent = (project) => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                    <strong>Tiêu đề:</strong> {project.title}
                </div>
                <div>
                    <strong>Trạng thái:</strong> {getStatusText(project.status)}
                </div>
                <div>
                    <strong>Chủ đề:</strong> {project.theme || "Không có"}
                </div>
                <div>
                    <strong>Tâm trạng:</strong> {project.mood || "Không có"}
                </div>
                <div>
                    <strong>Thời lượng:</strong>{" "}
                    {project.duration || "Không có"} giây
                </div>
                <div>
                    <strong>Thời gian xử lý:</strong>{" "}
                    {project.processingTimelts
                        ? Math.round(project.processingTimelts / 1000) + "s"
                        : "Không có"}
                </div>
                <div>
                    <strong>Ngày tạo:</strong> {formatDate(project.createdAt)}
                </div>
                <div>
                    <strong>Hoàn thành:</strong>{" "}
                    {formatDate(project.completedAt)}
                </div>
            </div>

            {/* Hiển thị file audio nếu có */}
            {project.audioFile && (
                <div className="mt-4">
                    <h4 className="font-semibold mb-2">Audio</h4>
                    <audio controls className="w-full">
                        <source src={project.audioFile} type="audio/mpeg" />
                        Trình duyệt của bạn không hỗ trợ phát audio.
                    </audio>
                </div>
            )}

            {/* Hiển thị sheet music nếu có */}
            {project.sheetMusicXML && (
                <div className="mt-4">
                    <h4 className="font-semibold mb-2">Bản nhạc</h4>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <MusicXMLViewer src={project.sheetMusicXML} />
                    </div>
                </div>
            )}

            {/* Hiển thị lời bài hát nếu có */}
            {project.lyrics && (
                <div className="mt-4">
                    <h4 className="font-semibold mb-2">Lời bài hát</h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 whitespace-pre-wrap">
                        {project.lyrics}
                    </div>
                </div>
            )}

            {/* Hiển thị thông tin AI models */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                {project.musicModelAI && (
                    <div>
                        <strong>Music AI:</strong> {project.musicModelAI}
                    </div>
                )}
                {project.sheetModelAI && (
                    <div>
                        <strong>Sheet AI:</strong> {project.sheetModelAI}
                    </div>
                )}
                {project.lyricModelAI && (
                    <div>
                        <strong>Lyric AI:</strong> {project.lyricModelAI}
                    </div>
                )}
            </div>
        </div>
    );

    // Render face swap modal content
    const renderFaceSwapModalContent = (project) => (
        <div className="space-y-6">
            {/* Header với thông tin chính */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm sm:text-lg">
                                😊
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">
                                Ghép Mặt Vui Nhộn
                            </h3>
                            <div className="flex flex-wrap gap-1 mt-1">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                        project.status,
                                    )}`}
                                >
                                    {getStatusText(project.status)}
                                </span>
                                {project.aiModelVersion && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs truncate">
                                        🤖 {project.aiModelVersion}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-left sm:text-right">
                        <div className="text-sm text-gray-500">Ngày tạo</div>
                        <div className="font-semibold text-gray-700 text-sm">
                            {formatDate(project.createdAt)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Thông tin chi tiết dạng grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 text-sm">⏱️</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs text-gray-500">
                                Thời gian xử lý
                            </div>
                            <div className="font-semibold text-sm truncate">
                                {project.processingTimeMs
                                    ? Math.round(
                                          project.processingTimeMs / 1000,
                                      ) + "s"
                                    : project.processingTime
                                    ? Math.round(
                                          project.processingTime / 1000,
                                      ) + "s"
                                    : "Chưa xử lý"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-green-600 text-sm">🔄</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs text-gray-500">
                                Loại ghép
                            </div>
                            <div className="font-semibold text-sm truncate">
                                {project.swapType || "Không xác định"}
                            </div>
                        </div>
                    </div>
                </div>

                {project.completedAt && (
                    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-emerald-600 text-sm">
                                    ✅
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs text-gray-500">
                                    Hoàn thành
                                </div>
                                <div className="font-semibold text-sm truncate">
                                    {formatDate(project.completedAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {project.errorMessage && (
                    <div className="bg-white rounded-lg p-3 border border-red-100 shadow-sm sm:col-span-2 lg:col-span-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-red-600 text-sm">⚠️</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs text-gray-500">
                                    Lỗi xử lý
                                </div>
                                <div className="font-semibold text-sm text-red-600 truncate">
                                    {project.errorMessage}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Grid hiển thị media */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Khuôn mặt nguồn */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3">
                        <h4 className="font-semibold text-white text-sm flex items-center">
                            <span className="mr-2">👤</span>
                            Ảnh khuôn mặt nguồn
                            {project.facesUrl &&
                                project.facesUrl?.length > 0 && (
                                    <span className="ml-2 bg-purple-700 text-white text-xs px-2 py-1 rounded-full">
                                        {project.facesUrl?.length}
                                    </span>
                                )}
                        </h4>
                    </div>
                    <div className="p-3">
                        {project.facesUrl && project.facesUrl?.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                                {project.facesUrl?.map((faceUrl, index) => (
                                    <div
                                        key={index}
                                        className="relative group aspect-square"
                                    >
                                        <img
                                            src={faceUrl}
                                            alt={`Khuôn mặt nguồn ${index + 1}`}
                                            className="w-full h-full object-cover rounded-lg border border-gray-200 group-hover:scale-105 transition-transform duration-200"
                                        />
                                        <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                            #{index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                                <span className="text-gray-400 text-2xl mb-2">
                                    📷
                                </span>
                                <span className="text-gray-500 text-sm text-center px-2">
                                    Không có ảnh
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Video đích */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3">
                        <h4 className="font-semibold text-white text-sm flex items-center">
                            <span className="mr-2">🎬</span>
                            Video đích
                        </h4>
                    </div>
                    <div className="p-3">
                        {project.targetUrl ? (
                            <div className="relative rounded-lg overflow-hidden bg-black">
                                <div className="aspect-video w-full">
                                    <video
                                        src={project.targetUrl}
                                        className="w-full h-full object-contain"
                                        controls
                                        preload="metadata"
                                    />
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    Video gốc
                                </div>
                            </div>
                        ) : (
                            <div className="w-full aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                                <span className="text-gray-400 text-2xl mb-2">
                                    🎥
                                </span>
                                <span className="text-gray-500 text-sm text-center px-2">
                                    Không có video
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Kết quả */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-3">
                        <h4 className="font-semibold text-white text-sm flex items-center">
                            <span className="mr-2">✨</span>
                            Kết quả ghép mặt
                        </h4>
                    </div>
                    <div className="p-3">
                        {project.resultUrl ? (
                            <div className="relative rounded-lg overflow-hidden bg-black">
                                <div className="aspect-video w-full">
                                    <video
                                        src={project.resultUrl}
                                        className="w-full h-full object-contain"
                                        controls
                                        preload="metadata"
                                    />
                                </div>
                                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                    Kết quả
                                </div>
                            </div>
                        ) : project.status === "PROCESSING" ? (
                            <div className="w-full aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-blue-200">
                                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-blue-600 mb-2 sm:mb-3"></div>
                                <span className="text-blue-600 font-medium text-sm sm:text-base">
                                    Đang xử lý...
                                </span>
                                <span className="text-blue-500 text-xs mt-1 text-center px-2">
                                    Vui lòng chờ trong giây lát
                                </span>
                            </div>
                        ) : (
                            <div className="w-full aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                                <span className="text-gray-400 text-2xl mb-2">
                                    ⏳
                                </span>
                                <span className="text-gray-500 text-sm text-center px-2">
                                    Chưa có kết quả
                                </span>
                                {project.status === "FAILED" && (
                                    <span className="text-red-500 text-xs mt-1">
                                        Xử lý thất bại
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Thông tin bổ sung */}
            {project.additionalInfo && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-3">
                        <h4 className="font-semibold text-white text-sm flex items-center">
                            <span className="mr-2">📋</span>
                            Thông tin bổ sung
                        </h4>
                    </div>
                    <div className="p-3">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono">
                                {JSON.stringify(
                                    project.additionalInfo,
                                    null,
                                    2,
                                )}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Render dance simulation modal content
    const renderDanceSimulationModalContent = (project) => (
        <div className="space-y-6">
            {/* Header với thông tin chính */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm sm:text-lg">
                                💃
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">
                                {project.title || "Mô Phỏng Điệu Múa"}
                            </h3>
                            <div className="flex flex-wrap gap-1 mt-1">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                        project.status,
                                    )}`}
                                >
                                    {getStatusText(project.status)}
                                </span>
                                {project.type && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs truncate">
                                        🎯 {project.type}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-left sm:text-right">
                        <div className="text-sm text-gray-500">Ngày tạo</div>
                        <div className="font-semibold text-gray-700 text-sm">
                            {formatDate(project.createAt)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Thông tin chi tiết dạng grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-red-600 text-sm">🎯</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs text-gray-500">Loại</div>
                            <div className="font-semibold text-sm truncate">
                                {project.type || "Không xác định"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 text-sm">⏱️</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs text-gray-500">
                                Thời gian xử lý
                            </div>
                            <div className="font-semibold text-sm truncate">
                                {project.processingTime
                                    ? Math.round(
                                          project.processingTime / 1000,
                                      ) + "s"
                                    : "Chưa xử lý"}
                            </div>
                        </div>
                    </div>
                </div>

                {project.completedAt && (
                    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-emerald-600 text-sm">
                                    ✅
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs text-gray-500">
                                    Hoàn thành
                                </div>
                                <div className="font-semibold text-sm truncate">
                                    {formatDate(project.completedAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Grid hiển thị media */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Video đầu vào */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3">
                        <h4 className="font-semibold text-white text-sm flex items-center">
                            <span className="mr-2">🎬</span>
                            Video đầu vào
                        </h4>
                    </div>
                    <div className="p-3">
                        {project.videout1 ? (
                            <div className="relative rounded-lg overflow-hidden bg-black">
                                <div className="aspect-video w-full">
                                    <video
                                        src={project.videout1}
                                        className="w-full h-full object-contain"
                                        controls
                                        preload="metadata"
                                    />
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    Video đầu vào
                                </div>
                            </div>
                        ) : (
                            <div className="w-full aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                                <span className="text-gray-400 text-2xl mb-2">
                                    🎥
                                </span>
                                <span className="text-gray-500 text-sm text-center px-2">
                                    Không có video đầu vào
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Kết quả */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-3">
                        <h4 className="font-semibold text-white text-sm flex items-center">
                            <span className="mr-2">✨</span>
                            Kết quả mô phỏng
                        </h4>
                    </div>
                    <div className="p-3">
                        {project.videout2 ? (
                            <div className="relative rounded-lg overflow-hidden bg-black">
                                <div className="aspect-video w-full">
                                    <video
                                        src={project.videout2}
                                        className="w-full h-full object-contain"
                                        controls
                                        preload="metadata"
                                    />
                                </div>
                                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                    Kết quả
                                </div>
                            </div>
                        ) : project.status === "PROCESSING" ? (
                            <div className="w-full aspect-video bg-gradient-to-br from-red-50 to-orange-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-red-200">
                                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-red-600 mb-2 sm:mb-3"></div>
                                <span className="text-red-600 font-medium text-sm sm:text-base">
                                    Đang xử lý...
                                </span>
                                <span className="text-red-500 text-xs mt-1 text-center px-2">
                                    Vui lòng chờ trong giây lát
                                </span>
                            </div>
                        ) : (
                            <div className="w-full aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                                <span className="text-gray-400 text-2xl mb-2">
                                    ⏳
                                </span>
                                <span className="text-gray-500 text-sm text-center px-2">
                                    Chưa có kết quả
                                </span>
                                {project.status === "FAILED" && (
                                    <span className="text-red-500 text-xs mt-1">
                                        Xử lý thất bại
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Thông tin bổ sung */}
            {project.additionalInfo && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-3">
                        <h4 className="font-semibold text-white text-sm flex items-center">
                            <span className="mr-2">📋</span>
                            Thông tin bổ sung
                        </h4>
                    </div>
                    <div className="p-3">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono">
                                {JSON.stringify(
                                    project.additionalInfo,
                                    null,
                                    2,
                                )}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    if (!isLoggedIn) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12 fade-in">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <div className="text-5xl mb-4 text-red-400 animate-bounce">
                        📁
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-red-700 mb-4">
                        Vui lòng đăng nhập
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        Bạn cần đăng nhập để xem dự án của mình
                    </p>
                    <Link
                        to="/login"
                        state={{ from: "/my-projects" }}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    const filteredProjects = projects.filter(
        (project) => projectTypeMap[project.projectType] === activeTab,
    );

    const currentProjects =
        activeTab === "CLOTH_SWAP"
            ? clothSwapProjects
            : activeTab === "SHEET_MUSIC"
            ? sheetMusicProjects
            : activeTab === "FACE_SWAP"
            ? faceSwapProjects
            : activeTab === "DANCE_SIMULATION"
            ? danceSimulationProjects
            : filteredProjects;

    const currentLoading =
        activeTab === "CLOTH_SWAP"
            ? loadingClothSwap
            : activeTab === "SHEET_MUSIC"
            ? loadingSheetMusic
            : activeTab === "FACE_SWAP"
            ? loadingFaceSwap
            : activeTab === "DANCE_SIMULATION"
            ? loadingDanceSimulation
            : loading;

    if (currentLoading) {
        return (
            <div className="fade-in px-4 sm:px-6 lg:px-12 py-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            </div>
        );
    }

    if (
        error &&
        activeTab !== "CLOTH_SWAP" &&
        activeTab !== "SHEET_MUSIC" &&
        activeTab !== "FACE_SWAP" &&
        activeTab !== "DANCE_SIMULATION"
    ) {
        return (
            <div className="fade-in px-4 sm:px-6 lg:px-12 py-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <div className="text-5xl mb-4 text-red-400">❌</div>
                    <h2 className="text-2xl font-bold text-red-700 mb-2">
                        Lỗi khi tải dự án
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in px-4 sm:px-6 lg:px-12 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-red-700">
                        Dự án của tôi
                    </h1>
                    <p className="text-lg text-gray-600">
                        Xem và quản lý các dự án bạn đã tạo
                    </p>
                </div>
                <Link
                    to="/dancing-simulation"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold text-base"
                >
                    + Tạo dự án mới
                </Link>
            </div>

            {/* Tabs với giao diện được cải thiện */}
            <div className="mb-6">
                <nav className="flex justify-center space-x-2 overflow-x-auto bg-gray-100 p-1 rounded-xl">
                    {projectTypes?.map((type) => (
                        <button
                            key={type}
                            onClick={() => setActiveTab(type)}
                            className={`px-4 py-2 text-base font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex items-center ${
                                activeTab === type
                                    ? "bg-white text-red-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            <span className="mr-2">
                                {projectTypeIcons[type]}
                            </span>
                            {projectTypeMap[type]}
                        </button>
                    ))}
                </nav>
            </div>

            {currentProjects?.length === 0 ? (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
                    <div className="text-5xl mb-4 text-red-400 animate-bounce">
                        📁
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-red-700 mb-4">
                        Chưa có dự án {projectTypeMap[activeTab]}
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        Hãy bắt đầu tạo dự án {projectTypeMap[activeTab]} đầu
                        tiên
                    </p>
                    <Link
                        to={
                            activeTab === "DANCE_SIMULATION"
                                ? "/dancing-simulation"
                                : activeTab === "FACE_SWAP"
                                ? "/face-swap"
                                : activeTab === "SHEET_MUSIC"
                                ? "/sheet-music"
                                : activeTab === "CLOTH_SWAP"
                                ? "/cloth-swap"
                                : "/dancing-simulation"
                        }
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold"
                    >
                        Tạo dự án mới
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeTab === "CLOTH_SWAP"
                        ? clothSwapProjects?.map((project) =>
                              renderProjectCard(project, { isClothSwap: true }),
                          )
                        : activeTab === "SHEET_MUSIC"
                        ? sheetMusicProjects?.map((project) =>
                              renderProjectCard(project, {
                                  isSheetMusic: true,
                              }),
                          )
                        : activeTab === "FACE_SWAP"
                        ? faceSwapProjects?.map((project) =>
                              renderProjectCard(project, {
                                  isFaceSwap: true,
                              }),
                          )
                        : activeTab === "DANCE_SIMULATION"
                        ? danceSimulationProjects?.map((project) =>
                              renderProjectCard(project, {
                                  isDanceSimulation: true,
                              }),
                          )
                        : filteredProjects?.map((project) =>
                              renderProjectCard(project),
                          )}
                </div>
            )}

            {/* Modal for Viewing Content */}
            {modalContent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {modalContent.isSheetMusic
                                    ? getSheetMusicDisplayName(modalContent)
                                    : modalContent.isClothSwap
                                    ? getClothSwapDisplayName(modalContent)
                                    : modalContent.isFaceSwap
                                    ? getFaceSwapDisplayName(modalContent)
                                    : modalContent.isDanceSimulation
                                    ? getDanceSimulationDisplayName(
                                          modalContent,
                                      )
                                    : getDisplayName(modalContent)}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {modalContent.isSheetMusic ? (
                            renderSheetMusicModalContent(modalContent)
                        ) : modalContent.isClothSwap ? (
                            renderClothSwapModalContent(modalContent)
                        ) : modalContent.isFaceSwap ? (
                            renderFaceSwapModalContent(modalContent)
                        ) : modalContent.isDanceSimulation ? (
                            renderDanceSimulationModalContent(modalContent)
                        ) : (
                            <div>
                                {/* Existing modal content for other project types */}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-red-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Xác nhận xóa
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Bạn có chắc chắn muốn xóa dự án này? Hành động
                                này không thể hoàn tác.
                            </p>

                            {deleteError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-600 text-sm">
                                        {deleteError}
                                    </p>
                                </div>
                            )}

                            <div className="flex space-x-3 justify-center">
                                <button
                                    onClick={cancelDelete}
                                    disabled={deleteLoading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleteLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                                >
                                    {deleteLoading && (
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    )}
                                    Xóa dự án
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProjects;
