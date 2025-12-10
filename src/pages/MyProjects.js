"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
// Đảm bảo đường dẫn import đúng với project của bạn
import MusicXMLViewer from "../components/MusicXMLViewer";
import { projectService } from "../services/projectService";
import {
  Activity,
  CameraIcon,
  Check,
  Clock,
  File,
  Music,
  Smile,
  Eye,
  Trash2,
  Calendar,
  X,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  LogIn,
  Plus,
  Zap,
  Target,
  Film,
  Search,
  Grid,
  List,
  ChevronDown,
  Play,
  Pause,
  Shirt,
  Notebook,
  Sparkles,
  User,
  Palette
} from "lucide-react";
import SkeletonViewer from "../components/view3d/SkeletonViewer";

// --- CONSTANTS ---
const PROJECT_CONFIG = {
  FACE_SWAP: {
    name: "Ghép Mặt Vui Nhộn",
    description: "Tạo video ghép mặt độc đáo với AI",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200",
    icon: <Smile className="w-5 h-5" />,
    link: "/face-swap",
  },
  DANCE_SIMULATION: {
    name: "Mô Phỏng Điệu Múa",
    description: "Mô phỏng và đánh giá điệu múa",
    color: "from-red-500 to-orange-500",
    bgColor: "bg-gradient-to-br from-red-50 to-orange-50 border-red-200",
    icon: <Activity className="w-5 h-5" />,
    link: "/dancing-simulation",
  },
  SHEET_MUSIC: {
    name: "Sáng Tác Bài Hát",
    description: "Sáng tác nhạc và lời bài hát",
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200",
    icon: <Music className="w-5 h-5" />,
    link: "/lyrics-composition",
  },
  CLOTH_SWAP: {
    name: "Ghép Trang Phục",
    description: "Thử trang phục ảo với AI",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200",
    icon: <Shirt className="w-5 h-5" />,
    link: "/cloth-swap",
  },
};

