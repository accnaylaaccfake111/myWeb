// // frontend/src/pages/CulturalHistory.js

// import React, { useState, useEffect, useRef } from "react";
// import { X, Play, Pause, ChevronDown, ChevronUp, Music, FileText } from "lucide-react";
// import culturalForms from "../data/culturalData";
// import giaTuAudio from "../assets/audio/giatu.mp3";
// import vinhLongNganXuanAudio from "../assets/audio/VinhLongNganXuan.mp3";
// import lyDauCauDaiAudio from "../assets/audio/lydaucaudai.mp3"; 
// import ruocXuan from "../assets/audio/ruocxuan.mp3";
// import coiNam from "../assets/audio/coinam.mp3";
// import danBuaCuaDong from "../assets/audio/danbuacuadong.mp3";
// import danBuaCuaGiua from "../assets/audio/danbuacuagiua.mp3";
// import khaiMon from "../assets/audio/khaimon.mp3";
// import lyDauCauVan from "../assets/audio/lydaucauvan.mp3"
// import lyMuoiHaiThang from "../assets/audio/lymuoihaithang.mp3"
// import moCuaRao from "../assets/audio/mocuarao.mp3"
// import moNgo from "../assets/audio/mongo.mp3"
// import tienSu from "../assets/audio/tiensu.mp3"
// import veCacLoaiDua from "../assets/audio/vecacloaidua.mp3"
// import xocQuach from "../assets/audio/xocquach.mp3"
// import choiXuan from "../assets/audio/choixuan.mp3"
// import chucNgheLamRuong from "../assets/audio/chucnghelamruong.mp3"
// import lyLoTho from "../assets/audio/lylotho.mp3"
// import lichSu from "../assets/document/lichsu.pdf";      

// const CulturalHistory = () => {
//     // --- STATE MANAGEMENT ---
//     const [filter, setFilter] = useState("Tất cả");
//     const [expandedCard, setExpandedCard] = useState(null);
//     const [visibleCards, setVisibleCards] = useState([]);
//     const [showScrollTop, setShowScrollTop] = useState(false);
//     const [scrollPositionBeforeExpand, setScrollPositionBeforeExpand] = useState(null);
//     const [activeFilter, setActiveFilter] = useState("Tất cả");
//     const [isIntroExpanded, setIsIntroExpanded] = useState(false);
//     // const [searchTerm, setSearchTerm] = useState(""); // Đã xóa search
//     const [currentView, setCurrentView] = useState("timeline");
//     const [enlargedImage, setEnlargedImage] = useState(null);

//     // Audio & Media State
//     const [currentAudio, setCurrentAudio] = useState(null); 
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentPlayingCard, setCurrentPlayingCard] = useState(null);
//     const [videoModalOpen, setVideoModalOpen] = useState(false);
//     const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
//     const [sheetMusicModalOpen, setSheetMusicModalOpen] = useState(false);
//     const [currentSheetMusic, setCurrentSheetMusic] = useState(null);

//     // Refs
//     const cardRefs = useRef({});
//     const timelineRef = useRef(null);
//     const audioRef = useRef(null);
//     const videoRef = useRef(null);

//     // Constants
//     const introText = `Sắc bùa Phú Lễ là một loại hình diễn xướng dân gian độc đáo, mang đậm dấu ấn văn hóa của cư dân nông nghiệp lúa nước tại Bến Tre. Không chỉ đơn thuần là các bài hát chúc tụng đầu xuân, Sắc bùa còn chứa đựng những giá trị tâm linh sâu sắc, cầu mong mưa thuận gió hòa, mùa màng bội thu và bình an cho gia chủ.
//     Trải qua hàng trăm năm hình thành và phát triển, từ những bài hát truyền thống mộc mạc đến những sáng tác mới mang hơi thở thời đại, Sắc bùa Phú Lễ vẫn giữ nguyên được hồn cốt dân tộc, trở thành di sản văn hóa phi vật thể quý báu cần được gìn giữ và phát huy. Hãy cùng khám phá hành trình lịch sử đầy thú vị này qua các mốc thời gian và tư liệu dưới đây.`;

//     const filterOptions = [
//         "Tất cả", "Nghi lễ", "Giúp vui", "Từ giã", 
//         "Sáng tác mới", "Nhạc cụ Sắc Bùa", "Truyền thừa",
//     ];

//     // Audio Map Configuration
//     const audioMap = {
//         "Bài Giã từ": giaTuAudio,
//         "Chơi xuân": choiXuan,
//         "Vĩnh Long Ngàn Xuân": vinhLongNganXuanAudio,
//         "Lý Đầu cầu dài": lyDauCauDaiAudio,
//         "Rước xuân": ruocXuan,
//         "Cõi Nam": coiNam,
//         "Dán bùa cửa Đông": danBuaCuaDong,
//         "Dán bùa cửa giữa": danBuaCuaGiua,
//         "Khai môn": khaiMon,
//         "Lý Đầu cầu vắn": lyDauCauVan,
//         "Lý Mười hai tháng": lyMuoiHaiThang,
//         "Mở cửa rào": moCuaRao,   
//         "Mở ngõ": moNgo,
//         "Tiên sư": tienSu, 
//         "Xốc quách": xocQuach,
//         "Vè các loại Dừa": veCacLoaiDua,
//         "Chúc nghề làm ruộng": chucNgheLamRuong,
//         "Lý Lơ thơ": lyLoTho,
//     };

