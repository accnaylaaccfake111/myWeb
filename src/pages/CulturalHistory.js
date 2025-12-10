// frontend/src/pages/CulturalHistory.js
import React, { useState, useEffect, useRef } from "react";
import { Search, X, Play, Pause, ChevronDown, ChevronUp, FileText } from "lucide-react";
import culturalForms from "../data/culturalData"; // Đảm bảo data đã được cập nhật videoUrl như bước trước
// Import Audio files (Giữ lại cho các phần Lịch sử/Nghi lễ)
import choiXuanAudio from "../assets/audio/choixuan.mp3";
import giaTuAudio from "../assets/audio/giatu.mp3";
import vinhLongNganXuanAudio from "../assets/audio/VinhLongNganXuan.mp3";
import lyDauCauDaiAudio from "../assets/audio/lydaucaudai.mp3";
import ruocXuan from "../assets/audio/ruocxuan.mp3";
import coiNam from "../assets/audio/coinam.mp3";
import danBuaCuaDong from "../assets/audio/danbuacuadong.mp3";
import danBuaCuaGiua from "../assets/audio/danbuacuagiua.mp3";
import khaiMon from "../assets/audio/khaimon.mp3";
import lyDauCauVan from "../assets/audio/lydaucauvan.mp3";
import lyMuoiHaiThang from "../assets/audio/lymuoihaithang.mp3";
import moCuaRao from "../assets/audio/mocuarao.mp3";
import moNgo from "../assets/audio/mongo.mp3";
import tienSu from "../assets/audio/tiensu.mp3";
import veCacLoaiDua from "../assets/audio/vecacloaidua.mp3";
import xocQuach from "../assets/audio/xocquach.mp3";
import choiXuan from "../assets/audio/choixuan.mp3";
import chucNgheLamRuong from "../assets/audio/chucnghelamruong.mp3";
import lyLoTho from "../assets/audio/lylotho.mp3";

// Import doc
import lichSu from "../assets/document/lichsu.pdf";

