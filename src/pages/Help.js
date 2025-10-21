import React, { useState } from "react";

const Help = () => {
  const [activeCategory, setActiveCategory] = useState("Bắt đầu");

  const categories = [
    "Bắt đầu",
    "Mô phỏng điệu múa",
    "Ghép mặt",
    "Sáng tác lời",
    "Karaoke",
    "Quản lý dự án",
    "FAQ",
  ];

  const content = {
    "Bắt đầu": {
      title: "Chào mừng đến với Văn Hóa AI",
      description:
        "Văn Hóa AI là nền tảng bảo tồn và trải nghiệm văn hóa Việt Nam thông qua công nghệ trí tuệ nhân tạo. Chúng tôi cung cấp các công cụ hiện đại để giúp bạn khám phá và tương tác với di sản văn hóa phi vật thể của Việt Nam.",
      sections: [
        {
          title: "Các tính năng chính",
          items: [
            "Mô Phỏng Điệu Múa: Học và thực hành các điệu múa truyền thống",
            "Ghép Mặt Vui: Thử các trang phục truyền thống",
            "Sáng Tác Lời: Tạo ca dao, dân ca mới",
            "Karaoke: Hát và được chấm điểm tự động",
          ],
        },
      ],
    },
    FAQ: {
      title: "Câu Hỏi Thường Gặp",
      sections: [
        {
          title: "Làm thế nào để bắt đầu sử dụng?",
          content:
            "Bạn có thể đăng ký tài khoản miễn phí và bắt đầu sử dụng ngay các tính năng. Không cần cài đặt phần mềm gì thêm.",
        },
        {
          title: "Tính năng nào miễn phí?",
          content:
            "Tất cả tính năng cơ bản đều miễn phí. Các tính năng nâng cao sẽ được cập nhật trong tương lai.",
        },
        {
          title: "Dữ liệu của tôi có được bảo mật không?",
          content:
            "Chúng tôi cam kết bảo vệ hoàn toàn dữ liệu cá nhân và các dự án của bạn. Mọi thông tin đều được mã hóa và lưu trữ an toàn.",
        },
      ],
    },
  };

  const activeContent = content[activeCategory] || content["Bắt đầu"];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/4 bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold gradient-text mb-6">Danh Mục</h2>
        <nav>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category}>
                <button
                  onClick={() => setActiveCategory(category)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    activeCategory === category
                      ? "gradient-bg text-white shadow-lg"
                      : "text-dark hover:bg-red-50"
                  }`}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="w-full lg:w-3/4 bg-white rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-dark mb-6">
          {activeContent.title}
        </h1>

        {activeContent.description && (
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            {activeContent.description}
          </p>
        )}

        {activeContent.sections &&
          activeContent.sections.map((section, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-xl font-semibold text-dark mb-4 flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-3"></span>
                {section.title}
              </h2>

              {section.items ? (
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-300 mt-2.5 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 pl-5 border-l-2 border-red-200 py-1">
                  {section.content}
                </p>
              )}
            </div>
          ))}

        {activeCategory === "Bắt đầu" && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-dark mb-6">
              Liên Hệ Hỗ Trợ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 rounded-xl p-5">
                <h3 className="font-medium text-dark mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-red-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Email
                </h3>
                <p className="text-red-600 font-medium">support@vanhoaai.com</p>
              </div>
              <div className="bg-red-50 rounded-xl p-5">
                <h3 className="font-medium text-dark mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-red-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Thời gian hỗ trợ
                </h3>
                <p className="text-gray-600">Thứ 2 - Thứ 6: 8:00 - 17:00</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Help;
