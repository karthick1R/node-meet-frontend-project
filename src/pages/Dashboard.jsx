import { useEffect, useMemo, useState } from "react";
import { fetchRooms } from "../api/rooms";
import { getAllBookings, getMyBookings } from "../api/bookings";

export default function Dashboard() {
  const role = localStorage.getItem("role");
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [roomsRes, myBookingsRes] = await Promise.all([
          fetchRooms(),
          getMyBookings(),
        ]);
        setRooms(roomsRes.data);
        setBookings(myBookingsRes.data);

        if (role !== "user") {
          const allBookingsRes = await getAllBookings();
          setBookings(allBookingsRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [role]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((booking) => new Date(booking.startDateTime) >= now)
      .sort(
        (a, b) =>
          new Date(a.startDateTime).getTime() -
          new Date(b.startDateTime).getTime()
      )
      .slice(0, 5);
  }, [bookings]);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Rooms" value={rooms.length} />
        <StatCard
          title={role === "user" ? "My Bookings" : "All Bookings"}
          value={bookings.length}
        />
        <StatCard title="Upcoming (next 5)" value={upcoming.length} />
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>

        {upcoming.length === 0 ? (
          <p className="text-gray-500">No upcoming meetings.</p>
        ) : (
          <div className="divide-y">
            {upcoming.map((booking) => (
              <div
                key={booking._id}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{booking.title}</p>
                  <p className="text-sm text-gray-500">
                    {booking.roomId?.name} • {booking.date} •{" "}
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs uppercase ${
                    booking.status === "cancelled"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
  );
}


