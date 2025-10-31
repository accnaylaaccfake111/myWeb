// frontend/src/components/Header.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const Header = ({ isLoggedIn, user, onLogout, toggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDropdownItemClick = () => {
    setShowDropdown(false);
  };

  // Lấy thông tin hiển thị từ user data
  const displayName =
    user?.fullName ||
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "");
  const avatarUrl = user?.avatarUrl;
  const avatarInitial =
    user?.fullName?.charAt(0) ||
    user?.name?.charAt(0) ||
    (user?.email ? user.email.charAt(0).toUpperCase() : "U");

  return (
    <header className="glass-effect sticky top-0 z-50 shadow-lg">
      <div className="mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo section - căn trái */}
        <div className="flex items-center space-x-4 w-64">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-md hover:bg-red-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg">
              <Home className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              Sắc bùa Phú Lễ
            </span>
          </Link>
        </div>

        {/* Navigation center */}
        <nav className="hidden md:flex space-x-8 flex-1 justify-center">
          <Link
            to="/"
            className={`font-medium transition-colors relative group px-4 py-2 rounded-lg ${
              location.pathname === "/"
                ? "text-white bg-red-600 shadow-md"
                : "text-dark hover:text-red-600 hover:bg-red-50"
            }`}
          >
            Trang chủ
          </Link>
          <Link
            to="/cultural-history"
            className={`font-medium transition-colors relative group px-4 py-2 rounded-lg ${
              location.pathname === "/cultural-history"
                ? "text-white bg-red-600 shadow-md"
                : "text-dark hover:text-red-600 hover:bg-red-50"
            }`}
          >
            Lịch sử văn hóa
          </Link>
          <Link
            to="/my-projects"
            className={`font-medium transition-colors relative group px-4 py-2 rounded-lg ${
              location.pathname === "/my-projects"
                ? "text-white bg-red-600 shadow-md"
                : "text-dark hover:text-red-600 hover:bg-red-50"
            }`}
          >
            Dự án của tôi
          </Link>
          <Link
            to="/feedback"
            className={`font-medium transition-colors relative group px-4 py-2 rounded-lg ${
              location.pathname === "/feedback"
                ? "text-white bg-red-600 shadow-md"
                : "text-dark hover:text-red-600 hover:bg-red-50"
            }`}
          >
            Đánh giá
          </Link>
        </nav>

        {/* Account section - căn phải */}
        <div className="flex justify-end w-64">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 bg-white p-2 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-white overflow-hidden">
                {isLoggedIn ? (
                  avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = null;
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full gradient-bg flex items-center justify-center">
                      {avatarInitial}
                    </div>
                  )
                ) : (
                  <div className="w-full h-full gradient-bg flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <span className="hidden md:block font-medium text-dark">
                {isLoggedIn ? displayName : "Đăng nhập"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-10 glass-effect border border-gray-100">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/profile"
                      className="block px-4 py-3 text-sm text-dark hover:bg-red-50 transition-colors"
                      onClick={handleDropdownItemClick}
                    >
                      Hồ sơ
                    </Link>
                    <Link
                      to="/my-projects"
                      className="block px-4 py-3 text-sm text-dark hover:bg-red-50 transition-colors"
                      onClick={handleDropdownItemClick}
                    >
                      Dự án của tôi
                    </Link>
                    <button
                      onClick={() => {
                        onLogout();
                        handleDropdownItemClick();
                        navigate("/login");
                      }}
                      className="block w-full text-left px-4 py-3 text-sm text-dark hover:bg-red-50 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-sm text-dark hover:bg-red-50 transition-colors"
                      onClick={handleDropdownItemClick}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-3 text-sm text-dark hover:bg-red-50 transition-colors"
                      onClick={handleDropdownItemClick}
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
