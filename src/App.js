import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import MyBookings from "./pages/MyBookings";
import ManageRooms from "./pages/ManageRooms";
import AllBookings from "./pages/AllBookings";
import CalendarView from "./pages/CalendarView";
import Profile from "./pages/Profile";
import ManageUsers from "./pages/ManageUsers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/profile" element={<Profile />} />

            <Route element={<ProtectedRoute allowedRoles={["admin", "superadmin"]} />}>
              <Route path="/manage-rooms" element={<ManageRooms />} />
              <Route path="/all-bookings" element={<AllBookings />} />
              <Route path="/manage-users" element={<ManageUsers />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
