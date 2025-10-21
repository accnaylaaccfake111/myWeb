import React, { useState, useEffect, useRef } from "react";
import culturalForms from "../data/culturalData";

const CulturalHistory = () => {
    const [filter, setFilter] = useState("Tất cả");
    const [expandedCard, setExpandedCard] = useState(null);
    const [visibleCards, setVisibleCards] = useState([]);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [scrollPositionBeforeExpand, setScrollPositionBeforeExpand] =
        useState(null);
    const [activeFilter, setActiveFilter] = useState("Tất cả");
    const cardRefs = useRef({});
    const timelineRef = useRef(null);

    const filterOptions = [
        "Tất cả",
        "Nghi lễ",
        "Giúp vui",
        "Từ giã",
        "Sáng tác mới",
    ];

    // Group forms by year for chronological timeline
    const groupedForms = culturalForms.reduce((acc, form) => {
        const year = form.year;
        if (!acc[year]) acc[year] = [];
        acc[year].push(form);
        return acc;
    }, {});

    // Sort year groups chronologically
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

    // Enhanced animation for card visibility
    useEffect(() => {
        setExpandedCard(null);
        setVisibleCards([]);

        // Filter change animation
        setActiveFilter(filter);

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
    }, [filter]);

    // Enhanced toggle card with animation
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
                    const rect = cardElement.getBoundingClientRect();
                    const scrollOffset = 120;
                    window.scrollTo({
                        top: window.scrollY + rect.top - scrollOffset,
                        behavior: "smooth",
                    });
                }
            }, 150);
        }
    };

    // Enhanced smooth scroll to top with animation
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

    // Format lyrics with faster animations
    const formatLyrics = (lyrics) => {
        return lyrics
            .split("\n")
            .map((line, index) => {
                if (line.trim() === "") return null;
                if (line.startsWith("**Mốc thời gian**")) return null;

                // Faster lyric lines with staggered animations - reduced delay
                const animationDelay = `${index * 0.05}s`; // Giảm từ 0.1s xuống 0.05s

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
                            <span className="text-red-700 font-semibold">
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
                            <span className="text-blue-700 font-semibold">
                                Con xô:
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
                            <span className="text-green-700 font-semibold">
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

    // Calculate global index for alternating cards
    let globalFormIndex = 0;

    return (
        <div className="min-h-screen w-full px-4 py-8 bg-gradient-to-b from-gray-50 to-red-50">
            <div className="max-w-6xl mx-auto">
                {/* Enhanced Header Section with animation */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-red-700 mb-4 header-title">
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
                            onClick={() => setFilter(option)}
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

                {/* Enhanced Timeline Section */}
                {filteredGroupedForms.length > 0 ? (
                    <div className="relative" ref={timelineRef}>
                        {/* Animated Vertical Timeline Line */}
                        <div className="absolute left-1/2 w-1 bg-red-300 h-full transform -translate-x-1/2 timeline-line"></div>

                        {filteredGroupedForms.map((group, groupIndex) => (
                            <div
                                key={group.year}
                                className="mb-16 relative year-group"
                            >
                                {/* Enhanced Year Marker with pulse animation */}
                                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-red-400 z-10 year-marker">
                                    <h2 className="text-lg font-semibold text-red-700 year-text">
                                        {group.year}
                                    </h2>
                                </div>

                                {/* Timeline Cards */}
                                {group.forms.map((form, formIndex) => {
                                    const isLeft = globalFormIndex % 2 === 0;
                                    globalFormIndex++;
                                    const uniqueId = `${form.id}-${group.year}-${formIndex}`;

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
                                            <div className="absolute left-1/2 w-4 h-4 bg-red-600 rounded-full transform -translate-x-1/2 -translate-y-2 z-10 timeline-dot"></div>

                                            {/* Enhanced Timeline Card with better animations */}
                                            <div
                                                ref={(el) =>
                                                    (cardRefs.current[
                                                        uniqueId
                                                    ] = el)
                                                }
                                                className={`relative w-full md:w-1/2 bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-600 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer music-card ${
                                                    expandedCard === uniqueId
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

                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <div className="flex-shrink-0 w-full sm:w-32">
                                                        <img
                                                            src={
                                                                form.image ||
                                                                "/placeholder.png"
                                                            }
                                                            alt={form.title}
                                                            className="w-full h-20 object-cover rounded-lg transition-all duration-500 hover:scale-105 image-zoom"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <span className="text-2xl mr-2 icon-bounce">
                                                                {form.icon}
                                                            </span>
                                                            <h3 className="text-xl font-bold text-gray-800 title-glow">
                                                                {form.title}
                                                            </h3>
                                                        </div>
                                                        <p className="text-sm text-red-600 mb-2 year-badge">
                                                            {form.year}
                                                        </p>
                                                        <p className="text-gray-600 mb-3 line-clamp-3 description-fade">
                                                            {form.description}
                                                        </p>
                                                        {expandedCard ===
                                                            uniqueId && (
                                                            <div className="text-gray-600 expanded-content">
                                                                <div className="mb-3 lyric-container">
                                                                    {formatLyrics(
                                                                        form.content,
                                                                    )}
                                                                </div>
                                                                <p className="italic mb-3 milestone-fade">
                                                                    <span className="font-semibold">
                                                                        Mốc thời
                                                                        gian:{" "}
                                                                    </span>
                                                                    {extractMilestone(
                                                                        form.content,
                                                                    )}
                                                                </p>
                                                                <p className="italic modern-development">
                                                                    <span className="font-semibold">
                                                                        Hiện
                                                                        nay:{" "}
                                                                    </span>
                                                                    {
                                                                        form.modernDevelopment
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-600 py-12 no-data">
                        <div className="text-4xl mb-4">🎵</div>
                        <p>Không tìm thấy dữ liệu cho loại hình {filter}.</p>
                    </div>
                )}

                {/* Enhanced Floating Scroll to Top Button */}
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

            {/* Add CSS for enhanced animations */}
            <style jsx>{`
                /* Header animations */
                .header-title {
                    animation: fadeInDown 0.8s ease-out;
                }

                .header-subtitle {
                    animation: fadeInUp 0.8s ease-out 0.2s both;
                }

                /* Filter button animations */
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

                /* Timeline animations */
                .timeline-line {
                    background: linear-gradient(
                        to bottom,
                        #fca5a5,
                        #dc2626,
                        #fca5a5
                    );
                    animation: lineFlow 3s ease-in-out infinite;
                }

                .year-marker {
                    animation: bounceIn 0.6s ease-out;
                }

                .year-text {
                    position: relative;
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

                /* Card animations - REDUCED RED EFFECTS */
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
                    height: 0;
                    /* Giảm opacity từ 0.1 xuống 0.05 để nhẹ nhàng hơn */
                    background: linear-gradient(
                        to bottom,
                        rgba(220, 38, 38, 0.05),
                        transparent
                    );
                    transition: height 0.3s ease;
                    border-radius: 0.75rem;
                }

                .music-card:hover::before {
                    height: 100%;
                }

                .music-card.expanded {
                    transform: scale(1.02);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }

                /* Image zoom effect */
                .image-zoom {
                    transition: transform 0.5s ease;
                }

                .music-card:hover .image-zoom {
                    transform: scale(1.05);
                }

                /* Icon animations */
                .icon-bounce {
                    animation: bounce 2s infinite;
                }

                /* Title glow effect - REDUCED INTENSITY */
                .title-glow {
                    position: relative;
                }

                .music-card:hover .title-glow {
                    /* Giảm opacity từ 0.3 xuống 0.15 */
                    text-shadow: 0 0 8px rgba(220, 38, 38, 0.15);
                }

                /* Year badge animation */
                .year-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    background: #fecaca;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }

                .music-card:hover .year-badge {
                    /* Dùng màu nhẹ hơn khi hover */
                    background: #fed7d7;
                    transform: translateY(-2px);
                }

                /* Description fade animation */
                .description-fade {
                    transition: opacity 0.3s ease;
                }

                .music-card:hover .description-fade {
                    opacity: 0.9;
                }

                /* Expanded content animations - FASTER ANIMATIONS */
                .expanded-content {
                    animation: slideDown 0.3s ease-out; /* Giảm từ 0.5s xuống 0.3s */
                }

                .lyric-line {
                    /* Giảm thời gian animation và thêm forwards để hiển thị hết */
                    animation: fadeInLeft 0.3s ease-out both; /* Giảm từ 0.5s xuống 0.3s */
                }

                .lyric-icon {
                    animation: spin 3s linear infinite;
                }

                .milestone-fade {
                    animation: fadeIn 0.4s ease-out 0.1s both; /* Giảm delay */
                }

                .modern-development {
                    animation: fadeIn 0.4s ease-out 0.2s both; /* Giảm delay */
                }

                /* Scroll to top button animation */
                .scroll-top-button {
                    animation: fadeInUp 0.5s ease-out;
                }

                /* No data animation */
                .no-data {
                    animation: fadeIn 1s ease-out;
                }

                /* Keyframe definitions với timing nhanh hơn */
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
                        max-height: 0;
                    }
                    to {
                        opacity: 1;
                        max-height: 1000px;
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

                /* Đảm bảo tất cả lyric lines hiển thị ngay lập tức khi expanded */
                .lyric-container {
                    overflow: visible !important;
                }

                .lyric-line {
                    animation-fill-mode: both !important;
                    will-change: transform, opacity;
                }
            `}</style>
        </div>
    );
};

export default CulturalHistory;