const CulturalHistory = () => {
    const [filter, setFilter] = useState("Tất cả");
    const [expandedCard, setExpandedCard] = useState(null);
    const [visibleCards, setVisibleCards] = useState([]);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [scrollPositionBeforeExpand, setScrollPositionBeforeExpand] = useState(null);
    const [activeFilter, setActiveFilter] = useState("Tất cả");
    const [isIntroExpanded, setIsIntroExpanded] = useState(false);
    
    const introText = `Sắc bùa Phú Lễ là một loại hình diễn xướng dân gian độc đáo, mang đậm dấu ấn văn hóa của cư dân nông nghiệp lúa nước tại Bến Tre. Không chỉ đơn thuần là các bài hát chúc tụng đầu xuân, Sắc bùa còn chứa đựng những giá trị tâm linh sâu sắc, cầu mong mưa thuận gió hòa, mùa màng bội thu và bình an cho gia chủ.
    Trải qua hàng trăm năm hình thành và phát triển, từ những bài hát truyền thống mộc mạc đến những sáng tác mới mang hơi thở thời đại, Sắc bùa Phú Lễ vẫn giữ nguyên được hồn cốt dân tộc, trở thành di sản văn hóa phi vật thể quý báu cần được gìn giữ và phát huy. Hãy cùng khám phá hành trình lịch sử đầy thú vị này qua các mốc thời gian và tư liệu dưới đây.`;
    
    const [searchTerm, setSearchTerm] = useState("");
    const [typingText, setTypingText] = useState("");
    const [enlargedImage, setEnlargedImage] = useState(null);

    // Audio states (cho phần Lịch sử)
    const [currentAudio, setCurrentAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlayingCard, setCurrentPlayingCard] = useState(null);
    
    // Modal states
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState(null);

    const cardRefs = useRef({});
    const timelineRef = useRef(null);
    const audioRef = useRef(null);
    const videoRef = useRef(null);

    const filterOptions = [
        "Tất cả",
        "Nghi lễ",
        "Giúp vui",
        "Từ giã",
        "Sáng tác mới",
        "Hát Sắc Bùa",
        "Truyền thừa",
    ];

    // Audio mapping
    const audioMap = {
        "Bài Giã từ": giaTuAudio,
        "Chơi xuân": choiXuanAudio,
        "Vĩnh Long Ngàn Xuân": vinhLongNganXuanAudio,
        "Lý Đầu cầu dài": lyDauCauDaiAudio,
        "Rước xuân": ruocXuan,
        "Cõi Nam": coiNam,
        "Dán bùa cửa Đông": danBuaCuaDong,
        "Dán bùa cửa giữa": danBuaCuaGiua,
        "Khai môn": khaiMon,
        "Lý Đầu cầu vắn": lyDauCauVan,
        "Lý Mười hai tháng": lyMuoiHaiThang,
        "Mở cửa rào": moCuaRao,
        "Mở ngõ": moNgo,
        "Tiên sư": tienSu,
        "Xốc quách": xocQuach,
        "Vè các loại Dừa": veCacLoaiDua,
        "Chơi xuân": choiXuan,
        "Chúc nghề làm ruộng": chucNgheLamRuong,
        "Lý Lơ thơ": lyLoTho,
    };

    const hatSacBuaForms = culturalForms.filter((form) => form.type === "Hát Sắc Bùa");
    const otherForms = culturalForms.filter((form) => form.type !== "Hát Sắc Bùa");

    // Audio Logic
    const playAudio = (title, cardId) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        const audioFile = audioMap[title];
        if (audioFile) {
            const audio = new Audio(audioFile);
            audioRef.current = audio;
            setCurrentAudio(audio);
            setIsPlaying(true);
            setCurrentPlayingCard(cardId);
            audio.play().catch((error) => {
                console.error("Lỗi phát nhạc:", error);
                setIsPlaying(false);
                setCurrentPlayingCard(null);
            });
            audio.onended = () => {
                setIsPlaying(false);
                setCurrentPlayingCard(null);
                audioRef.current = null;
            };
        }
    };

    const pauseAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Typing Effect
    useEffect(() => {
        const fullText = "Tìm kiếm theo tên bài hát, số trang hoặc tác giả...";
        let typingInterval;
        let timeout;
        const startTyping = () => {
            let currentIndex = 0;
            setTypingText("");
            typingInterval = setInterval(() => {
                if (currentIndex < fullText.length) {
                    setTypingText(fullText.slice(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    clearInterval(typingInterval);
                    timeout = setTimeout(() => {
                        startTyping();
                    }, 2000);
                }
            }, 60);
        };
        startTyping();
        return () => {
            clearInterval(typingInterval);
            clearTimeout(timeout);
        };
    }, []);

    // Body overflow handling
    useEffect(() => {
        if (enlargedImage || videoModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [enlargedImage, videoModalOpen]);

    // Helpers
    const handleImageEnlarge = (imageSrc, event) => {
        event.stopPropagation();
        setEnlargedImage(imageSrc);
    };

    const closeEnlargedImage = () => setEnlargedImage(null);
    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) closeEnlargedImage();
    };

    const openVideoModal = (videoUrl, event) => {
        event.stopPropagation();
        setCurrentVideoUrl(videoUrl);
        setVideoModalOpen(true);
    };

    const closeVideoModal = () => {
        setVideoModalOpen(false);
        setCurrentVideoUrl(null);
        if (videoRef.current) videoRef.current.pause();
    };

    const handleVideoOverlayClick = (event) => {
        if (event.target === event.currentTarget) closeVideoModal();
    };

    const advancedSearch = (forms, searchTerm) => {
        if (!searchTerm.trim()) return forms;
        const searchLower = searchTerm.toLowerCase().trim();
        return forms.filter((form) => {
            const titleMatch = form.title.toLowerCase().includes(searchLower);
            const authorMatch = form.author && form.author.toLowerCase().includes(searchLower);
            const descriptionMatch = form.description && form.description.toLowerCase().includes(searchLower);
            return titleMatch || authorMatch || descriptionMatch;
        });
    };

    const filteredHatSacBua = advancedSearch(hatSacBuaForms, searchTerm);

    const groupedForms = otherForms.reduce((acc, form) => {
        const year = form.year;
        if (!acc[year]) acc[year] = [];
        acc[year].push(form);
        return acc;
    }, {});

    const sortedYears = Object.keys(groupedForms).sort((a, b) => {
        if (a === "Truyền thống") return -1;
        if (b === "Truyền thống") return 1;
        return a - b;
    });

    const filteredGroupedForms = sortedYears
        .map((year) => ({
            year,
            forms: filter === "Tất cả"
                ? groupedForms[year]
                : groupedForms[year].filter((form) => form.type === filter),
        }))
        .filter((group) => group.forms.length > 0);

    // Animation Effect
    useEffect(() => {
        setExpandedCard(null);
        setVisibleCards([]);
        setActiveFilter(filter);

        if (filter === "Hát Sắc Bùa") {
            let delay = 0;
            filteredHatSacBua.forEach((_, index) => {
                setTimeout(() => {
                    setVisibleCards((prev) => [...prev, `hatsacbua-${index}`]);
                }, delay + index * 100);
            });
        } else {
            let delay = 0;
            filteredGroupedForms.forEach((group, groupIndex) => {
                delay += 200;
                group.forms.forEach((_, formIndex) => {
                    setTimeout(() => {
                        setVisibleCards((prev) => [...prev, `${groupIndex}-${formIndex}`]);
                    }, delay + formIndex * 100);
                });
            });
        }
    }, [filter, searchTerm]);

    const toggleCard = (id, event) => {
        if (window.getSelection().toString().length > 0) return;

        if (expandedCard === id) {
            const cardElement = cardRefs.current[id];
            if (cardElement) {
                cardElement.style.transform = "scale(1)";
                cardElement.style.zIndex = "1";
            }
            setExpandedCard(null);
            if (scrollPositionBeforeExpand !== null) {
                window.scrollTo({
                    top: scrollPositionBeforeExpand,
                    behavior: "smooth",
                });
                setScrollPositionBeforeExpand(null);
            }
        } else {
            setScrollPositionBeforeExpand(window.scrollY);
            setExpandedCard(id);
            setTimeout(() => {
                const cardElement = cardRefs.current[id];
                if (cardElement) {
                    cardElement.style.transform = "scale(1.02)";
                    cardElement.style.zIndex = "10";
                    if (filter === "Hát Sắc Bùa") {
                        const rect = cardElement.getBoundingClientRect();
                        const scrollOffset = 120;
                        window.scrollTo({
                            top: window.scrollY + rect.top - scrollOffset,
                            behavior: "smooth",
                        });
                    }
                }
            }, 150);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 200) setShowScrollTop(true);
            else setShowScrollTop(false);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    let globalFormIndex = 0;

    return (
        <div className="min-h-screen w-full px-4 py-8 bg-gradient-to-b from-gray-50 to-red-50">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4 header-title">
                        Lịch sử văn hóa Sắc Bùa Phú Lễ
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg header-subtitle">
                        Khám phá nguồn gốc, ý nghĩa và sự phát triển của Sắc Bùa Phú Lễ qua dòng thời gian.
                    </p>
                </div>

                {/* Intro Card */}
                <div className="max-w-4xl mx-auto mb-10">
                    <div className="bg-white rounded-xl shadow-md border-t-4 border-red-500 overflow-hidden transition-all duration-300 hover:shadow-lg relative">
                        <div className="p-6 md:p-8">
                            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                                <span className="mr-2">📜</span> Nguồn gốc, lịch sử của hát Sắc Bùa Phú Lễ
                            </h3>
                            <div className={`text-gray-700 leading-relaxed text-lg text-justify transition-all duration-700 ease-in-out overflow-hidden relative ${isIntroExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-24 opacity-80'}`}>
                                {introText.split('\n').map((paragraph, idx) => (
                                    <p key={idx} className="mb-4">{paragraph}</p>
                                ))}
                                {!isIntroExpanded && (
                                    <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                                )}
                            </div>
                            <div className="mt-6 flex flex-wrap justify-center gap-4">
                                <button onClick={() => setIsIntroExpanded(!isIntroExpanded)} className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors duration-300 group shadow-sm border border-red-100">
                                    {isIntroExpanded ? <>Thu gọn <ChevronUp size={18} /></> : <>Xem tóm tắt <ChevronDown size={18} /></>}
                                </button>
                                {isIntroExpanded && (
                                    <a href={lichSu} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-300 shadow-md">
                                        <FileText size={18} /> Tìm hiểu thêm
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="mb-8 flex justify-center flex-wrap gap-3">
                    {filterOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => {
                                setFilter(option);
                                setSearchTerm("");
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-500 shadow-md hover:shadow-lg transform filter-button ${filter === option ? "bg-red-600 text-white scale-105 shadow-xl" : "bg-white text-gray-800 hover:bg-red-100 hover:text-red-600"} ${activeFilter === option ? "active" : ""}`}
                        >
                            <span className="filter-text">{option}</span>
                        </button>
                    ))}
                </div>

                {/* Search Box for Hát Sắc Bùa */}
                {filter === "Hát Sắc Bùa" && (
                    <div className="mb-8 flex justify-center">
                        <div className="relative w-full max-w-md">
                            <input
                                type="text"
                                placeholder={typingText}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-md"
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <Search size={20} />
                            </div>
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
                            )}
                        </div>
                    </div>
                )}

                {/* ===================================================================================== */}
                {/* ------------------- PHẦN HIỂN THỊ HÁT SẮC BÙA (ĐÃ SỬA ĐỔI) ------------------------- */}
                {/* ===================================================================================== */}
                {filter === "Hát Sắc Bùa" && filteredHatSacBua.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {filteredHatSacBua.map((form, index) => {
                            const uniqueId = `hatsacbua-${form.id}-${index}`;
                            const isExpanded = expandedCard === uniqueId;

                            return (
                                <div
                                    key={uniqueId}
                                    className={`transition-all duration-500 ease-out transform ${
                                        visibleCards.includes(`hatsacbua-${index}`)
                                            ? "opacity-100 translate-y-0"
                                            : "opacity-0 translate-y-10"
                                    } ${isExpanded ? "md:col-span-2 lg:col-span-3" : ""}`}
                                >
                                    <div
                                        ref={(el) => (cardRefs.current[uniqueId] = el)}
                                        className={`relative bg-white rounded-xl shadow-lg border-t-4 border-red-500 overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer h-full flex flex-col ${
                                            isExpanded ? "scale-[1.01]" : "hover:-translate-y-2"
                                        }`}
                                        onClick={(e) => toggleCard(uniqueId, e)}
                                    >
                                        {/* Nút đóng khi mở rộng */}
                                        {isExpanded && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleCard(uniqueId, e);
                                                }}
                                                className="absolute top-4 right-4 z-20 bg-white/80 p-2 rounded-full text-gray-500 hover:text-red-600 transition-colors"
                                            >
                                                <X size={24} />
                                            </button>
                                        )}

                                        {/* Phần Video - Luôn hiển thị ở trên cùng */}
                                        <div className={`w-full bg-black relative ${isExpanded ? "h-96" : "h-56"}`}>
                                            {form.videoUrl ? (
                                                <video
                                                    src={form.videoUrl}
                                                    className="w-full h-full object-cover"
                                                    controls
                                                    onClick={(e) => e.stopPropagation()} // Để click vào video không đóng/mở thẻ
                                                >
                                                    Trình duyệt của bạn không hỗ trợ video.
                                                </video>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 flex-col">
                                                    <Play size={40} className="mb-2 opacity-50"/>
                                                    <span>Chưa có video</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Phần Nội dung */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="text-3xl bg-red-50 p-2 rounded-lg">{form.icon || "🎵"}</span>
                                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                                                    {form.title}
                                                </h3>
                                            </div>

                                            {/* Phần miêu tả - Chỉ hiện khi mở rộng hoặc hiện ngắn gọn khi thu nhỏ */}
                                            <div className="text-gray-600 leading-relaxed flex-1">
                                                {isExpanded ? (
                                                    <div className="animate-fadeIn">
                                                        <h4 className="font-semibold text-red-600 mb-2 text-lg border-b border-red-100 pb-2 inline-block">
                                                            Nội dung chi tiết
                                                        </h4>
                                                        <p className="text-lg text-justify">{form.description}</p>
                                                    </div>
                                                ) : (
                                                    <p className="line-clamp-2 text-sm text-gray-500">
                                                        {form.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Nút Xem thêm (chỉ hiện khi chưa mở rộng) */}
                                            {!isExpanded && (
                                                <div className="mt-4 flex justify-end">
                                                    <span className="text-red-500 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                                                        Xem chi tiết →
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}


                {/* ===================================================================================== */}
                {/* ------------------- PHẦN TIMELINE VÀ TRUYỀN THỪA (GIỮ NGUYÊN) ----------------------- */}
                {/* ===================================================================================== */}
                {filter !== "Hát Sắc Bùa" && filteredGroupedForms.length > 0 && (
                    <div className="relative" ref={timelineRef}>
                        <div className="absolute left-1/2 w-1 bg-red-300 h-full transform -translate-x-1/2 timeline-line"></div>
                        {filteredGroupedForms.map((group, groupIndex) => (
                            <div key={group.year} className="mb-16 relative year-group">
                                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-red-400 z-10 year-marker">
                                    <h2 className="text-lg font-semibold text-red-600 year-text">{group.year}</h2>
                                </div>
                                {group.forms.map((form, formIndex) => {
                                    const isLeft = globalFormIndex % 2 === 0;
                                    globalFormIndex++;
                                    const uniqueId = `${form.id}-${group.year}-${formIndex}`;
                                    const hasAudio = audioMap[form.title];
                                    const isThisCardPlaying = currentPlayingCard === uniqueId && isPlaying;

                                    return (
                                        <div key={uniqueId} className={`mb-12 opacity-0 transition-all duration-700 ease-out transform ${visibleCards.includes(`${groupIndex}-${formIndex}`) ? "opacity-100 translate-y-0" : "translate-y-10"} flex ${isLeft ? "justify-start" : "justify-end"} timeline-item`}>
                                            <div className="absolute left-1/2 w-4 h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-2 z-10 timeline-dot"></div>
                                            <div
                                                ref={(el) => (cardRefs.current[uniqueId] = el)}
                                                className={`relative w-full md:w-1/2 bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer music-card ${expandedCard === uniqueId ? "expanded" : ""} ${isLeft ? "card-left" : "card-right"}`}
                                                onClick={(e) => toggleCard(uniqueId, e)}
                                            >
                                                {/* Card Content for Tradition/Timeline */}
                                                {expandedCard !== uniqueId ? (
                                                     <div className="gap-4">
                                                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                                            <div className="flex-shrink-0 w-full sm:w-32">
                                                                <img src={form.image || "/placeholder.png"} alt={form.title} className="w-full h-20 object-cover rounded-lg transition-all duration-500 hover:scale-105 image-zoom" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center mb-2">
                                                                    <span className="text-2xl mr-2 icon-bounce">{form.icon}</span>
                                                                    <h3 className="text-xl font-bold text-gray-800 title-glow">{form.title}</h3>
                                                                    {form.videoUrl && (
                                                                         <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full flex items-center gap-1"><Play size={12} /> Video</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-red-600 mb-2 year-badge">{form.year} • {form.type}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-600 line-clamp-3 description-fade">{form.description || form.content?.slice(0, 100) + "..."}</p>
                                                     </div>
                                                ) : (
                                                    <div className="expanded-layout">
                                                        <button onClick={(e) => { e.stopPropagation(); toggleCard(uniqueId, e); }} className="absolute top-4 right-4 z-20 text-gray-400 hover:text-red-500 transition-colors duration-200"><X size={28} /></button>
                                                        <div className="p-4">
                                                            <div className="mb-4 expanded-image-container">
                                                                <img src={form.image || "/placeholder.png"} alt={form.title} onClick={(e) => handleImageEnlarge(form.image, e)} className="w-full h-40 md:h-48 lg:h-52 object-cover rounded-xl shadow-md expanded-image cursor-pointer" />
                                                            </div>
                                                            
                                                            {/* Controls */}
                                                            <div className="flex justify-center gap-2 mb-6">
                                                                {hasAudio && (
                                                                    <button onClick={(e) => { e.stopPropagation(); isThisCardPlaying ? pauseAudio() : playAudio(form.title, uniqueId); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-300 ${isThisCardPlaying ? "bg-red-50 text-red-600 border border-red-300 hover:bg-red-100" : "bg-green-50 text-green-700 border border-green-300 hover:bg-green-100"}`}>
                                                                        {isThisCardPlaying ? <><Pause size={16} /> <span>Dừng nhạc</span></> : <><Play size={16} /> <span>Nghe nhạc</span></>}
                                                                    </button>
                                                                )}
                                                                {form.videoUrl && (
                                                                    <button onClick={(e) => openVideoModal(form.videoUrl, e)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100 transition-all duration-300">
                                                                        <Play size={16} /> <span>Xem video</span>
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center mb-4">
                                                                <span className="text-3xl mr-3 icon-bounce">{form.icon}</span>
                                                                <div className="flex-1">
                                                                    <h3 className="text-2xl font-bold text-gray-800 title-glow">{form.title}</h3>
                                                                    <p className="text-base text-red-600 year-badge-expanded">{form.year} • {form.type}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="text-gray-700 text-lg leading-relaxed bg-gray-50 rounded-lg p-4 description-expanded">
                                                                {form.content || form.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filter === "Hát Sắc Bùa" && filteredHatSacBua.length === 0 && (
                    <div className="text-center text-gray-600 py-12 no-data">
                        <div className="text-4xl mb-4">🎵</div>
                        <p>Không tìm thấy bài hát nào {searchTerm && `cho "${searchTerm}"`}.</p>
                    </div>
                )}
                {filter !== "Hát Sắc Bùa" && filteredGroupedForms.length === 0 && (
                     <div className="text-center text-gray-600 py-12 no-data">
                        <div className="text-4xl mb-4">🎵</div>
                        <p>Không tìm thấy dữ liệu cho loại hình {filter}.</p>
                    </div>
                )}

                {/* Scroll Top Button */}
                {showScrollTop && (
                    <button onClick={scrollToTop} className="fixed bottom-6 right-6 z-30 bg-red-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 scroll-top-button" aria-label="Lên đầu trang">
                        <span className="text-xl font-bold">↑</span>
                    </button>
                )}
            </div>

            {/* Modals */}
            {enlargedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto p-4 md:p-8 flex items-center justify-center" onClick={handleOverlayClick}>
                    <div className="relative max-w-4xl w-full">
                        <button className="absolute -top-12 right-0 text-white hover:text-red-300 transition-colors duration-200" onClick={closeEnlargedImage}><X size={32} /></button>
                        <img src={enlargedImage} alt="Ảnh phóng to" className="w-full h-auto max-h-[90vh] object-contain rounded-lg" />
                    </div>
                </div>
            )}

            {videoModalOpen && currentVideoUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={handleVideoOverlayClick}>
                    <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden">
                        <button onClick={closeVideoModal} className="absolute top-4 right-4 z-10 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors duration-200"><X size={24} /></button>
                        <div className="aspect-video bg-black">
                            <video ref={videoRef} src={currentVideoUrl} controls autoPlay className="w-full h-full">Trình duyệt của bạn không hỗ trợ video.</video>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Styles */}
            <style>{`
                .header-title { animation: fadeInDown 0.8s ease-out; }
                .header-subtitle { animation: fadeInUp 0.8s ease-out 0.2s both; }
                .filter-button { position: relative; overflow: hidden; }
                .filter-button::before { content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent); transition: left 0.5s; }
                .filter-button:hover::before { left: 100%; }
                .filter-button.active { animation: pulse 2s infinite; }
                .timeline-line { background: linear-gradient(to bottom, #fca5a5, #dc2626, #fca5a5); animation: lineFlow 3s ease-in-out infinite; }
                .year-marker { animation: bounceIn 0.6s ease-out; }
                .timeline-dot { animation: pulse 2s infinite; }
                .music-card { position: relative; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .music-card.expanded { transform: scale(1.02); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); min-height: 500px; }
                .icon-bounce { animation: bounce 2s infinite; }
                .year-badge { display: inline-block; padding: 4px 12px; background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; border-radius: 20px; font-size: 0.75rem; font-weight: 500; }
                .year-badge-expanded { display: inline-block; padding: 6px 14px; background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
                @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-5px); } 60% { transform: translateY(-3px); } }
                @keyframes bounceIn { 0% { transform: translate(-50%, -50%) scale(0.3); } 50% { transform: translate(-50%, -50%) scale(1.05); } 100% { transform: translate(-50%, -50%) scale(1); } }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
            `}</style>
        </div>
    );
};

export default CulturalHistory;