// frontend/src/pages/CulturalHistory.js
import React, { useState, useEffect, useRef } from "react";
import { Search, X, Play, Pause } from "lucide-react";
import culturalForms from "../data/culturalData";
import choiXuanAudio from "../assets/audio/choixuan.mp3";
import giaTuAudio from "../assets/audio/giatu.mp3";
import vinhLongNganXuanAudio from "../assets/audio/VinhLongNganXuan.mp3";
import lyDauCauDaiAudio from "../assets/audio/lydaucaudai.mp3"; 
import ruocXuan from "../assets/audio/ruocxuan.mp3";
import coiNam from "../assets/audio/coinam.mp3";
import danBuaCuaDong from "../assets/audio/danbuacuadong.mp3";
import danBuaCuaGiua from "../assets/audio/danbuacuagiua.mp3";
import khaiMon from "../assets/audio/khaimon.mp3";
import lyDauCauVan from "../assets/audio/lydaucauvan.mp3"
import lyMuoiHaiThang from "../assets/audio/lymuoihaithang.mp3"
import moCuaRao from "../assets/audio/mocuarao.mp3"
import moNgo from "../assets/audio/mongo.mp3"
import tienSu from "../assets/audio/tiensu.mp3"
import veCacLoaiDua from "../assets/audio/vecacloaidua.mp3"
import xocQuach from "../assets/audio/xocquach.mp3"

