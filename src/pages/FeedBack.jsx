import { useEffect, useState, useCallback } from "react";
import {
  Star,
  MessageCircle,
  User,
  Send,
  ChartColumn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { feedbackService } from "../services/feedbackService";
import { Link } from "react-router-dom";

const FeedBack = ({ isLoggedIn }) => {
  const [feedbackData, setFeedbackData] = useState({
    averageScore: 0,
    totalFeedBack: 0,
    ratingDistribution: [0, 0, 0, 0, 0],
  });
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    content: "",
    rating: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho phân trang và cache
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);
  const [totalPages, setTotalPages] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState("next");

  // Cache system
  const [feedbacksCache, setFeedbacksCache] = useState(new Map());
  const [preloadedPages, setPreloadedPages] = useState(new Set());
  const [ratingFillter, setRatingFillter] = useState(null);

  // Fetch feedback summary
  const fetchFeedbackSummary = async () => {
    try {
      const data = await feedbackService.getFeedbackSummary();
      setFeedbackData((prev) => ({
        ...prev,
        ...data,
      }));

      const totalItems = data.totalFeedBack || data.count || 0;
      const totalPages = feedbackService.calculateTotalPages(
        totalItems,
        itemsPerPage
      );
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error in fetchFeedbackSummary:", error);
    }
  };

  // Fetch recent feedbacks với cache
  const fetchRecentFeedbacks = useCallback(
    async (page, itemsPerPage, useCache = true) => {
      const cacheKey = `${page}-${itemsPerPage}`;

      // LUÔN sử dụng cache nếu có, hiển thị ngay lập tức
      if (useCache && feedbacksCache.has(cacheKey)) {
        const cachedData = feedbacksCache.get(cacheKey);
        setRecentFeedbacks(cachedData.feedbacks);
        return cachedData;
      }

      // Nếu không có cache, set loading state
      if (!feedbacksCache.has(cacheKey)) {
        setIsAnimating(true);
      }

      try {
        const response = await feedbackService.getRecentFeedbacks(
          page,
          itemsPerPage,
          ratingFillter
        );

        // Lưu vào cache
        const cacheData = {
          feedbacks: response.feedbacks,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          timestamp: Date.now(),
        };

        setFeedbacksCache((prev) => new Map(prev.set(cacheKey, cacheData)));
        setRecentFeedbacks(response.feedbacks);

        setIsAnimating(false);
        return response;
      } catch (error) {
        console.error("Error in fetchRecentFeedbacks:", error);
        setIsAnimating(false);
        return null;
      }
    },
    [feedbacksCache, totalPages, itemsPerPage]
  );

  // Preload trang
  const preloadPage = useCallback(
    async (page) => {
      if (page < 1 || page > totalPages || preloadedPages.has(page)) {
        return;
      }

      const cacheKey = `${page}-${itemsPerPage}`;
      if (feedbacksCache.has(cacheKey)) {
        setPreloadedPages((prev) => new Set(prev.add(page)));
        return;
      }

      try {
        const response = await feedbackService.getRecentFeedbacks(
          page,
          itemsPerPage,
          ratingFillter
        );

        const cacheData = {
          feedbacks: response.feedbacks,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          timestamp: Date.now(),
        };

        setFeedbacksCache((prev) => new Map(prev.set(cacheKey, cacheData)));
        setPreloadedPages((prev) => new Set(prev.add(page)));
      } catch (error) {
        console.error("Error preloading page:", error);
      }
    },
    [totalPages, itemsPerPage, preloadedPages, feedbacksCache]
  );

  // Preload các trang lân cận
  const preloadAdjacentPages = useCallback(() => {
    // Preload trang tiếp theo
    if (currentPage < totalPages) {
      preloadPage(currentPage + 1);
    }
    // Preload trang trước
    if (currentPage > 1) {
      preloadPage(currentPage - 1);
    }
    // Preload thêm các trang tiếp theo để tạo buffer
    if (currentPage + 2 <= totalPages) {
      preloadPage(currentPage + 2);
    }
    if (currentPage + 3 <= totalPages) {
      preloadPage(currentPage + 3);
    }
  }, [currentPage, totalPages, preloadPage]);

  // Cleanup cache
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const CACHE_DURATION = 10 * 60 * 1000; // 10 phút

    setFeedbacksCache((prev) => {
      const newCache = new Map();

      for (const [key, value] of prev.entries()) {
        if (now - value.timestamp < CACHE_DURATION) {
          newCache.set(key, value);
        }
      }

      return newCache;
    });
  }, []);

  // Submit new feedback
  const submitFeedback = async () => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để gửi đánh giá");
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackService.submitFeedback(newFeedback);

      setNewFeedback({
        content: "",
        rating: 5,
      });

      // Clear cache và reload
      setFeedbacksCache(new Map());
      setPreloadedPages(new Set());
      await fetchFeedbackSummary();
      await fetchRecentFeedbacks(1, itemsPerPage, false);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error in submitFeedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý animation
  useEffect(() => {
    if (recentFeedbacks.length > 0 && isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [recentFeedbacks, isAnimating]);

  // Preload khi currentPage thay đổi
  useEffect(() => {
    preloadAdjacentPages();
  }, [currentPage, preloadAdjacentPages]);

  // Cleanup cache định kỳ
  useEffect(() => {
    const interval = setInterval(cleanupCache, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [cleanupCache]);

  // Fetch summary on mount
  useEffect(() => {
    fetchFeedbackSummary();
  }, []);

  // Fetch feedbacks khi currentPage hoặc itemsPerPage thay đổi
  useEffect(() => {
    fetchRecentFeedbacks(currentPage, itemsPerPage, true);
  }, [currentPage, itemsPerPage, fetchRecentFeedbacks]);

  // Xử lý chuyển trang với cache
  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage || isAnimating)
      return;

    const direction = page > currentPage ? "next" : "prev";
    setAnimationDirection(direction);

    // Bắt đầu animation và chuyển trang ngay lập tức
    setIsAnimating(true);
    setCurrentPage(page);

    const cacheKey = `${page}-${itemsPerPage}`;

    // Nếu không có cache, fetch trong background
    if (!feedbacksCache.has(cacheKey)) {
      fetchRecentFeedbacks(page, itemsPerPage, true);
    }
  };

  // Xử lý chuyển trang tiếp theo
  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  // Xử lý chuyển trang trước đó
  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  // Render số trang
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Nút trang đầu
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded-lg transition-all duration-200 transform hover:scale-105 ${
            currentPage === i
              ? "bg-red-600 text-white shadow-lg scale-110"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }

    // Nút trang cuối
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  // Render stars for rating
  const renderStars = (rating, size = "sm") => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`${sizeClasses[size]} transition-all duration-300 ${
          index < rating
            ? "text-amber-500 fill-amber-500 transform scale-110"
            : "text-gray-300"
        }`}
      />
    ));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Không xác định";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Không xác định";
    }
  };

  // Tính phần trăm cho rating distribution
  const getRatingPercentage = (count) => {
    const total = feedbackData.totalFeedBack || recentFeedbacks.length || 1;
    return Math.round((count / total) * 100);
  };

  const currentCacheKey = `${currentPage}-${itemsPerPage}`;
  const isCurrentPageCached = feedbacksCache.has(currentCacheKey);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      {/* Feedback Section */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Đánh giá từ người dùng
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Chia sẻ trải nghiệm của bạn và xem những gì người dùng khác nói về
              chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Feedback Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 lg:sticky lg:top-24 h-fit transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <ChartColumn className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Tổng quan đánh giá
                </h3>
              </div>

              {/* Overall Rating */}
              <div className="text-center mb-8 p-4 bg-gradient-to-br from-red-50 to-amber-50 rounded-lg transition-all duration-300 hover:shadow-sm">
                <div className="text-5xl font-bold text-red-600 mb-3 transition-all duration-300">
                  {feedbackData.averageScore.toFixed(1)}
                </div>
                <div className="flex justify-center gap-1 mb-3">
                  {renderStars(Math.round(feedbackData.averageScore), "lg")}
                </div>
                <div className="text-sm text-gray-600">
                  Dựa trên {feedbackData.totalFeedBack} đánh giá
                </div>
              </div>

              {/* Rating distribution */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 text-sm">
                  Phân phối đánh giá
                </h4>
                {[5, 4, 3, 2, 1].map((rating, index) => {
                  const count =
                    feedbackData[
                      `${
                        rating === 1
                          ? "countOneStar"
                          : rating === 2
                          ? "countTwoStars"
                          : rating === 3
                          ? "countThreeStars"
                          : rating === 4
                          ? "countFourStars"
                          : "countFiveStars"
                      }`
                    ] || 0;

                  const percentage = getRatingPercentage(count);

                  return (
                    <button
                      type="button"
                      key={rating}
                      onClick={() => {
                        console.log(feedbackData);
                        setFeedbacksCache(new Map());
                        setCurrentPage(1);
                        if (rating === ratingFillter) {
                          setRatingFillter(null);
                          setTotalPages(
                            feedbackService.calculateTotalPages(
                              feedbackData.totalFeedBack,
                              itemsPerPage
                            )
                          );
                        } else {
                          setRatingFillter(rating);
                          setTotalPages(
                            feedbackService.calculateTotalPages(
                              count,
                              itemsPerPage
                            )
                          );
                        }
                      }}
                      className={`${
                        rating === ratingFillter &&
                        "border-l-2 border-orange-600"
                      } w-full flex items-center gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02]`}
                    >
                      <div className="flex items-center gap-2 w-10">
                        <span className="text-sm font-medium text-gray-700 w-3">
                          {rating}
                        </span>
                        <Star className="w-4 h-4 text-amber-500 transition-transform duration-300 group-hover:scale-110" />
                      </div>

                      <div className="flex-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-amber-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${percentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-16 justify-end">
                        <span className="text-sm font-medium text-gray-700 tabular-nums">
                          {count}
                        </span>
                        <span className="text-xs text-gray-500 w-8 text-left">
                          ({percentage}%)
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Feedback Form */}
            <div className="flex flex-col lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <MessageCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Chia sẻ trải nghiệm của bạn
                </h3>
              </div>

              <div className="flex-1 flex flex-col space-y-5">
                {/* Rating Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Đánh giá của bạn *
                  </label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() =>
                          setNewFeedback((prev) => ({
                            ...prev,
                            rating,
                          }))
                        }
                        className={`p-2 transition-all duration-300 transform hover:scale-110 border-orange-600 ${
                          rating === 1
                            ? "rounded-l-xl border-l-2"
                            : rating === 5 && "rounded-r-xl border-r-2"
                        }
                                                    ${
                                                      rating <=
                                                      newFeedback.rating
                                                        ? "bg-amber-50 shadow-lg scale-105"
                                                        : "bg-gray-50 hover:border-amber-200 hover:shadow-md"
                                                    }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Star
                            className={`w-8 h-8 transition-all duration-300 ${
                              rating <= newFeedback.rating
                                ? "text-amber-500 fill-amber-500 transform scale-110"
                                : "text-gray-300"
                            }`}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nội dung đánh giá *
                </label>
                <textarea
                  value={newFeedback.content}
                  onChange={(e) =>
                    setNewFeedback((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Chia sẻ chi tiết trải nghiệm của bạn về ứng dụng... (tối thiểu 10 ký tự)"
                  className="w-full flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all duration-300 hover:border-gray-400"
                  rows="4"
                  maxLength="500"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {newFeedback.content.length}/500 ký tự
                  </span>
                  {newFeedback.content.length < 10 && (
                    <span className="text-xs text-red-500">
                      Tối thiểu 10 ký tự
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                {isLoggedIn ? (
                  <button
                    onClick={submitFeedback}
                    disabled={
                      !newFeedback.content.trim() ||
                      newFeedback.content.length < 10 ||
                      isSubmitting
                    }
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-amber-700 transition-all duration-300 transform hover:scale-[1.02] disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                        Gửi đánh giá
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    state={{ from: "/feedback" }}
                    className="w-full block bg-gray-300 text-white px-6 py-2 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform text-center"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
          {/* Recent Feedbacks - Luôn hiển thị cho cả người dùng chưa đăng nhập */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Đánh giá gần đây
                  </h3>
                </div>
                <div className="text-sm text-gray-500">
                  {feedbackData.totalFeedBack || recentFeedbacks.length} đánh
                  giá
                </div>
              </div>

              {/* Container chính cho feedbacks với hiệu ứng fade + scale */}
              <div className={`relative mb-6`}>
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 transition-all duration-500 ease-out ${
                    isAnimating
                      ? animationDirection === "next"
                        ? "transform scale-95 opacity-0"
                        : "transform scale-105 opacity-0"
                      : "transform scale-100 opacity-100"
                  }`}
                >
                  {recentFeedbacks.length > 0 ? (
                    recentFeedbacks.map((feedback, index) => (
                      <FeedbackCard
                        key={`left-${feedback.id || index}`}
                        feedback={feedback}
                        renderStars={renderStars}
                        formatDate={formatDate}
                        index={index}
                      />
                    ))
                  ) : (
                    <div className="col-span-2">
                      <EmptyColumn />
                    </div>
                  )}
                </div>

                {/* Loading overlay chỉ hiển thị khi thực sự loading từ API */}
                {isAnimating && !isCurrentPageCached && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        Đang tải đánh giá...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                  {/* Thông tin trang hiện tại */}
                  <div className="text-sm text-gray-600 transition-all duration-300">
                    Trang <span className="font-medium">{currentPage}</span> /{" "}
                    <span className="font-medium">{totalPages}</span>
                    {" • "}
                    <span className="font-medium">
                      {Math.min(
                        (currentPage - 1) * itemsPerPage + 1,
                        feedbackData.totalFeedBack || 0
                      )}
                    </span>
                    {" - "}
                    <span className="font-medium">
                      {Math.min(
                        currentPage * itemsPerPage,
                        feedbackData.totalFeedBack || 0
                      )}
                    </span>
                    {" trên "}
                    <span className="font-medium">
                      {feedbackData.totalFeedBack || 0}
                    </span>{" "}
                    đánh giá
                  </div>

                  {/* Điều khiển phân trang */}
                  <div className="flex items-center gap-3">
                    {/* Nút trang trước */}
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1 || isAnimating}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                    >
                      <ChevronLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                      <span>Trước</span>
                    </button>

                    {/* Các số trang */}
                    <div className="flex gap-1">{renderPageNumbers()}</div>

                    {/* Nút trang tiếp theo */}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages || isAnimating}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                    >
                      <span>Tiếp</span>
                      <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>

                  {/* Chọn số item mỗi trang */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Mỗi trang:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        const newItemsPerPage = Number(e.target.value);
                        setItemsPerPage(newItemsPerPage);
                        setCurrentPage(1);
                        // Clear cache khi thay đổi items per page
                        setFeedbacksCache(new Map());
                        setPreloadedPages(new Set());
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
                    >
                      <option value={16}>16</option>
                      <option value={32}>32</option>
                      <option value={48}>48</option>
                      <option value={64}>64</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Component cho feedback card
const FeedbackCard = ({ feedback, renderStars, formatDate, index }) => (
  <div
    className="group p-4 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-lg"
    style={{
      animationDelay: `${(index % 10) * 100}ms`,
    }}
  >
    <div className="flex items-start gap-4">
      {/* Avatar với animation */}
      <div className="flex-shrink-0">
        {feedback.avatar ? (
          <img
            src={feedback.avatar}
            alt={feedback.fullname || "User"}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:border-red-200"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : null}
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br from-red-100 to-amber-100 flex items-center justify-center border-2 border-white shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:border-red-200 ${
            !feedback.avatar ? "flex" : "hidden"
          }`}
        >
          <User className="w-5 h-5 text-red-600 transition-transform duration-500 group-hover:scale-110" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-semibold text-gray-900 text-sm truncate transition-colors duration-300 group-hover:text-red-700">
            {feedback.fullName || feedback.fullname || "Người dùng"}
          </span>
          <div className="flex gap-1 transition-transform duration-300 group-hover:scale-105">
            {renderStars(feedback.rating, "sm")}
          </div>
          <span className="text-xs text-gray-500 ml-auto flex-shrink-0 transition-colors duration-300 group-hover:text-gray-700">
            {formatDate(
              feedback.createdAt || feedback.createDate || feedback.creatcode
            )}
          </span>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed break-words transition-colors duration-300 group-hover:text-gray-800">
          {feedback.content}
        </p>
      </div>
    </div>
  </div>
);

// Component cho cột trống
const EmptyColumn = () => (
  <div className="text-center text-gray-400 py-12 transition-all duration-500">
    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50 transition-transform duration-500 hover:scale-110" />
    <p className="text-base">Chưa có đánh giá nào</p>
    <p className="text-sm mt-1">Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
  </div>
);

export default FeedBack;