const STATUS_CONFIG = {
  DRAFT: { text: "Bản nháp", color: "bg-gray-100 text-gray-600 border-gray-200", icon: <File className="w-3 h-3" /> },
  PROCESSING: { text: "Đang xử lý", color: "bg-blue-50 text-blue-600 border-blue-200", icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
  COMPLETED: { text: "Hoàn thành", color: "bg-green-50 text-green-600 border-green-200", icon: <Check className="w-3 h-3" /> },
  FAILED: { text: "Thất bại", color: "bg-red-50 text-red-600 border-red-200", icon: <AlertTriangle className="w-3 h-3" /> },
  SHEET_COMPLETED: { text: "Hoàn thành", color: "bg-green-50 text-green-600 border-green-200", icon: <Check className="w-3 h-3" /> },
};

const MyProjects = ({ isLoggedIn }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("FACE_SWAP");
  const [modalContent, setModalContent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");
  const [playingVideo, setPlayingVideo] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Projects state
  const [projects, setProjects] = useState({
    CLOTH_SWAP: { data: [], loading: false },
    SHEET_MUSIC: { data: [], loading: false },
    FACE_SWAP: { data: [], loading: false },
    DANCE_SIMULATION: { data: [], loading: false },
  });

  const [error, setError] = useState(null);

  // --- MEMOIZED VALUES ---
  const projectTypes = useMemo(() => Object.keys(PROJECT_CONFIG), []);
  const currentProjects = useMemo(() => projects[activeTab]?.data || [], [projects, activeTab]);
  const currentLoading = useMemo(() => projects[activeTab]?.loading || false, [projects, activeTab]);

  // --- UTILS ---
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }, []);

  const getDisplayName = useCallback((project, type) => {
    if (project.title) return project.title;
    const date = project.createdAt || project.createAt || project.publishedAt;
    return `${PROJECT_CONFIG[type].name} ${formatDate(date)}`;
  }, [formatDate]);

  const getStatusConfig = useCallback((status) => STATUS_CONFIG[status] || { text: status, color: "bg-gray-100 text-gray-600", icon: <File className="w-3 h-3" /> }, []);

  // --- API CALLS ---
  const fetchProjects = useCallback(async (type) => {
    try {
      setProjects((prev) => ({ ...prev, [type]: { ...prev[type], loading: true } }));
      let data;
      switch (type) {
        case "CLOTH_SWAP": data = await projectService.fetchClothSwapProjects(); break;
        case "SHEET_MUSIC": data = await projectService.fetchSheetMusicProjects(); break;
        case "FACE_SWAP": data = await projectService.fetchFaceSwapProjects(); break;
        case "DANCE_SIMULATION": data = await projectService.fetchDanceSimulationProjects(); break;
        default: data = [];
      }
      setProjects((prev) => ({ ...prev, [type]: { data, loading: false } }));
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setError(err.message);
      setProjects((prev) => ({ ...prev, [type]: { data: [], loading: false } }));
    }
  }, []);

  const fetchProjectDetail = useCallback(async (project, type) => {
    try {
      let detail;
      switch (type) {
        case "SHEET_MUSIC":
          // Sửa: Lấy đúng data trả về
          detail = await projectService.fetchSheetMusicDetail(project.id);
          return { ...detail, isSheetMusic: true };
        case "FACE_SWAP":
          // Sửa: Tìm trong mảng hiện tại thay vì gọi API mới nếu có thể
          detail = projects.FACE_SWAP.data.find((x) => x.id === project.id);
          return { ...detail, isFaceSwap: true };
        case "DANCE_SIMULATION":
          detail = await projectService.fetchDanceSimulationDetail(project.id);
          return { ...detail, isDanceSimulation: true };
        case "CLOTH_SWAP":
        default:
          return { ...project, isClothSwap: true };
      }
    } catch (err) {
      console.error(`Error fetching detail:`, err);
      throw err;
    }
  }, [projects.FACE_SWAP.data]);

  // --- EVENT HANDLERS ---
  const handleDeleteProject = useCallback((project, projectType) => {
    setProjectToDelete({ ...project, projectType });
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!projectToDelete) return;
    try {
      setDeleteLoading(true);
      await projectService.deleteProject(projectToDelete.id, projectToDelete.projectType);

      setProjects((prev) => ({
        ...prev,
        [projectToDelete.projectType]: {
          ...prev[projectToDelete.projectType],
          data: prev[projectToDelete.projectType].data.filter((p) => p.id !== projectToDelete.id),
        },
      }));
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }, [projectToDelete]);

  const handleView = useCallback(async (project) => {
    setPlayingVideo(null);
    try {
      const detail = await fetchProjectDetail(project, activeTab);
      setModalContent(detail);
    } catch (err) {
      setError(`Lỗi khi tải chi tiết`);
    }
  }, [activeTab, fetchProjectDetail]);

  const closeModal = () => { setModalContent(null); setPlayingVideo(null); };
  const cancelDelete = () => { setDeleteModalOpen(false); setProjectToDelete(null); setDeleteError(null); };

  // --- RENDER HELPERS ---
  const renderProjectPreview = useCallback((project, projectType) => {
    const handleVideoPlay = (projectId) => setPlayingVideo(projectId === playingVideo ? null : projectId);

    // Fix: Dùng đúng tên biến để hiển thị preview
    switch (projectType) {
      case "FACE_SWAP":
        return project.resultUrl ? (
          <div className="relative w-full h-full">
            <video src={project.resultUrl} className="w-full h-full object-cover" muted loop autoPlay={playingVideo === project.id} />
            <button onClick={() => handleVideoPlay(project.id)} className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
              {playingVideo === project.id ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
            </button>
          </div>
        ) : <div className="w-full h-full flex items-center justify-center bg-gray-100"><CameraIcon className="w-8 h-8 text-gray-400" /></div>;

      case "CLOTH_SWAP":
        return project.resultImage ? (
          <img src={project.resultImage} alt="Kết quả" className="w-full h-full object-cover" />
        ) : <div className="w-full h-full flex items-center justify-center bg-emerald-50"><Shirt className="w-8 h-8 text-emerald-500" /></div>;

      case "DANCE_SIMULATION":
        return <div className="w-full h-full flex items-center justify-center bg-red-50"><Activity className="w-8 h-8 text-red-400" /></div>;

      case "SHEET_MUSIC":
        return <div className="w-full h-full flex items-center justify-center bg-amber-50"><Music className="w-8 h-8 text-amber-500" /></div>;

      default: return null;
    }
  }, [playingVideo]);

  // --- FILTER & SORT ---
  const filteredProjects = useMemo(() => {
    let filtered = currentProjects;
    if (searchQuery) filtered = filtered.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterStatus !== "all") filtered = filtered.filter(p => p.status === filterStatus);
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.createAt);
      const dateB = new Date(b.createdAt || b.createAt);
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [currentProjects, searchQuery, filterStatus, sortBy]);

  // --- EFFECTS ---
  useEffect(() => {
    if (isLoggedIn) fetchProjects(activeTab);
  }, [isLoggedIn, activeTab, fetchProjects]);

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="py-3 text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">Dự Án Của Tôi</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Quản lý và theo dõi tất cả dự án sáng tạo của bạn</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2">
          {projectTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex justify-center items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === type ? `bg-gradient-to-r ${PROJECT_CONFIG[type].color} text-white shadow-lg` : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}
            >
              {PROJECT_CONFIG[type].icon}
              <span className="hidden md:inline">{PROJECT_CONFIG[type].name}</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* (Giữ nguyên phần search/filter như code cũ của bạn cho gọn) */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Tìm kiếm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border rounded-lg px-4 py-2 bg-gray-50">
            <option value="all">Tất cả trạng thái</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="PROCESSING">Đang xử lý</option>
          </select>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded ${viewMode === "grid" ? "bg-white text-red-600 shadow" : "text-gray-500"}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded ${viewMode === "list" ? "bg-white text-red-600 shadow" : "text-gray-500"}`}><List className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Content */}
        {!isLoggedIn ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
            <Link to="/login" className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg">Đăng nhập ngay</Link>
          </div>
        ) : currentLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <div key={i} className="bg-gray-200 h-80 rounded-2xl animate-pulse"></div>)}</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-500">Chưa có dự án nào</h3>
            <Link to={PROJECT_CONFIG[activeTab].link} className="mt-4 inline-flex items-center text-red-600 font-medium hover:underline"><Plus className="w-4 h-4 mr-1" /> Tạo dự án mới</Link>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredProjects.map((project) => (
              <div key={project.id} className={`bg-white rounded-2xl p-5 border-2 hover:border-red-200 transition-all duration-300 hover:shadow-xl ${viewMode === "list" ? "flex items-center gap-4" : ""}`}>
                {/* Card Content Render Logic Here - Simplified for brevity since core logic is above */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${PROJECT_CONFIG[activeTab].color} text-white`}>{PROJECT_CONFIG[activeTab].icon}</div>
                    <div className={`text-xs px-2 py-1 rounded-full border ${getStatusConfig(project.status).color}`}>{getStatusConfig(project.status).text}</div>
                  </div>
                  <h3 className="font-bold text-gray-800 line-clamp-2 mb-2">{getDisplayName(project, activeTab)}</h3>
                  {viewMode === "grid" && <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden mb-3 border">{renderProjectPreview(project, activeTab)}</div>}
                  <div className="text-xs text-gray-500 flex gap-2"><Calendar className="w-3 h-3" /> {formatDate(project.createdAt || project.createAt)}</div>
                </div>
                <div className={viewMode === "list" ? "flex gap-2" : "flex justify-between mt-4 pt-3 border-t"}>
                  <button onClick={() => handleView(project)} className="text-blue-600 text-sm font-medium flex items-center gap-1"><Eye className="w-4 h-4" /> Xem</button>
                  <button onClick={() => handleDeleteProject(project, activeTab)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- MODAL CHI TIẾT (QUAN TRỌNG: ĐÃ SỬA TÊN BIẾN) --- */}
        {modalContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">{getDisplayName(modalContent, activeTab)}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full"><X className="h-6 w-6 text-gray-500" /></button>
              </div>

              <div className="space-y-6">
                {/* 1. FACE SWAP MODAL */}
                {modalContent.isFaceSwap && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Video Kết Quả</h4>
                      {modalContent.resultUrl ? (
                        <video src={modalContent.resultUrl} controls className="w-full rounded-lg shadow-sm" />
                      ) : <div className="h-48 bg-gray-100 rounded flex items-center justify-center">Chưa có kết quả</div>}
                    </div>
                    <div className="space-y-4">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-purple-800">Trạng thái: <strong>{getStatusConfig(modalContent.status).text}</strong></div>
                        <div className="text-sm text-purple-800 mt-1">Thời gian xử lý: <strong>{Math.round((modalContent.processingTimeMs || 0) / 1000)}s</strong></div>
                        <div className="text-sm text-purple-800 mt-1">Model: <strong>{modalContent.aiModelVersion}</strong></div>
                      </div>
                      {modalContent.targetUrl && (
                        <div><h4 className="text-sm font-medium mb-1">Video Gốc:</h4><video src={modalContent.targetUrl} className="w-full h-32 object-cover rounded" controls /></div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. SHEET MUSIC MODAL - Sửa lỗi biến 'content' thành 'sheetMusicXML' */}
                {modalContent.isSheetMusic && (
                  <div>
                    <div className="bg-amber-50 p-4 rounded-lg mb-4 flex gap-4 text-sm">
                      <div>Chủ đề: <strong>{modalContent.theme}</strong></div>
                      <div>Tâm trạng: <strong>{modalContent.mood}</strong></div>
                      <div>Thời lượng: <strong>{modalContent.duration}s</strong></div>
                    </div>
                    {/* QUAN TRỌNG: File cũ dùng 'content', file đúng dùng 'sheetMusicXML' */}
                    {modalContent.sheetMusicXML ? (
                      <div className="border rounded-lg p-4 bg-white shadow-inner">
                        <MusicXMLViewer src={modalContent.sheetMusicXML} />
                      </div>
                    ) : <div className="text-center py-8 text-gray-500">Không có dữ liệu bản nhạc</div>}

                    {modalContent.lyrics && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-bold mb-2">Lời bài hát:</h4>
                        <p className="whitespace-pre-wrap text-gray-700">{modalContent.lyrics}</p>
                      </div>
                    )}
                    {modalContent.audioFile && <audio controls src={modalContent.audioFile} className="w-full mt-4" />}
                  </div>
                )}

                {/* 3. DANCE SIMULATION MODAL - Sửa lỗi biến 'skeletonData' thành 'json' */}
                {modalContent.isDanceSimulation && (
                  <div>
                    <div className="bg-red-50 p-4 rounded-lg mb-4 grid grid-cols-2 gap-4 text-sm">
                      <div>Loại: <strong>{modalContent.type}</strong></div>
                      <div>Điểm số: <strong>{modalContent.json?.average_similarity_score ? Math.round(modalContent.json.average_similarity_score * 100) : 0}%</strong></div>
                    </div>
                    <div className="h-[400px] w-full bg-gray-900 rounded-xl overflow-hidden relative">
                      {/* QUAN TRỌNG: File cũ dùng 'skeletonData', file đúng dùng 'json' */}
                      {modalContent.type === "PROCESS_VIDEO_STREAM" && modalContent.json ? (
                        <SkeletonViewer source="/models/Kachujin G Rosales.glb" JsonPose={modalContent.json} />
                      ) : modalContent.resultUrl ? (
                        <video src={modalContent.resultUrl} controls className="w-full h-full object-contain" />
                      ) : <div className="flex items-center justify-center h-full text-white">Chưa có dữ liệu mô phỏng</div>}
                    </div>
                  </div>
                )}

                {/* 4. CLOTH SWAP MODAL */}
                {modalContent.isClothSwap && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-center">Trang phục</h4>
                      <img src={modalContent.garmentImage} alt="" className="w-full rounded-lg border aspect-[3/4] object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-center">Người mẫu</h4>
                      <img src={modalContent.modelImage} alt="" className="w-full rounded-lg border aspect-[3/4] object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-center text-emerald-600">Kết quả</h4>
                      <img src={modalContent.resultImage} alt="" className="w-full rounded-lg border-2 border-emerald-500 aspect-[3/4] object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal (Giữ nguyên logic cũ) */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl max-w-sm w-full text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="text-red-600" /></div>
              <h3 className="font-bold text-lg mb-2">Xác nhận xóa?</h3>
              <p className="text-gray-500 mb-6">Hành động này không thể hoàn tác.</p>
              {deleteError && <p className="text-red-500 text-sm mb-4">{deleteError}</p>}
              <div className="flex gap-3 justify-center">
                <button onClick={cancelDelete} className="px-4 py-2 bg-gray-100 rounded-lg font-medium">Hủy</button>
                <button onClick={confirmDelete} disabled={deleteLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium flex items-center">{deleteLoading && <RefreshCw className="w-4 h-4 animate-spin mr-2" />} Xóa</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjects;