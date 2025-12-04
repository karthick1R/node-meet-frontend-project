import { useEffect, useState } from "react";

export default function Header() {
  const [userName, setUserName] = useState(
    localStorage.getItem("name") || "User"
  );

  const role = localStorage.getItem("role") || "";

  useEffect(() => {
    const handleStorage = () => {
      setUserName(localStorage.getItem("name") || "User");
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    window.location.href = "/login";
  };

  return (
    <div className="flex justify-between items-center h-16 px-8 bg-white shadow fixed top-0 left-60 right-0 z-10">
      <h1 className="text-xl font-semibold capitalize">{role} Dashboard</h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">{userName}</span>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
