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