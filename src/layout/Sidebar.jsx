import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const BACKEND_URL = "http://localhost:5000"; // ✅ backend for uploaded logos

export default function Sidebar() {
  const location = useLocation();

  // ✅ Dynamic logo from localStorage (updated from Profile page)
  const [logo, setLogo] = useState(localStorage.getItem("logo") || "");

  const menu = [
    { name: "Dashboard", icon: "🏠", path: "/" },
    { name: "Rooms", icon: "🏢", path: "/rooms" },
    { name: "My Bookings", icon: "📅", path: "/my-bookings" },
    { name: "Calendar", icon: "🗓️", path: "/calendar" },
    { name: "Profile", icon: "👤", path: "/profile" },
  ];

  const adminMenu = [
    { name: "Manage Rooms", icon: "🛠️", path: "/manage-rooms" },
    { name: "All Bookings", icon: "📘", path: "/all-bookings" },
    { name: "Manage Users", icon: "👥", path: "/manage-users" },
  ];

  const role = localStorage.getItem("role");

  // ✅ Listen for logo updates from Profile
  useEffect(() => {
    const handleStorage = () => {
      setLogo(localStorage.getItem("logo") || "");
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <div className="w-60 h-screen bg-white shadow-xl fixed left-0 top-0 p-5">
      {/* ✅ DYNAMIC LOGO */}
      <div className="flex items-center gap-3 mb-6">
        <img
          src={
            logo
              ? `${BACKEND_URL}${logo}`
              : "/logo192.png"   // ✅ default fallback
          }
          alt="Company Logo"
          className="w-10 h-10 rounded-md object-contain"
        />
        <div>
          <p className="text-sm font-semibold">Meeting Rooms</p>
          <p className="text-xs text-gray-500">Booking System</p>
        </div>
      </div>

      <div className="space-y-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition ${
              location.pathname === item.path
                ? "bg-blue-600 text-white"
                : ""
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}

        {role !== "user" && (
          <>
            <p className="text-gray-400 text-xs mt-5 mb-2">MANAGEMENT</p>

            {adminMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition ${
                  location.pathname === item.path
                    ? "bg-blue-600 text-white"
                    : ""
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