//     // --- LOGIC XỬ LÝ DỮ LIỆU ---
//     const nhacCuSacBuaForms = culturalForms.filter((form) => form.type === "Nhạc cụ Sắc Bùa");
//     const otherForms = culturalForms.filter((form) => form.type !== "Nhạc cụ Sắc Bùa");

//     const filteredNhacCuSacBua = nhacCuSacBuaForms;

//     // Grouping for Timeline
//     const groupedForms = otherForms.reduce((acc, form) => {
//         const year = form.year;
//         if (!acc[year]) acc[year] = [];
//         acc[year].push(form);
//         return acc;
//     }, {});

//     const sortedYears = Object.keys(groupedForms).sort((a, b) => {
//         if (a === "Truyền thống") return -1;
//         if (b === "Truyền thống") return 1;
//         return a - b;
//     });

//     const filteredGroupedForms = sortedYears
//         .map((year) => ({
//             year,
//             forms: filter === "Tất cả"
//                 ? groupedForms[year]
//                 : groupedForms[year].filter((form) => form.type === filter),
//         }))
//         .filter((group) => group.forms.length > 0);

//     // --- EFFECTS ---
//     useEffect(() => {
//         setExpandedCard(null);
//         setVisibleCards([]);
//         setActiveFilter(filter);

//         if (filter === "Nhạc cụ Sắc Bùa") {
//             setCurrentView("nhacCuSacBua");
//             let delay = 0;
//             filteredNhacCuSacBua.forEach((_, index) => {
//                 setTimeout(() => {
//                     setVisibleCards((prev) => [...prev, `nhaccusacbua-${index}`]);
//                 }, delay + index * 100);
//             });
//         } else {
//             setCurrentView("timeline");
//             let delay = 0;
//             filteredGroupedForms.forEach((group, groupIndex) => {
//                 delay += 200;
//                 group.forms.forEach((_, formIndex) => {
//                     setTimeout(() => {
//                         setVisibleCards((prev) => [...prev, `${groupIndex}-${formIndex}`]);
//                     }, delay + formIndex * 100);
//                 });
//             });
//         }
//     }, [filter]);

//     // Scroll to Top Listener
//     useEffect(() => {
//         const handleScroll = () => {
//             if (window.scrollY > 200) {
//                 setShowScrollTop(true);
//             } else {
//                 setShowScrollTop(false);
//             }
//         };
//         window.addEventListener("scroll", handleScroll);
//         return () => window.removeEventListener("scroll", handleScroll);
//     }, []);

//     // Body Overflow Handling
//     useEffect(() => {
//         if (enlargedImage || videoModalOpen || sheetMusicModalOpen) {
//             document.body.style.overflow = "hidden";
//         } else {
//             document.body.style.overflow = "auto";
//         }
//         return () => {
//             document.body.style.overflow = "auto";
//         };
//     }, [enlargedImage, videoModalOpen, sheetMusicModalOpen]);

//     // Audio Cleanup
//     useEffect(() => {
//         return () => {
//             if (audioRef.current) {
//                 audioRef.current.pause();
//                 audioRef.current = null;
//             }
//         };
//     }, []);

//     // Pause audio when switching cards
//     useEffect(() => {
//         if (expandedCard !== currentPlayingCard && isPlaying) {
//             pauseAudio();
//         }
//     }, [expandedCard, currentPlayingCard]);


//     // --- ACTION HANDLERS ---
//     const playAudio = (title, cardId) => {
//         if (audioRef.current) {
//             audioRef.current.pause();
//             audioRef.current = null;
//         }

//         const audioFile = audioMap[title];
//         if (audioFile) {
//             const audio = new Audio(audioFile);
//             audioRef.current = audio;
//             setCurrentAudio(audio);
//             setIsPlaying(true);
//             setCurrentPlayingCard(cardId);

//             audio.play().catch((error) => {
//                 console.error("Lỗi phát nhạc:", error);
//                 setIsPlaying(false);
//                 setCurrentPlayingCard(null);
//             });

//             audio.onended = () => {
//                 setIsPlaying(false);
//                 setCurrentPlayingCard(null);
//             };
//         }
//     };

//     const pauseAudio = () => {
//         if (audioRef.current) {
//             audioRef.current.pause();
//             setIsPlaying(false);
//         }
//     };

//     const toggleCard = (id, event) => {
//         if (window.getSelection().toString().length > 0) return;
//         // Ngăn sự kiện khi click vào video control
//         if (event.target.tagName === 'VIDEO') return;

