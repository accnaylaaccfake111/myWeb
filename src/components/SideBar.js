import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Smile, Music, Mic, History, FolderOpen } from "lucide-react";

const Sidebar = ({ showSidebar, toggleSidebar }) => {
  const location = useLocation();
  const menuItems = [
    {
      id: 1,
      name: "Mô phỏng điệu múa",
      path: "/dancing",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 2,
      name: "Ghép mặt vui nhộn",
      path: "/face-swap",
      icon: <Smile className="w-5 h-5" />,
    },
    {
      id: 3,
      name: "Sáng tác lời bài hát",
      path: "/lyrics-composition",
      icon: <Music className="w-5 h-5" />,
    },
    {
      id: 4,
      name: "Karaoke và chấm điểm",
      path: "/karaoke",
      icon: <Mic className="w-5 h-5" />,
    },
  ];

  return (
      <>
          {/* Overlay cho mobile */}
          {showSidebar && (
              <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                  onClick={toggleSidebar}
              ></div>
          )}

          {/* Fixed sidebar */}
          <aside
              className={`fixed inset-y-0 left-0 transform ${
                  showSidebar ? "translate-x-0" : "-translate-x-full"
              } md:translate-x-0 transition-transform duration-300 ease-in-out z-30 w-64 bg-white shadow-xl glass-effect top-20`}
          >
              <div className="h-full p-6 overflow-y-auto">
                  <h2 className="text-xl font-bold mb-8 gradient-text pl-4">
                      Công cụ AI
                  </h2>
                  <nav>
                      <ul className="space-y-3">
                          {menuItems.map((item) => (
                              <li key={item.id}>
                                  <Link
                                      to={item.path}
                                      onClick={() =>
                                          window.innerWidth < 768 &&
                                          toggleSidebar()
                                      }
                                      className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                                          location.pathname === item.path ||
                                          location.pathname.includes(item.path)
                                              ? "gradient-bg text-white shadow-lg"
                                              : "text-dark hover:bg-red-50 hover:text-red-600"
                                      }`}
                                  >
                                      <span className="text-xl">
                                          {item.icon}
                                      </span>
                                      <span className="font-medium">
                                          {item.name}
                                      </span>
                                  </Link>
                              </li>
                          ))}
                      </ul>
                  </nav>

                  <div className="mt-8 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                      <h3 className="font-semibold text-dark mb-2">
                          Bắt đầu ngay
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                          Khám phá các tính năng thú vị của Văn Hóa AI
                      </p>
                      <Link
                          to="/cultural-history"
                          onClick={() =>
                              window.innerWidth < 768 && toggleSidebar()
                          }
                          className="inline-block text-xs font-medium text-red-600 hover:text-red-700"
                      >
                          Khám phá ngay →
                      </Link>
                  </div>

                  {/* Additional Navigation Links - Mobile Only */}
                  <div className="md:hidden">
                      <nav className="mt-6">
                          <ul className="space-y-3">
                              <li>
                                  <Link
                                      to="/cultural-history"
                                      onClick={() =>
                                          window.innerWidth < 768 &&
                                          toggleSidebar()
                                      }
                                      className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                                          location.pathname ===
                                          "/cultural-history"
                                              ? "gradient-bg text-white shadow-lg"
                                              : "text-dark hover:bg-red-50 hover:text-red-600"
                                      }`}
                                  >
                                      <span className="text-xl">
                                          <History className="w-5 h-5" />
                                      </span>
                                      <span className="font-medium">
                                          Lịch sử văn hóa
                                      </span>
                                  </Link>
                              </li>
                              <li>
                                  <Link
                                      to="/my-projects"
                                      onClick={() =>
                                          window.innerWidth < 768 &&
                                          toggleSidebar()
                                      }
                                      className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                                          location.pathname === "/my-projects"
                                              ? "gradient-bg text-white shadow-lg"
                                              : "text-dark hover:bg-red-50 hover:text-red-600"
                                      }`}
                                  >
                                      <span className="text-xl">
                                          <FolderOpen className="w-5 h-5" />
                                      </span>
                                      <span className="font-medium">
                                          Dự án của tôi
                                      </span>
                                  </Link>
                              </li>
                              <li>
                                  <Link
                                      to="/feedback"
                                      onClick={() =>
                                          window.innerWidth < 768 &&
                                          toggleSidebar()
                                      }
                                      className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                                          location.pathname === "/feedback"
                                              ? "gradient-bg text-white shadow-lg"
                                              : "text-dark hover:bg-red-50 hover:text-red-600"
                                      }`}
                                  >
                                      <span className="text-xl">
                                          <FolderOpen className="w-5 h-5" />
                                      </span>
                                      <span className="font-medium">
                                          Đánh giá
                                      </span>
                                  </Link>
                              </li>
                          </ul>
                      </nav>
                  </div>
              </div>
          </aside>

          {/* Spacer for desktop to prevent content from going under fixed sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0"></div>
      </>
  );
};

export default Sidebar;
