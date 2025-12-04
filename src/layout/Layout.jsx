import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  return (
    <div>
      <Sidebar />
      <Header />

      <div className="ml-60 mt-20 p-6 bg-gray-100 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