//         if (expandedCard === id) {
//             // Close
//             const cardElement = cardRefs.current[id];
//             if (cardElement) {
//                 cardElement.style.transform = "scale(1)";
//                 cardElement.style.zIndex = "1";
//             }
//             setExpandedCard(null);
//             if (scrollPositionBeforeExpand !== null) {
//                 window.scrollTo({ top: scrollPositionBeforeExpand, behavior: "smooth" });
//                 setScrollPositionBeforeExpand(null);
//             }
//         } else {
//             // Open
//             setScrollPositionBeforeExpand(window.scrollY);
//             setExpandedCard(id);
//             setTimeout(() => {
//                 const cardElement = cardRefs.current[id];
//                 if (cardElement) {
//                     cardElement.style.transform = "scale(1.02)";
//                     cardElement.style.zIndex = "10";
//                     if (filter === "Nhạc cụ Sắc Bùa") {
//                         const rect = cardElement.getBoundingClientRect();
//                         window.scrollTo({ top: window.scrollY + rect.top - 120, behavior: "smooth" });
//                     }
//                 }
//             }, 150);
//         }
//     };

//     const scrollToTop = () => {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//     };

//     // Modal Handlers
//     const handleImageEnlarge = (imageSrc, event) => {
//         event.stopPropagation();
//         setEnlargedImage(imageSrc);
//     };
//     const closeEnlargedImage = () => setEnlargedImage(null);
//     const handleOverlayClick = (event) => {
//         if (event.target === event.currentTarget) closeEnlargedImage();
//     };

//     const openVideoModal = (videoUrl, event) => {
//         event.stopPropagation();
//         setCurrentVideoUrl(videoUrl);
//         setVideoModalOpen(true);
//     };
//     const closeVideoModal = () => {
//         setVideoModalOpen(false);
//         setCurrentVideoUrl(null);
//         if (videoRef.current) videoRef.current.pause();
//     };
//     const handleVideoOverlayClick = (event) => {
//         if (event.target === event.currentTarget) closeVideoModal();
//     };

//     const openSheetMusicModal = (pageImages, pageRange, event) => {
//         event.stopPropagation();
//         setCurrentSheetMusic({ pageImages, pageRange });
//         setSheetMusicModalOpen(true);
//     };
//     const closeSheetMusicModal = () => {
//         setSheetMusicModalOpen(false);
//         setCurrentSheetMusic(null);
//     };
//     const handleSheetMusicOverlayClick = (event) => {
//         if (event.target === event.currentTarget) closeSheetMusicModal();
//     };

//     // Text Helper Functions
//     const extractMilestone = (content) => {
//         if (!content) return "";
//         const milestoneMatch = content.match(/\*\*Mốc thời gian\*\*:.*$/m);
//         return milestoneMatch ? milestoneMatch[0].replace("**Mốc thời gian**: ", "") : "";
//     };

//     const formatLyrics = (lyrics) => {
//         if (!lyrics) return null;
//         return lyrics.split("\n").map((line, index) => {
//             if (line.trim() === "") return null;
//             if (line.startsWith("**Mốc thời gian**")) return null;
//             const animationDelay = `${index * 0.05}s`;

//             if (line.startsWith("**(") || (line.startsWith("(") && !line.includes("Cái kể") && !line.includes("Con xô"))) {
//                 const cleanedLine = line.replace(/\*\*/g, "").replace(/[\(\)]/g, "").trim();
//                 return <p key={index} className="font-semibold text-gray-700 whitespace-pre-line mb-2 flex items-center lyric-line" style={{ animationDelay }}><span className="mr-2 text-gray-600 lyric-icon">♪</span>{cleanedLine}</p>;
//             }
//             if (line.startsWith("**Cái kể**:")) return <p key={index} className="whitespace-pre-line lyric-line" style={{ animationDelay }}><span className="text-red-600 font-semibold">Cái kể:</span><span className="text-gray-600">{line.slice(11)}</span></p>;
//             if (line.startsWith("**Con xô**:")) return <p key={index} className="whitespace-pre-line lyric-line" style={{ animationDelay }}><span className="text-blue-600 font-semibold">Con xô</span><span className="text-gray-600">{line.slice(10)}</span></p>;
//             if (line.startsWith("Cái kể - Con xô:")) return <p key={index} className="whitespace-pre-line lyric-line" style={{ animationDelay }}><span className="text-green-600 font-semibold">Cái kể - Con xô:</span><span className="text-gray-600">{line.slice(16)}</span></p>;
            
//             return <p key={index} className="text-gray-600 whitespace-pre-line lyric-line" style={{ animationDelay }}>{line}</p>;
//         }).filter(line => line !== null);
//     };

//     let globalFormIndex = 0;

//     return (
//         <div className="min-h-screen w-full px-4 py-8 bg-gradient-to-b from-gray-50 to-red-50">
//             <div className="max-w-6xl mx-auto">
//                 {/* Header Section */}
//                 <div className="text-center mb-12">
//                     <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4 header-title">
//                         Lịch sử văn hóa Sắc Bùa Phú Lễ
//                     </h1>
//                     <p className="text-gray-600 max-w-2xl mx-auto text-lg header-subtitle">
//                         Khám phá nguồn gốc, ý nghĩa và sự phát triển của Sắc Bùa Phú Lễ qua dòng thời gian.
//                     </p>
//                 </div>

