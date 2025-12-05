import { useEffect, useState } from "react";
import { Power, ChevronDown, Bell } from "lucide-react";

export default function Header() {
  const [userName, setUserName] = useState(localStorage.getItem("name") || "User");
  const [showDropdown, setShowDropdown] = useState(false);
  const role = localStorage.getItem("role") || "user";
  const avatar = localStorage.getItem("avatar");

  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    const handleStorage = () => setUserName(localStorage.getItem("name") || "User");
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-40">
      <div className="flex items-center justify-between h-full px-8">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 capitalize">
            {role === "admin" ? "Admin Portal" : `${role} Dashboard`}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {userName.split(" ")[0]}
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
            >
              {avatar ? (
                <img
                  src={`${BACKEND_URL}${avatar}`}
                  alt={userName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-gray-300"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{userName}</p>
                    <p className="text-sm text-gray-500">
                      {localStorage.getItem("email") || "user@company.com"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium"
                  >
                    <Power className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}