const CulturalHistory = () => {
    const [filter, setFilter] = useState("Tất cả");
    const [expandedCard, setExpandedCard] = useState(null);
    const [visibleCards, setVisibleCards] = useState([]);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [scrollPositionBeforeExpand, setScrollPositionBeforeExpand] =
        useState(null);
    const [activeFilter, setActiveFilter] = useState("Tất cả");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentView, setCurrentView] = useState("timeline");
    const [typingText, setTypingText] = useState("");
    const [enlargedImage, setEnlargedImage] = useState(null);

    const [currentAudio, setCurrentAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlayingCard, setCurrentPlayingCard] = useState(null);

    const cardRefs = useRef({});
    const timelineRef = useRef(null);
    const audioRef = useRef(null);

    const filterOptions = [
        "Tất cả",
        "Nghi lễ",
        "Giúp vui",
        "Từ giã",
        "Sáng tác mới",
        "Hát Sắc Bùa",
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
    };

    const hatSacBuaForms = culturalForms.filter(
        (form) => form.type === "Hát Sắc Bùa",
    );
    const otherForms = culturalForms.filter(
        (form) => form.type !== "Hát Sắc Bùa",
    );

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

    useEffect(() => {
        if (expandedCard !== currentPlayingCard && isPlaying) {
            pauseAudio();
        }
    }, [expandedCard, currentPlayingCard]);

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

    useEffect(() => {
        if (enlargedImage) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [enlargedImage]);

    const handleImageEnlarge = (imageSrc, event) => {
        event.stopPropagation();
        setEnlargedImage(imageSrc);
    };

    const closeEnlargedImage = () => {
        setEnlargedImage(null);
    };
    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) {
            closeEnlargedImage();
        }
    };

    const advancedSearch = (forms, searchTerm) => {
        if (!searchTerm.trim()) return forms;

        const searchLower = searchTerm.toLowerCase().trim();

        return forms.filter((form) => {
            const titleMatch = form.title.toLowerCase().includes(searchLower);
            const authorMatch = form.author.toLowerCase().includes(searchLower);
            const pageMatch =
                form.page.includes(searchTerm) ||
                (form.pageRange &&
                    form.pageRange.some((page) =>
                        page.toString().includes(searchTerm),
                    ));
            const descriptionMatch = form.description
                .toLowerCase()
                .includes(searchLower);

            const contentMatch = form.parts.some((part) =>
                part.lyrics.toLowerCase().includes(searchLower),
            );

            return (
                titleMatch ||
                authorMatch ||
                pageMatch ||
                descriptionMatch ||
                contentMatch
            );
        });
    };

    // Filter Hát Sắc Bùa theo search term
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

    // Filter grouped forms
    const filteredGroupedForms = sortedYears
        .map((year) => ({
            year,
            forms:
                filter === "Tất cả"
                    ? groupedForms[year]
                    : groupedForms[year].filter((form) => form.type === filter),
        }))
        .filter((group) => group.forms.length > 0);

    useEffect(() => {
        setExpandedCard(null);
        setVisibleCards([]);

        setActiveFilter(filter);

        if (filter === "Hát Sắc Bùa") {
            setCurrentView("hatSacBua");
            let delay = 0;
            filteredHatSacBua.forEach((_, index) => {
                setTimeout(() => {
                    setVisibleCards((prev) => [...prev, `hatsacbua-${index}`]);
                }, delay + index * 100);
            });
        } else {
            setCurrentView("timeline");
            // Animation cho timeline
            let delay = 0;
            filteredGroupedForms.forEach((group, groupIndex) => {
                delay += 200;
                group.forms.forEach((_, formIndex) => {
                    setTimeout(() => {
                        setVisibleCards((prev) => [
                            ...prev,
                            `${groupIndex}-${formIndex}`,
                        ]);
                    }, delay + formIndex * 100);
                });
            });
        }
    }, [filter, searchTerm]);

    const toggleCard = (id, event) => {
        if (window.getSelection().toString().length > 0) {
            return;
        }

        if (expandedCard === id) {
            // Closing animation
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
            // Opening animation
            setScrollPositionBeforeExpand(window.scrollY);
            setExpandedCard(id);
            setTimeout(() => {
                const cardElement = cardRefs.current[id];
                if (cardElement) {
                    cardElement.style.transform = "scale(1.02)";
                    cardElement.style.zIndex = "10";

                    // Chỉ scroll nếu là Hát Sắc Bùa
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
        const duration = 800;
        const start = window.scrollY;
        const startTime = performance.now();
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);
            window.scrollTo(0, start * (1 - easedProgress));

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    };

    // Show/hide scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 200) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Extract milestone note from content
    const extractMilestone = (content) => {
        const milestoneMatch = content.match(/\*\*Mốc thời gian\*\*:.*$/m);
        return milestoneMatch
            ? milestoneMatch[0].replace("**Mốc thời gian**: ", "")
            : "";
    };

    // Format lyrics với cấu trúc mới cho Hát Sắc Bùa
    const formatHatSacBuaContent = (parts) => {
        let lastTitle = null;
        return parts.map((part, index) => {
            // Kiểm tra xem có nên hiển thị tiêu đề không
            const showTitle = part.partTitle && part.partTitle !== lastTitle;
            if (showTitle) {
                lastTitle = part.partTitle;
            }
            const indentationClass = !showTitle && part.partTitle ? "pl-5" : "";

            return (
                <div key={index} className="mb-6 part-section">
                    <div
                        className={`flex flex-wrap items-center gap-2 mb-3 ${indentationClass}`}
                    >
                        {showTitle && (
                            <h5 className="text-lg font-semibold text-red-600">
                                {part.partTitle}
                            </h5>
                        )}

                        {/* Các thông tin phụ luôn hiển thị */}
                        {part.pageNote && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md">
                                {part.pageNote}
                            </span>
                        )}
                        {part.partRole && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded-md">
                                {part.partRole}
                            </span>
                        )}
                        {part.tempo && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-600 text-sm rounded-md">
                                {part.tempo}
                            </span>
                        )}
                    </div>
                    <p
                        className={`text-gray-700 whitespace-pre-line leading-relaxed lyric-line ${indentationClass}`}
                    >
                        {part.lyrics}
                    </p>
                </div>
            );
        });
    };
    // Format lyrics với cấu trúc cũ
    const formatLyrics = (lyrics) => {
        return lyrics
            .split("\n")
            .map((line, index) => {
                if (line.trim() === "") return null;
                if (line.startsWith("**Mốc thời gian**")) return null;

                const animationDelay = `${index * 0.05}s`;

                if (
                    line.startsWith("**(") ||
                    (line.startsWith("(") &&
                        !line.includes("Cái kể") &&
                        !line.includes("Con xô"))
                ) {
                    const cleanedLine = line
                        .replace(/\*\*/g, "")
                        .replace(/[\(\)]/g, "")
                        .trim();
                    return (
                        <p
                            key={index}
                            className="font-semibold text-gray-700 whitespace-pre-line mb-2 flex items-center lyric-line"
                            style={{ animationDelay }}
                        >
                            <span className="mr-2 text-gray-600 lyric-icon">
                                ♪
                            </span>
                            {cleanedLine}
                        </p>
                    );
                }

                if (line.startsWith("**Cái kể**:")) {
                    return (
                        <p
                            key={index}
                            className="whitespace-pre-line lyric-line"
                            style={{ animationDelay }}
                        >
                            <span className="text-red-600 font-semibold">
                                Cái kể:
                            </span>
                            <span className="text-gray-600">
                                {line.slice(11)}
                            </span>
                        </p>
                    );
                }

                if (line.startsWith("**Con xô**:")) {
                    return (
                        <p
                            key={index}
                            className="whitespace-pre-line lyric-line"
                            style={{ animationDelay }}
                        >
                            <span className="text-blue-600 font-semibold">
                                Con xô
                            </span>
                            <span className="text-gray-600">
                                {line.slice(10)}
                            </span>
                        </p>
                    );
                }

                if (line.startsWith("Cái kể - Con xô:")) {
                    return (
                        <p
                            key={index}
                            className="whitespace-pre-line lyric-line"
                            style={{ animationDelay }}
                        >
                            <span className="text-green-600 font-semibold">
                                Cái kể - Con xô:
                            </span>
                            <span className="text-gray-600">
                                {line.slice(16)}
                            </span>
                        </p>
                    );
                }

                return (
                    <p
                        key={index}
                        className="text-gray-600 whitespace-pre-line lyric-line"
                        style={{ animationDelay }}
                    >
                        {line}
                    </p>
                );
            })
            .filter((line) => line !== null);
    };

    let globalFormIndex = 0;

    return (
        <div className="min-h-screen w-full px-4 py-8 bg-gradient-to-b from-gray-50 to-red-50">
            <div className="max-w-6xl mx-auto">
                {/* Enhanced Header Section with animation */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4 header-title">
                        Lịch sử văn hóa Sắc Bùa Phú Lễ
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg header-subtitle">
                        Khám phá nguồn gốc, ý nghĩa và sự phát triển của Sắc Bùa
                        Phú Lễ qua dòng thời gian, từ các bài hát truyền thống
                        đến sáng tác hiện đại.
                    </p>
                </div>

                {/* Enhanced Filter Section with better animations */}
                <div className="mb-8 flex justify-center flex-wrap gap-3">
                    {filterOptions.map((option) => (
                        <button
                            key={option}
                            onClick={() => {
                                setFilter(option);
                                setSearchTerm("");
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-500 shadow-md hover:shadow-lg transform filter-button ${
                                filter === option
                                    ? "bg-red-600 text-white scale-105 shadow-xl"
                                    : "bg-white text-gray-800 hover:bg-red-100 hover:text-red-600"
                            } ${activeFilter === option ? "active" : ""}`}
                            aria-label={`Lọc theo ${option}`}
                        >
                            <span className="filter-text">{option}</span>
                        </button>
                    ))}
                </div>

                {/* Search Box cho Hát Sắc Bùa */}
                {filter === "Hát Sắc Bùa" && (
                    <div className="mb-8 flex justify-center">
                        <div className="relative w-full max-w-md">
                            <input
                                type="text"
                                placeholder={typingText}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 shadow-md"
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <Search size={20} />
                            </div>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Hiển thị kết quả tìm kiếm cho Hát Sắc Bùa */}
                {filter === "Hát Sắc Bùa" && (
                    <div className="mb-6 text-center">
                        <p className="text-gray-600">
                            Tìm thấy{" "}
                            <span className="font-semibold text-red-600">
                                {filteredHatSacBua.length}
                            </span>{" "}
                            bài hát
                            {searchTerm && ` cho "${searchTerm}"`}
                        </p>
                    </div>
                )}

                {/* Hiển thị Hát Sắc Bùa dạng grid */}
                {filter === "Hát Sắc Bùa" && filteredHatSacBua.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {filteredHatSacBua.map((form, index) => {
                            const uniqueId = `hatsacbua-${form.id}-${index}`;
                            const isExpanded = expandedCard === uniqueId;
                            const uniquePartTitles = [
                                ...new Set(
                                    form.parts
                                        .map((p) => p.partTitle)
                                        .filter(Boolean),
                                ),
                            ];

                            return (
                                <div
                                    key={uniqueId}
                                    className={`transition-all duration-700 ease-out transform ${
                                        visibleCards.includes(
                                            `hatsacbua-${index}`,
                                        )
                                            ? "opacity-100 translate-y-0"
                                            : "opacity-0 translate-y-10"
                                    } ${
                                        isExpanded
                                            ? "md:col-span-2 lg:col-span-3"
                                            : ""
                                    }`}
                                >
                                    <div
                                        ref={(el) =>
                                            (cardRefs.current[uniqueId] = el)
                                        }
                                        className={`relative bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-400 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer music-card ${
                                            isExpanded ? "expanded-card" : ""
                                        }`}
                                        onClick={(e) => toggleCard(uniqueId, e)}
                                        aria-label={`Xem chi tiết bài hát ${form.title}`}
                                    >
                                        {isExpanded && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleCard(uniqueId, e);
                                                }}
                                                className="absolute top-4 right-4 z-20 text-gray-400 hover:text-red-500 transition-colors duration-200"
                                                aria-label="Đóng chi tiết"
                                            >
                                                <X size={28} />
                                            </button>
                                        )}

                                        {/* Subtle music note background decoration */}
                                        <div className="absolute top-2 right-2 text-red-100 text-xl opacity-30 music-note">
                                            ♪
                                        </div>

                                        {/* Layout khi thẻ đóng */}
                                        {!isExpanded && (
                                            <div className="flex flex-col h-full">
                                                <div className="flex-shrink-0 w-full mb-4">
                                                    <img
                                                        src={
                                                            form.image ||
                                                            "/placeholder.png"
                                                        }
                                                        alt={form.title}
                                                        className="w-full h-40 object-cover rounded-lg transition-all duration-500 hover:scale-105 image-zoom"
                                                    />
                                                </div>
                                                <div className="flex-1 flex flex-col">
                                                    <div className="flex items-center mb-2">
                                                        <span className="text-2xl mr-2 icon-bounce">
                                                            {form.icon}
                                                        </span>
                                                        <h3 className="text-xl font-bold text-gray-800 title-glow">
                                                            {form.title}
                                                        </h3>
                                                    </div>
                                                    <div className="mb-2">
                                                        <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-sm rounded-full border border-red-200 year-badge">
                                                            Trang {form.page} •{" "}
                                                            {form.author}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 mb-3 flex-1 line-clamp-3 description-fade">
                                                        {form.description}
                                                    </p>
                                                    {/* Hiển thị các partTitle duy nhất */}
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {uniquePartTitles.map(
                                                            (title, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-full border border-red-100"
                                                                >
                                                                    {title}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Layout khi thẻ mở cho Hát Sắc Bùa */}
                                        {isExpanded && (
                                            <div className="expanded-layout">
                                                <div className="flex flex-col lg:flex-row gap-6">
                                                    {/* Ảnh bên trái */}
                                                    <div className="lg:w-2/5">
                                                        <div className="expanded-image-container mb-4">
                                                            <img
                                                                src={
                                                                    form.image ||
                                                                    "/placeholder.png"
                                                                }
                                                                alt={form.title}
                                                                className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-md expanded-image"
                                                            />
                                                        </div>

                                                        {/* Hiển thị các ảnh trang nhỏ */}
                                                        {form.pageImages &&
                                                            form.pageImages
                                                                .length > 0 && (
                                                                <div className="page-images-section">
                                                                    <h4 className="text-lg font-semibold text-red-600 mb-3">
                                                                        Ảnh
                                                                        trang
                                                                        sách
                                                                    </h4>
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        {form.pageImages.map(
                                                                            (
                                                                                pageImage,
                                                                                imgIndex,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        imgIndex
                                                                                    }
                                                                                    className="relative cursor-pointer group"
                                                                                    onClick={(
                                                                                        e,
                                                                                    ) =>
                                                                                        handleImageEnlarge(
                                                                                            pageImage,
                                                                                            e,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <img
                                                                                        src={
                                                                                            pageImage
                                                                                        }
                                                                                        alt={`Trang ${
                                                                                            form.pageRange
                                                                                                ? form
                                                                                                      .pageRange[
                                                                                                      imgIndex
                                                                                                  ]
                                                                                                : imgIndex +
                                                                                                  1
                                                                                        }`}
                                                                                        className="w-full h-20 object-cover rounded-lg border border-gray-200 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
                                                                                    />
                                                                                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                                                                                        Trang{" "}
                                                                                        {form.pageRange
                                                                                            ? form
                                                                                                  .pageRange[
                                                                                                  imgIndex
                                                                                              ]
                                                                                            : imgIndex +
                                                                                              1}
                                                                                    </div>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>

                                                    {/* Nội dung bên phải */}
                                                    <div className="lg:w-3/5">
                                                        {/* Tiêu đề và thông tin cơ bản */}
                                                        <div className="flex items-start mb-4">
                                                            <span className="text-3xl mr-3 icon-bounce mt-1">
                                                                {form.icon}
                                                            </span>
                                                            <div className="flex-1">
                                                                <h3 className="text-2xl font-bold text-gray-800 title-glow mb-2">
                                                                    {form.title}
                                                                </h3>
                                                                <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-sm rounded-full border border-red-200 year-badge-expanded">
                                                                    Trang{" "}
                                                                    {form.page}{" "}
                                                                    •{" "}
                                                                    {
                                                                        form.author
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Mô tả ngắn */}
                                                        <p className="text-gray-600 mb-6 text-lg leading-relaxed description-expanded">
                                                            {form.description}
                                                        </p>

                                                        {/* Nội dung chi tiết - Cấu trúc mới cho Hát Sắc Bùa */}
                                                        <div className="text-gray-600 expanded-content">
                                                            <div className="mb-6 lyric-container">
                                                                <h4 className="text-xl font-semibold text-red-600 mb-4 section-title">
                                                                    Lời bài hát
                                                                </h4>
                                                                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto lyric-content">
                                                                    {formatHatSacBuaContent(
                                                                        form.parts,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {filter !== "Hát Sắc Bùa" &&
                    filteredGroupedForms.length > 0 && (
                        <div className="relative" ref={timelineRef}>
                            {/* Animated Vertical Timeline Line */}
                            <div className="absolute left-1/2 w-1 bg-red-300 h-full transform -translate-x-1/2 timeline-line"></div>

                            {filteredGroupedForms.map((group, groupIndex) => (
                                <div
                                    key={group.year}
                                    className="mb-16 relative year-group"
                                >
                                    {/* Enhanced Year Marker với pulse animation */}
                                    <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-red-400 z-10 year-marker">
                                        <h2 className="text-lg font-semibold text-red-600 year-text">
                                            {group.year}
                                        </h2>
                                    </div>

                                    {/* Timeline Cards */}
                                    {group.forms.map((form, formIndex) => {
                                        const isLeft =
                                            globalFormIndex % 2 === 0;
                                        globalFormIndex++;
                                        const uniqueId = `${form.id}-${group.year}-${formIndex}`;
                                        const hasAudio = audioMap[form.title];
                                        const isThisCardPlaying =
                                            currentPlayingCard === uniqueId &&
                                            isPlaying;

                                        return (
                                            <div
                                                key={uniqueId}
                                                className={`mb-12 opacity-0 transition-all duration-700 ease-out transform ${
                                                    visibleCards.includes(
                                                        `${groupIndex}-${formIndex}`,
                                                    )
                                                        ? "opacity-100 translate-y-0"
                                                        : "translate-y-10"
                                                } flex ${
                                                    isLeft
                                                        ? "justify-start"
                                                        : "justify-end"
                                                } timeline-item`}
                                            >
                                                {/* Animated Timeline Dot */}
                                                <div className="absolute left-1/2 w-4 h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-2 z-10 timeline-dot"></div>

                                                {/* Enhanced Timeline Card với better animations */}
                                                <div
                                                    ref={(el) =>
                                                        (cardRefs.current[
                                                            uniqueId
                                                        ] = el)
                                                    }
                                                    className={`relative w-full md:w-1/2 bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer music-card ${
                                                        expandedCard ===
                                                        uniqueId
                                                            ? "expanded"
                                                            : ""
                                                    } ${
                                                        isLeft
                                                            ? "card-left"
                                                            : "card-right"
                                                    }`}
                                                    onClick={(e) =>
                                                        toggleCard(uniqueId, e)
                                                    }
                                                    aria-label={`Xem chi tiết bài hát ${form.title}`}
                                                >
                                                    {/* Subtle music note background decoration */}
                                                    <div className="absolute top-2 right-2 text-red-100 text-xl opacity-30 music-note">
                                                        ♪
                                                    </div>

                                                    {/* Layout khi thẻ đóng - giữ nguyên */}
                                                    {expandedCard !==
                                                        uniqueId && (
                                                        <div className="gap-4">
                                                            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                                                <div className="flex-shrink-0 w-full sm:w-32">
                                                                    <img
                                                                        src={
                                                                            form.image ||
                                                                            "/placeholder.png"
                                                                        }
                                                                        alt={
                                                                            form.title
                                                                        }
                                                                        className="w-full h-20 object-cover rounded-lg transition-all duration-500 hover:scale-105 image-zoom"
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center mb-2">
                                                                        <span className="text-2xl mr-2 icon-bounce">
                                                                            {
                                                                                form.icon
                                                                            }
                                                                        </span>
                                                                        <h3 className="text-xl font-bold text-gray-800 title-glow">
                                                                            {
                                                                                form.title
                                                                            }
                                                                        </h3>
                                                                    </div>
                                                                    <p className="text-sm text-red-600 mb-2 year-badge">
                                                                        {
                                                                            form.year
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <p className="text-gray-600 line-clamp-3 description-fade">
                                                                {
                                                                    form.description
                                                                }
                                                            </p>
                                                        </div>
                                                    )}

                                                    {expandedCard ===
                                                        uniqueId && (
                                                        <div className="expanded-layout">
                                                            <div className="mb-6 expanded-image-container">
                                                                <img
                                                                    src={
                                                                        form.image ||
                                                                        "/placeholder.png"
                                                                    }
                                                                    alt={
                                                                        form.title
                                                                    }
                                                                    className="w-full h-40 md:h-48 lg:h-52 object-cover rounded-xl shadow-md expanded-image"
                                                                />
                                                            </div>

                                                            <div className="flex items-center mb-4">
                                                                <span className="text-3xl mr-3 icon-bounce">
                                                                    {form.icon}
                                                                </span>
                                                                <div className="flex-1">
                                                                    <h3 className="text-2xl font-bold text-gray-800 title-glow">
                                                                        {
                                                                            form.title
                                                                        }
                                                                    </h3>
                                                                    <p className="text-base text-red-600 year-badge-expanded">
                                                                        {
                                                                            form.year
                                                                        }{" "}
                                                                        •{" "}
                                                                        {
                                                                            form.type
                                                                        }
                                                                    </p>
                                                                </div>

                                                                {hasAudio && (
                                                                    <button
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            if (
                                                                                isThisCardPlaying
                                                                            ) {
                                                                                pauseAudio();
                                                                            } else {
                                                                                playAudio(
                                                                                    form.title,
                                                                                    uniqueId,
                                                                                );
                                                                            }
                                                                        }}
                                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                                                                            isThisCardPlaying
                                                                                ? "bg-red-600 text-white"
                                                                                : "bg-green-600 text-white hover:bg-green-700"
                                                                        }`}
                                                                        aria-label={
                                                                            isThisCardPlaying
                                                                                ? "Dừng nhạc"
                                                                                : "Phát nhạc"
                                                                        }
                                                                    >
                                                                        {isThisCardPlaying ? (
                                                                            <>
                                                                                <Pause
                                                                                    size={
                                                                                        20
                                                                                    }
                                                                                />
                                                                                <span>
                                                                                    Dừng
                                                                                    nhạc
                                                                                </span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Play
                                                                                    size={
                                                                                        20
                                                                                    }
                                                                                />
                                                                                <span>
                                                                                    Nghe
                                                                                    nhạc
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <p className="text-gray-600 mb-6 text-lg leading-relaxed description-expanded">
                                                                {
                                                                    form.description
                                                                }
                                                            </p>

                                                            <div className="text-gray-600 expanded-content">
                                                                <div className="mb-6 lyric-container">
                                                                    <h4 className="text-xl font-semibold text-red-600 mb-4 section-title">
                                                                        Lời bài
                                                                        hát
                                                                    </h4>
                                                                    <div className="bg-gray-50 rounded-lg p-4 lyric-content">
                                                                        {formatLyrics(
                                                                            form.content,
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="grid md:grid-cols-2 gap-6 info-grid">
                                                                    <div className="milestone-section">
                                                                        <h4 className="text-lg font-semibold text-red-600 mb-2">
                                                                            Mốc
                                                                            thời
                                                                            gian
                                                                        </h4>
                                                                        <p className="italic text-gray-700 milestone-fade bg-yellow-50 rounded-lg p-3">
                                                                            {extractMilestone(
                                                                                form.content,
                                                                            )}
                                                                        </p>
                                                                    </div>

                                                                    <div className="modern-section">
                                                                        <h4 className="text-lg font-semibold text-red-600 mb-2">
                                                                            Hiện
                                                                            nay
                                                                        </h4>
                                                                        <p className="italic text-gray-700 modern-development bg-blue-50 rounded-lg p-3">
                                                                            {
                                                                                form.modernDevelopment
                                                                            }
                                                                        </p>
                                                                    </div>
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

                {/* No data message */}
                {filter === "Hát Sắc Bùa" && filteredHatSacBua.length === 0 && (
                    <div className="text-center text-gray-600 py-12 no-data">
                        <div className="text-4xl mb-4">🎵</div>
                        <p>
                            Không tìm thấy bài hát nào{" "}
                            {searchTerm && `cho "${searchTerm}"`}.
                        </p>
                    </div>
                )}

                {filter !== "Hát Sắc Bùa" &&
                    filteredGroupedForms.length === 0 && (
                        <div className="text-center text-gray-600 py-12 no-data">
                            <div className="text-4xl mb-4">🎵</div>
                            <p>
                                Không tìm thấy dữ liệu cho loại hình {filter}.
                            </p>
                        </div>
                    )}

                {showScrollTop && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-6 z-30 bg-red-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 scroll-top-button"
                        aria-label="Lên đầu trang"
                    >
                        <span className="text-xl font-bold transform transition-transform duration-300 hover:-translate-y-1">
                            ↑
                        </span>
                    </button>
                )}
            </div>

            {enlargedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto p-4 md:p-8"
                    onClick={handleOverlayClick}
                >
                    <div className="relative max-w-4xl mx-auto my-8">
                        <button
                            className="absolute -top-10 right-0 md:-top-4 md:-right-10 text-white hover:text-red-300 transition-colors duration-200"
                            onClick={closeEnlargedImage}
                            aria-label="Đóng ảnh"
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={enlargedImage}
                            alt="Ảnh phóng to"
                            className="w-full h-auto object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}

            {/* CSS styles */}
            <style>{`
        .header-title {
          animation: fadeInDown 0.8s ease-out;
        }
        .header-subtitle {
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }
        .filter-button {
          position: relative;
          overflow: hidden;
        }
        .filter-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.5s;
        }
        .filter-button:hover::before {
          left: 100%;
        }
        .filter-button.active {
          animation: pulse 2s infinite;
        }
        .timeline-line {
          background: linear-gradient(to bottom, #fca5a5, #dc2626, #fca5a5);
          animation: lineFlow 3s ease-in-out infinite;
        }
        .year-marker {
          animation: bounceIn 0.6s ease-out;
        }
        .year-text::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: #dc2626;
          transition: width 0.3s ease;
        }
        .year-marker:hover .year-text::after {
          width: 100%;
        }
        .timeline-dot {
          animation: pulse 2s infinite;
        }
        .music-card {
          position: relative;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .music-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 0.75rem;
          background: linear-gradient(
            135deg,
            rgba(220, 38, 38, 0.03) 0%,
            rgba(220, 38, 38, 0.01) 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }
        .music-card:hover::before {
          opacity: 1;
        }
        .music-card:hover {
          border-left-color: #dc2626;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(220, 38, 38, 0.1);
        }
        .music-card.expanded {
          transform: scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .expanded-card {
          min-height: 500px;
        }
        .image-zoom {
          transition: transform 0.5s ease;
        }
        .music-card:hover .image-zoom {
          transform: scale(1.05);
        }
        .expanded-image {
          transition: transform 0.5s ease;
          width: 100%;
          object-fit: cover;
        }
        .expanded-image-container:hover .expanded-image {
          transform: scale(1.02);
        }
        .icon-bounce {
          animation: bounce 2s infinite;
        }
        .title-glow {
          position: relative;
        }
        .music-card:hover .title-glow {
          text-shadow: 0 0 8px rgba(220, 38, 38, 0.15);
        }
        .year-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .year-badge-expanded {
          display: inline-block;
          padding: 6px 14px;
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .music-card:hover .year-badge {
          background: #fecaca;
          transform: translateY(-1px);
        }
        .description-fade {
          transition: opacity 0.3s ease;
        }
        .description-expanded {
          font-size: 1.125rem;
          line-height: 1.7;
          border-left: 4px solid #fecaca;
          padding-left: 1rem;
        }
        .music-card:hover .description-fade {
          opacity: 0.9;
        }
        .expanded-layout {
          animation: slideDown 0.4s ease-out;
        }
        .expanded-content {
          animation: fadeIn 0.5s ease-out;
        }
        .lyric-line {
          animation: fadeInLeft 0.3s ease-out both;
        }
        .lyric-icon {
          animation: spin 3s linear infinite;
        }
        .section-title {
          animation: fadeIn 0.4s ease-out 0.1s both;
        }
        .lyric-content {
          animation: fadeIn 0.5s ease-out 0.2s both;
        }
        .milestone-fade {
          animation: fadeIn 0.4s ease-out 0.3s both;
        }
        .modern-development {
          animation: fadeIn 0.4s ease-out 0.4s both;
        }
        .info-grid {
          animation: fadeIn 0.5s ease-out 0.5s both;
        }
        .scroll-top-button {
          animation: fadeInUp 0.5s ease-out;
        }
        .no-data {
          animation: fadeIn 1s ease-out;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-5px);
          }
          60% {
            transform: translateY(-3px);
          }
        }
        @keyframes lineFlow {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes bounceIn {
          0% {
            transform: translate(-50%, -50%) scale(0.3);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.05);
          }
          70% {
            transform: translate(-50%, -50%) scale(0.9);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .lyric-container {
          overflow: visible !important;
        }
        .lyric-line {
          animation-fill-mode: both !important;
          will-change: transform, opacity;
        }

        /* Additional styles for Hát Sắc Bùa */
        .part-section {
          border-left: 3px solid #ef4444;
          padding-left: 1rem;
          margin-bottom: 1.5rem;
        }
        .music-card:not(.expanded-card) {
          height: 100%;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
        </div>
    );
};

export default CulturalHistory;