//                 {/* Intro Card */}
//                 <div className="max-w-4xl mx-auto mb-10">
//                     <div className="bg-white rounded-xl shadow-md border-t-4 border-red-500 overflow-hidden transition-all duration-300 hover:shadow-lg relative">
//                         <div className="p-6 md:p-8">
//                             <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
//                                 <span className="mr-2">📜</span> Nguồn gốc, lịch sử của hát Sắc Bùa Phú Lễ
//                             </h3>
//                             <div className={`text-gray-700 leading-relaxed text-lg text-justify transition-all duration-700 ease-in-out overflow-hidden relative ${isIntroExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-24 opacity-80'}`}>
//                                 {introText.split('\n').map((paragraph, idx) => (
//                                     <p key={idx} className="mb-4">{paragraph}</p>
//                                 ))}
//                                 {!isIntroExpanded && (
//                                     <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
//                                 )}
//                             </div>
//                             <div className="mt-6 flex flex-wrap justify-center gap-4">
//                                 <button
//                                     onClick={() => setIsIntroExpanded(!isIntroExpanded)}
//                                     className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors duration-300 group shadow-sm border border-red-100"
//                                 >
//                                     {isIntroExpanded ? <>Thu gọn <ChevronUp size={18} /></> : <>Xem tóm tắt <ChevronDown size={18} /></>}
//                                 </button>
//                                 {isIntroExpanded && (
//                                     <a href={lichSu} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-300 shadow-md">
//                                         <FileText size={18} /> Tìm hiểu thêm
//                                     </a>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Filter Section */}
//                 <div className="mb-8 flex justify-center flex-wrap gap-3">
//                     {filterOptions.map((option) => (
//                         <button
//                             key={option}
//                             onClick={() => { setFilter(option); }}
//                             className={`px-4 py-2 rounded-lg font-medium transition-all duration-500 shadow-md hover:shadow-lg transform filter-button ${filter === option ? "bg-red-600 text-white scale-105 shadow-xl" : "bg-white text-gray-800 hover:bg-red-100 hover:text-red-600"} ${activeFilter === option ? "active" : ""}`}
//                         >
//                             <span className="filter-text">{option}</span>
//                         </button>
//                     ))}
//                 </div>

//                 {/* --- GRID VIEW: NHẠC CỤ SẮC BÙA --- */}
//                 {filter === "Nhạc cụ Sắc Bùa" && filteredNhacCuSacBua.length > 0 && (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
//                         {filteredNhacCuSacBua.map((form, index) => {
//                             const uniqueId = `nhaccusacbua-${form.id}-${index}`;
//                             const isExpanded = expandedCard === uniqueId;

//                             return (
//                                 <div
//                                     key={uniqueId}
//                                     className={`transition-all duration-700 ease-out transform ${visibleCards.includes(`nhaccusacbua-${index}`) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${isExpanded ? "md:col-span-2 lg:col-span-3" : ""}`}
//                                 >
//                                     <div
//                                         ref={(el) => (cardRefs.current[uniqueId] = el)}
//                                         className={`relative bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-400 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer music-card ${isExpanded ? "expanded-card" : ""}`}
//                                         onClick={(e) => toggleCard(uniqueId, e)}
//                                     >
//                                         {isExpanded && (
//                                             <button
//                                                 onClick={(e) => { e.stopPropagation(); toggleCard(uniqueId, e); }}
//                                                 className="absolute top-4 right-4 z-20 text-gray-400 hover:text-red-500 transition-colors duration-200"
//                                             >
//                                                 <X size={28} />
//                                             </button>
//                                         )}
//                                         <div className="absolute top-2 right-2 text-red-100 text-xl opacity-30 music-note">♪</div>

//                                         {/* CẬP NHẬT: Collapsed cho Nhạc cụ Sắc Bùa -> Hiện Video */}
//                                         {!isExpanded && (
//                                             <div className="flex flex-col h-full">
//                                                 <div className="flex-shrink-0 w-full mb-4">
//                                                     {form.videoUrl ? (
//                                                         <div className="w-full h-40 bg-black rounded-lg overflow-hidden relative group">
//                                                             <video 
//                                                                 src={form.videoUrl} 
//                                                                 className="w-full h-full object-cover"
//                                                                 controls
//                                                             />
//                                                         </div>
//                                                     ) : (
//                                                         <div className="w-full h-40 flex items-center justify-center bg-red-100 rounded-lg transition-all duration-500 hover:scale-105 image-zoom">
//                                                             <Music size={48} className="text-red-500 opacity-70" />
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                                 <div className="flex-1 flex flex-col">
//                                                     <div className="flex items-center mb-2">
//                                                         <span className="text-2xl mr-2 icon-bounce">{form.icon}</span>
//                                                         <h3 className="text-xl font-bold text-gray-800 title-glow">{form.title}</h3>
//                                                     </div>
//                                                     <div className="mb-2">
//                                                         <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-sm rounded-full border border-red-200 year-badge">{form.type}</span>
//                                                     </div>
//                                                     <p className="text-gray-600 mb-3 flex-1 line-clamp-3 description-fade">{form.description}</p>
//                                                 </div>
//                                             </div>
//                                         )}

//                                         {/* Expanded View */}
//                                         {isExpanded && (
//                                             <div className="expanded-layout">
//                                                 <div className="expanded-image-container mb-4 rounded-xl overflow-hidden shadow-md">
//                                                     {form.videoUrl ? (
//                                                         <div className="aspect-video">
//                                                             <video src={form.videoUrl} controls className="w-full h-full object-cover expanded-image">Trình duyệt không hỗ trợ video.</video>
//                                                         </div>
//                                                     ) : (
//                                                         <div className="flex items-center justify-center w-full h-64 lg:h-80 bg-gray-200 text-gray-500 rounded-xl">Không có video minh họa</div>
//                                                     )}
//                                                 </div>

