import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import imgBanner from "../assets/img/img_barner7.jpg";
import { Music, Smile, Sparkles, Mic, ArrowRight } from "lucide-react";

const Home = () => {
  const features = [
    {
      id: 1,
      icon: <Sparkles className="w-6 h-6 text-red-600" />,
      title: "Mô phỏng điệu múa",
      description: "Phân tích và tái tạo các động tác múa truyền thống qua AI",
      path: "/dancing",
      color: "bg-red-100",
      borderColor: "hover:border-red-300",
      textColor: "text-red-600",
    },
    {
      id: 2,
      icon: <Smile className="w-6 h-6 text-amber-600" />,
      title: "Ghép mặt vui nhộn",
      description: "Tạo những khoảnh khắc vui vẻ bằng công nghệ ghép mặt AI",
      path: "/face-swap",
      color: "bg-amber-100",
      borderColor: "hover:border-amber-300",
      textColor: "text-amber-600",
    },
    {
      id: 3,
      icon: <Music className="w-6 h-6 text-blue-600" />,
      title: "Sáng tác lời bài hát",
      description: "AI giúp bạn sáng tác lời bài hát theo chủ đề yêu thích",
      path: "/lyrics-composition",
      color: "bg-blue-100",
      borderColor: "hover:border-blue-300",
      textColor: "text-blue-600",
    },
    {
      id: 4,
      icon: <Mic className="w-6 h-6 text-green-600" />,
      title: "Karaoke và chấm điểm",
      description: "Hát karaoke và nhận đánh giá từ AI về giọng hát của bạn",
      path: "/karaoke",
      color: "bg-green-100",
      borderColor: "hover:border-green-300",
      textColor: "text-green-600",
    },
  ];

  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counters, setCounters] = useState({
    users: 0,
    projects: 0,
    satisfaction: 0,
  });
  const statsRef = useRef(null);
  const featuresRef = useRef(null);

  // Hiệu ứng counter cho stats - chỉ chạy 1 lần
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000; // 2 seconds
          const steps = 60;
          const stepDuration = duration / steps;

          // Tốc độ khác nhau cho từng số
          const usersStep = 500 / steps;
          const projectsStep = 1000 / steps;
          const satisfactionStep = 95 / steps;

          let currentStep = 0;

          const timer = setInterval(() => {
            currentStep++;
            setCounters({
              users: Math.min(500, Math.floor(usersStep * currentStep)),
              projects: Math.min(1000, Math.floor(projectsStep * currentStep)),
              satisfaction: Math.min(
                95,
                Math.floor(satisfactionStep * currentStep)
              ),
            });

            if (currentStep >= steps) {
              clearInterval(timer);
            }
          }, stepDuration);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]); // Thêm dependency hasAnimated

  // Hiệu ứng cho features section khi scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section - Giữ nguyên bố cục */}
      <section className="relative overflow-hidden">
        <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center mb-12">
            {/* Tiêu đề hiện từ trên xuống */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight animate-slide-down">
              Bảo Tồn Văn Hóa Việt Nam
              <br />
              <span className="bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent text-3xl md:text-4xl lg:text-5xl">
                cùng Trí Tuệ Nhân Tạo
              </span>
            </h1>

            {/* Mô tả hiện sau 1 chút */}
            <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in-delay">
              Khám phá và trải nghiệm di sản văn hóa phi vật thể qua công nghệ
              trí tuệ nhân tạo hiện đại. Từ điệu múa truyền thống đến lời ca dân
              gian, chúng tôi giúp bạn kết nối với văn hóa Việt Nam.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
              <Link
                to="/dancing"
                className="group px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base"
              >
                Bắt đầu ngay
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/cultural-history"
                className="px-6 py-3 bg-white text-slate-700 rounded-full font-medium hover:bg-slate-50 transition-all border-2 border-slate-200 hover:border-slate-300 text-base"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>

          {/* Banner Image hiện ra đầu tiên */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-6xl mx-auto animate-fade-in">
            <div className="aspect-[21/10] bg-gradient-to-r from-red-100 via-amber-100 to-red-100">
              <img
                src={imgBanner}
                alt="Vietnamese traditional culture"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section với hiệu ứng scroll - Giữ nguyên bố cục */}
      <section ref={featuresRef} className="py-12 bg-white">
        <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Khám phá các công cụ AI hiện đại giúp bạn trải nghiệm và bảo tồn
              văn hóa Việt Nam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`group relative bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200 ${
                  feature.borderColor
                } transition-all hover:shadow-lg flex flex-col h-full ${
                  isVisible ? "animate-feature-in" : "opacity-0 translate-y-8"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                <div className="relative flex flex-col h-full">
                  <div
                    className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed flex-grow">
                    {feature.description}
                  </p>
                  <div className="mt-auto">
                    <Link
                      to={feature.path}
                      className={`${feature.textColor} font-medium hover:gap-2 flex items-center gap-1 transition-all group-hover:translate-x-1 text-sm`}
                    >
                      Trải nghiệm ngay
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section với hiệu ứng counter - Giữ nguyên bố cục */}
      <section
        ref={statsRef}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-[95rem] mx-auto mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {counters.users}+
            </div>
            <div className="text-gray-600 text-sm">Người dùng</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {counters.projects}+
            </div>
            <div className="text-gray-600 text-sm">Dự án đã tạo</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {counters.satisfaction}%
            </div>
            <div className="text-gray-600 text-sm">Hài lòng</div>
          </div>
        </div>
      </section>

      {/* Thêm CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes featureIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        .animate-slide-down {
          animation: slideDown 1s ease-out;
        }
        .animate-fade-in-delay {
          animation: fadeIn 1s ease-out 0.5s both;
        }
        .animate-fade-in-delay-2 {
          animation: fadeIn 1s ease-out 0.8s both;
        }
        .animate-feature-in {
          animation: featureIn 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default Home;
