import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  CalendarDays,
  User,
  Settings,
  Users,
  UserCog,
  LogOut,
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export default function Sidebar() {
  const location = useLocation();
  const [logo, setLogo] = useState(localStorage.getItem("logo") || "");
  const role = localStorage.getItem("role") || "user";

  useEffect(() => {
    const handleStorage = () => setLogo(localStorage.getItem("logo") || "");
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const mainMenu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Rooms", icon: Building2, path: "/rooms" },
    { name: "My Bookings", icon: CalendarCheck, path: "/my-bookings" },
    { name: "Calendar", icon: CalendarDays, path: "/calendar" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  const adminMenu = [
    { name: "Manage Rooms", icon: Settings, path: "/manage-rooms" },
    { name: "All Bookings", icon: CalendarCheck, path: "/all-bookings" },
    { name: "Manage Users", icon: Users, path: "/manage-users" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 shadow-lg z-50 flex flex-col">
      {/* Logo & Title */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img
            src={logo ? `${BACKEND_URL}${logo}` : "/logo192.png"}
            alt="Company Logo"
            className="w-10 h-10 rounded-lg object-cover border border-gray-300"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Meeting Rooms</h1>
            <p className="text-xs text-gray-500">Booking System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {mainMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
              isActive(item.path)
                ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
            {isActive(item.path) && (
              <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </Link>
        ))}

        {role === "admin" && (
          <>
            <div className="my-4 h-px bg-gray-200"></div>
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administration
            </p>
            {adminMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  isActive(item.path)
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-indigo-600 rounded-full"></div>
                )}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500">
          © 2025 Your Company. All rights reserved.
        </p>
      </div>
    </aside>
  );
}