//                                                 <div className="flex justify-center gap-2 mb-6">
//                                                     {audioMap[form.title] && (
//                                                         <button
//                                                             onClick={(e) => {
//                                                                 e.stopPropagation();
//                                                                 if (currentPlayingCard === uniqueId && isPlaying) {
//                                                                     pauseAudio();
//                                                                 } else {
//                                                                     playAudio(form.title, uniqueId);
//                                                                 }
//                                                             }}
//                                                             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-300 ${currentPlayingCard === uniqueId && isPlaying ? "bg-red-50 text-red-600 border border-red-300 hover:bg-red-100" : "bg-green-50 text-green-700 border border-green-300 hover:bg-green-100"}`}
//                                                         >
//                                                             {currentPlayingCard === uniqueId && isPlaying ? (
//                                                                 <><Pause size={16} /> <span>Dừng nhạc</span></>
//                                                             ) : (
//                                                                 <><Play size={16} /> <span>Nghe nhạc</span></>
//                                                             )}
//                                                         </button>
//                                                     )}
//                                                 </div>

//                                                 <div className="flex items-center mb-4">
//                                                     <span className="text-3xl mr-3 icon-bounce">{form.icon}</span>
//                                                     <div className="flex-1">
//                                                         <h3 className="text-2xl font-bold text-gray-800 title-glow mb-2">{form.title}</h3>
//                                                         <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-sm rounded-full border border-red-200 year-badge-expanded">{form.type}</span>
//                                                     </div>
//                                                 </div>

//                                                 <div className="text-gray-700 text-lg leading-relaxed bg-gray-50 rounded-lg p-4 description-expanded mb-6">
//                                                     <h4 className="text-xl font-semibold text-red-600 mb-3 border-b border-red-200 pb-2">Nội dung chi tiết</h4>
//                                                     <p className="whitespace-pre-line">{form.content}</p>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 )}

//                 {/* --- TIMELINE VIEW: OTHER FORMS --- */}
//                 {filter !== "Nhạc cụ Sắc Bùa" && filteredGroupedForms.length > 0 && (
//                     <div className="relative" ref={timelineRef}>
//                         <div className="absolute left-1/2 w-1 bg-red-300 h-full transform -translate-x-1/2 timeline-line"></div>
//                         {filteredGroupedForms.map((group, groupIndex) => (
//                             <div key={group.year} className="mb-16 relative year-group">
//                                 <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-red-400 z-10 year-marker">
//                                     <h2 className="text-lg font-semibold text-red-600 year-text">{group.year}</h2>
//                                 </div>
//                                 {group.forms.map((form, formIndex) => {
//                                     const isLeft = globalFormIndex % 2 === 0;
//                                     globalFormIndex++;
//                                     const uniqueId = `${form.id}-${group.year}-${formIndex}`;
//                                     const hasAudio = audioMap[form.title];
//                                     const isThisCardPlaying = currentPlayingCard === uniqueId && isPlaying;

//                                     return (
//                                         <div key={uniqueId} className={`mb-12 opacity-0 transition-all duration-700 ease-out transform ${visibleCards.includes(`${groupIndex}-${formIndex}`) ? "opacity-100 translate-y-0" : "translate-y-10"} flex ${isLeft ? "justify-start" : "justify-end"} timeline-item`}>
//                                             <div className="absolute left-1/2 w-4 h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-2 z-10 timeline-dot"></div>
//                                             <div
//                                                 ref={(el) => (cardRefs.current[uniqueId] = el)}
//                                                 className={`relative w-full md:w-1/2 bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer music-card ${expandedCard === uniqueId ? "expanded" : ""} ${isLeft ? "card-left" : "card-right"}`}
//                                                 onClick={(e) => toggleCard(uniqueId, e)}
//                                             >
//                                                 <div className="absolute top-2 right-2 text-red-100 text-xl opacity-30 music-note">♪</div>
                                                
//                                                 {/* TIMELINE VIEW (Collapsed): Giữ nguyên hiển thị ẢNH */}
//                                                 {expandedCard !== uniqueId && (
//                                                     <div className="gap-4">
//                                                         <div className="flex flex-col sm:flex-row gap-4 mb-4">
//                                                             <div className="flex-shrink-0 w-full sm:w-32">
//                                                                 <img src={form.image || "/placeholder.png"} alt={form.title} className="w-full h-20 object-cover rounded-lg transition-all duration-500 hover:scale-105 image-zoom" />
//                                                             </div>
//                                                             <div className="flex-1">
//                                                                 <div className="flex items-center mb-2">
//                                                                     <span className="text-2xl mr-2 icon-bounce">{form.icon}</span>
//                                                                     <h3 className="text-xl font-bold text-gray-800 title-glow">{form.title}</h3>
//                                                                     {form.videoUrl && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full flex items-center gap-1"><Play size={12} />Video</span>}
//                                                                 </div>
//                                                                 <p className="text-sm text-red-600 mb-2 year-badge">{form.year}</p>
//                                                             </div>
//                                                         </div>
//                                                         <p className="text-gray-600 line-clamp-3 description-fade">{form.description}</p>
//                                                     </div>
//                                                 )}

//                                                 {/* Timeline Content: Expanded */}
//                                                 {expandedCard === uniqueId && (
//                                                     <div className="expanded-layout">
//                                                         <button onClick={(e) => { e.stopPropagation(); toggleCard(uniqueId, e); }} className="absolute top-4 right-4 z-20 text-gray-400 hover:text-red-500 transition-colors duration-200">
//                                                             <X size={28} />
//                                                         </button>

//                                                         {form.type !== "Truyền thừa" && form.type !== "Nhạc cụ Sắc Bùa" && (
//                                                             <div className="p-4">
//                                                                 <div className="mb-4 expanded-image-container">
//                                                                     <img src={form.image || "/placeholder.png"} alt={form.title} onClick={(e) => handleImageEnlarge(form.image, e)} className="w-full h-40 md:h-48 lg:h-52 object-cover rounded-xl shadow-md expanded-image cursor-pointer" />
//                                                                 </div>
//                                                                 <div className="flex justify-center gap-2 mb-6">
//                                                                     {hasAudio && (
//                                                                         <button
//                                                                             onClick={(e) => {
//                                                                                 e.stopPropagation();
//                                                                                 if (isThisCardPlaying) pauseAudio();
//                                                                                 else playAudio(form.title, uniqueId);
//                                                                             }}
//                                                                             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-300 ${isThisCardPlaying ? "bg-red-50 text-red-600 border border-red-300 hover:bg-red-100" : "bg-green-50 text-green-700 border border-green-300 hover:bg-green-100"}`}
//                                                                         >
//                                                                             {isThisCardPlaying ? (
//                                                                                 <><Pause size={16} /> <span>Dừng nhạc</span></>
//                                                                             ) : (
//                                                                                 <><Play size={16} /> <span>Nghe nhạc</span></>
//                                                                             )}
//                                                                         </button>
//                                                                     )}
//                                                                     {form.videoUrl && (
//                                                                         <button onClick={(e) => openVideoModal(form.videoUrl, e)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100 transition-all duration-300">
//                                                                             <Play size={16} /> <span>Xem video</span>
//                                                                         </button>
//                                                                     )}
//                                                                     {form.pageImages && form.pageImages.length > 0 && (
//                                                                         <button onClick={(e) => openSheetMusicModal(form.pageImages, form.pageRange, e)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-purple-50 text-purple-700 border border-purple-300 hover:bg-purple-100 transition-all duration-300">
//                                                                             <Music size={16} /> <span>Sheet nhạc</span>
//                                                                         </button>
//                                                                     )}
//                                                                 </div>
//                                                                 <div className="flex items-center mb-4">
//                                                                     <span className="text-3xl mr-3 icon-bounce">{form.icon}</span>
//                                                                     <div className="flex-1">
//                                                                         <h3 className="text-2xl font-bold text-gray-800 title-glow">{form.title}</h3>
//                                                                         <p className="text-base text-red-600 year-badge-expanded">{form.year} • {form.type}</p>
//                                                                     </div>
//                                                                 </div>
//                                                                 <p className="text-gray-600 mb-6 text-lg leading-relaxed description-expanded">{form.description}</p>
                                                                
//                                                                 <div className="text-gray-600 expanded-content">
//                                                                     <div className="mb-6 lyric-container">
//                                                                         <h4 className="text-xl font-semibold text-red-600 mb-4 section-title">Lời bài hát</h4>
//                                                                         <div className="bg-gray-50 rounded-lg p-4 lyric-content">
//                                                                             {form.parts && form.parts.length > 0 ? formatLyrics(form.parts[0].lyrics) : formatLyrics(form.content)}
//                                                                         </div>
//                                                                     </div>
//                                                                     <div className="grid md:grid-cols-2 gap-6 info-grid">
//                                                                         <div className="milestone-section">
//                                                                             <h4 className="text-lg font-semibold text-red-600 mb-2">Mốc thời gian</h4>
//                                                                             <p className="italic text-gray-700 milestone-fade bg-yellow-50 rounded-lg p-3">{extractMilestone(form.content)}</p>
//                                                                         </div>
//                                                                         <div className="modern-section">
//                                                                             <h4 className="text-lg font-semibold text-red-600 mb-2">Hiện nay</h4>
//                                                                             <p className="italic text-gray-700 modern-development bg-blue-50 rounded-lg p-3">{form.modernDevelopment}</p>
//                                                                         </div>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         )}

//                                                         {form.type === "Truyền thừa" && (
//     <div className="p-4">
//         {/* Ảnh chính */}
//         <div className="mb-4 expanded-image-container">
//             <img 
//                 src={form.image || "/placeholder.png"} 
//                 alt={form.title} 
//                 onClick={(e) => handleImageEnlarge(form.image, e)} 
//                 className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-md expanded-image cursor-pointer hover:opacity-95 transition-opacity" 
//             />
//         </div>

//         {/* Tiêu đề & Loại */}
//         <div className="flex items-center mb-4">
//             <span className="text-3xl mr-3 icon-bounce">{form.icon}</span>
//             <div className="flex-1">
//                 <h3 className="text-2xl font-bold text-gray-800 title-glow">{form.title}</h3>
//                 <p className="text-base text-red-600 year-badge-expanded">{form.year} • {form.type}</p>
//             </div>
//         </div>

//         {/* Nội dung bài viết */}
//         <div className="text-gray-700 text-lg leading-relaxed bg-gray-50 rounded-lg p-4 description-expanded mb-6">
//             {form.content}
//         </div>

//         {/* --- PHẦN MỚI: ALBUM ẢNH (GALLERY) --- */}
//         {form.gallery && form.gallery.length > 0 && (
//             <div className="mt-4">
//                 <h4 className="text-lg font-bold text-red-600 mb-3 border-l-4 border-red-500 pl-3">
//                     Hình ảnh hoạt động
//                 </h4>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                     {form.gallery.map((imgSrc, imgIndex) => (
//                         <div 
//                             key={imgIndex} 
//                             className="relative group overflow-hidden rounded-lg shadow-sm cursor-pointer"
//                             onClick={(e) => handleImageEnlarge(imgSrc, e)}
//                         >
//                             <img 
//                                 src={imgSrc} 
//                                 alt={`Ảnh hoạt động ${imgIndex + 1}`} 
//                                 className="w-full h-32 md:h-40 object-cover transition-transform duration-500 group-hover:scale-110" 
//                             />
//                             {/* Hiệu ứng phủ mờ khi hover */}
//                             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
//                                 <span className="text-white opacity-0 group-hover:opacity-100 font-bold text-xl">+</span>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         )}
//     </div>
// )}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 {/* --- NO DATA / EMPTY STATES --- */}
//                 {filter === "Nhạc cụ Sắc Bùa" && filteredNhacCuSacBua.length === 0 && (
//                     <div className="text-center text-gray-600 py-12 no-data">
//                         <div className="text-4xl mb-4">🎵</div>
//                         <p>Không tìm thấy bài hát nào.</p>
//                     </div>
//                 )}
//                 {filter !== "Nhạc cụ Sắc Bùa" && filteredGroupedForms.length === 0 && (
//                     <div className="text-center text-gray-600 py-12 no-data">
//                         <div className="text-4xl mb-4">🎵</div>
//                         <p>Không tìm thấy dữ liệu cho loại hình {filter}.</p>
//                     </div>
//                 )}

//                 {/* Scroll Top Button */}
//                 {showScrollTop && (
//                     <button onClick={scrollToTop} className="fixed bottom-6 right-6 z-30 bg-red-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 scroll-top-button" aria-label="Lên đầu trang">
//                         <span className="text-xl font-bold transform transition-transform duration-300 hover:-translate-y-1">↑</span>
//                     </button>
//                 )}
//             </div>

//             {/* --- MODALS --- */}
//             {enlargedImage && (
//                 <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto p-4 md:p-8" onClick={handleOverlayClick}>
//                     <div className="relative max-w-4xl mx-auto my-8">
//                         <button className="absolute -top-10 right-0 md:-top-4 md:-right-10 text-white hover:text-red-300 transition-colors duration-200" onClick={closeEnlargedImage} aria-label="Đóng ảnh">
//                             <X size={32} />
//                         </button>
//                         <img src={enlargedImage} alt="Ảnh phóng to" className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl" />
//                     </div>
//                 </div>
//             )}

//             {videoModalOpen && (
//                 <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 md:p-8" onClick={handleVideoOverlayClick}>
//                     <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-xl shadow-2xl">
//                         <button className="absolute -top-10 right-0 md:-top-4 md:-right-10 text-white hover:text-red-300 transition-colors duration-200" onClick={closeVideoModal} aria-label="Đóng video">
//                             <X size={32} />
//                         </button>
//                         <video ref={videoRef} src={currentVideoUrl} controls autoPlay className="w-full h-full object-cover rounded-xl">Trình duyệt không hỗ trợ video.</video>
//                     </div>
//                 </div>
//             )}

//             {sheetMusicModalOpen && currentSheetMusic && (
//                 <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={handleSheetMusicOverlayClick}>
//                     <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
//                         <button onClick={closeSheetMusicModal} className="absolute top-4 right-4 z-10 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors duration-200" aria-label="Đóng sheet nhạc">
//                             <X size={24} />
//                         </button>
//                         <h3 className="text-2xl font-bold text-red-600 mb-4">Sheet nhạc</h3>
//                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
//                             {currentSheetMusic.pageImages.map((pageImage, imgIndex) => (
//                                 <div key={imgIndex} className="relative cursor-pointer group" onClick={(e) => { closeSheetMusicModal(); handleImageEnlarge(pageImage, e); }}>
//                                     <img src={pageImage} alt={`Trang ${imgIndex + 1}`} className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:border-red-400" />
//                                     <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-sm px-2 py-1 rounded">Trang {currentSheetMusic.pageRange ? currentSheetMusic.pageRange[imgIndex] : imgIndex + 1}</div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CulturalHistory;

//tht

// frontend/src/pages/CulturalHistory.js

import React, { useState } from "react";
import { X, Play, Info, ChevronDown, ChevronUp } from "lucide-react";

const CulturalHistory = () => {
  // --- STATE MANAGEMENT ---
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);

  // Danh sách dữ liệu video Karate từ các link bạn cung cấp
  const karateVideos = [
    { id: "HIZk8659ppg", title: "Kihon - Kỹ thuật cơ bản", desc: "Các đòn đấm, đá và đỡ căn bản trong Karate dành cho người mới." },
    { id: "fZrxfQI_vTE", title: "Heian Shodan", desc: "Bài quyền (Kata) đầu tiên trong hệ thống Heian." },
    { id: "dkvID4MI19g", title: "Heian Nidan", desc: "Bài quyền số 2 tập trung vào kỹ thuật tay và di chuyển linh hoạt." },
    { id: "zj_GSK6ZTCI", title: "Heian Sandan", desc: "Bài quyền số 3 giới thiệu các thế đứng và đòn đỡ cận chiến." },
    { id: "w5idgLe7Ybc", title: "Heian Yondan", desc: "Bài quyền số 4 nhấn mạnh vào sự uyển chuyển và đòn chân cao." },
    { id: "ALRUS30Q5Ls", title: "Heian Godan", desc: "Bài quyền cuối cùng của hệ Heian với kỹ thuật nhảy đặc trưng." },
    { id: "9blUQqwDNSM", title: "Tekki Shodan", desc: "Bài quyền thực hiện trên một đường ngang với thế đứng kỵ mã (Kiba-dachi)." },
    { id: "coYISN4StmQ", title: "Bassai Dai", desc: "Bài quyền 'Công phá thành trì', thể hiện sức mạnh bùng nổ." },
    { id: "rgs1ysn0R-0", title: "Kanku Dai", desc: "Bài quyền 'Nhìn lên bầu trời', kết hợp nhiều kỹ thuật chiến đấu phức tạp." },
    { id: "070L_78Crvg", title: "Jion", desc: "Bài quyền mang tính điềm tĩnh, tập trung vào sự ổn định và sức mạnh nội tại." },
  ];

  const introText = `Karate Việt Nam hình thành từ đầu thập niên 1960, với cái nôi là cố đô Huế, do võ sư Nhật Bản Suzuki Choji (tên Việt: Phan Văn Phúc) sáng lập hệ phái Suzucho Karatedo. Từ những võ đường đầu tiên tại Huế và Sài Gòn, Karate đã phát triển mạnh mẽ trên toàn quốc, trở thành một môn võ kết hợp tinh hoa Nhật Bản và thể chất, tinh thần người Việt.
Các giai đoạn lịch sử chính:
1960 - 1963 (Giai đoạn hình thành): Võ sư Suzuki Choji thành lập đạo đường Suzucho Karatedo đầu tiên tại số 8 Võ Tánh, Huế.
Thập niên 1960 - 1970 (Phát triển tại miền Trung & Nam): Huế trở thành cái nôi đào tạo nhiều cao đồ. Karatedo Suzucho phát triển mạnh và lan tỏa rộng rãi.
Sau năm 1975 - 1980 (Giai đoạn tổ chức): Karate-do được các cơ sở Thể dục Thể thao (TDTT) các tỉnh tiếp nhận.
Thập niên 1980 - 1990 (Hội nhập và chính thức hóa): Giải vô địch Karate-do toàn quốc lần thứ nhất được tổ chức (1991).
Từ 1995 - nay (Phát triển thành tích cao): Karatedo Việt Nam trở thành môn thể thao thế mạnh trên đấu trường quốc tế.
Karate không chỉ là môn thể thao chiến đấu mà còn đặc trưng bởi chữ "Lễ", sự tôn trọng và kỹ thuật hiện đại.`;

  return (
    <div className="min-h-screen w-full px-4 py-8 bg-gradient-to-b from-gray-50 to-red-50">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">
            Thư Viện Karate
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Tìm hiểu về nguồn gốc Suzucho Karatedo và luyện tập các bài quyền qua video hướng dẫn.
          </p>
        </div>

        {/* Intro Card (Giữ nguyên logic mở rộng/thu gọn) */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-xl shadow-md border-t-4 border-red-500 overflow-hidden transition-all duration-300 hover:shadow-lg relative">
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                <span className="mr-2">📜</span> Giới thiệu về Karate Việt Nam
              </h3>
              <div className={`text-gray-700 leading-relaxed text-lg text-justify transition-all duration-700 ease-in-out overflow-hidden relative ${isIntroExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-24 opacity-80'}`}>
                {introText.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
                {!isIntroExpanded && (
                  <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                )}
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors duration-300 group shadow-sm border border-red-100"
                >
                  {isIntroExpanded ? <>Thu gọn <ChevronUp size={18} /></> : <>Xem chi tiết <ChevronDown size={18} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-red-200 flex-1"></div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Play className="text-red-600" fill="currentColor" size={20} /> Thư viện Video
          </h2>
          <div className="h-px bg-red-200 flex-1"></div>
        </div>

        {/* Video Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {karateVideos.map((video) => (
            <div 
              key={video.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              {/* YouTube Embed */}
              <div className="aspect-video w-full bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Video Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800">
                    {video.title}
                  </h3>
                  <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded uppercase tracking-tighter border border-red-100">
                    Kỹ thuật mô phỏng
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic">
                  {video.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default CulturalHistory;