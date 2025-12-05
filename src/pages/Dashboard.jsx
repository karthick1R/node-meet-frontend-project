import { useEffect, useMemo, useState } from "react";
import { fetchRooms } from "../api/rooms";
import { getAllBookings, getMyBookings } from "../api/bookings";
import { Calendar, Clock, MapPin, Users, Building2, CalendarCheck2 } from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export default function Dashboard() {
  const role = localStorage.getItem("role") || "user";
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

        if (role === "admin") {
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
      .filter((b) => new Date(b.startDateTime) >= now)
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime))
      .slice(0, 5);
  }, [bookings]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Rooms"
          value={rooms.length}
          icon={Building2}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title={role === "admin" ? "All Bookings" : "My Bookings"}
          value={bookings.length}
          icon={CalendarCheck2}
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Upcoming Meetings"
          value={upcoming.length}
          icon={Clock}
          color="from-green-500 to-emerald-500"
        />
      </div>

      {/* Upcoming Meetings */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-7 h-7 text-blue-600" />
            Upcoming Meetings
          </h2>
        </div>

        <div className="p-8">
          {upcoming.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-6">
              {upcoming.map((booking) => (
                <MeetingCard key={booking._id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Premium Stat Card
function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-5xl font-bold text-gray-900 mt-3">{value}</p>
        </div>
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} p-4 shadow-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
}

// Beautiful Meeting Card
function MeetingCard({ booking }) {
  const room = booking.roomId;
  const date = new Date(booking.startDateTime);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = `${booking.startTime} - ${booking.endTime}`;

  return (
    <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 border border-gray-200">
      {/* Room Image */}
      <div className="flex-shrink-0">
        {room?.image ? (
          <img
            src={`${BACKEND_URL}${room.image}`}
            alt={room.name}
            className="w-20 h-20 rounded-xl object-cover shadow-md"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-200 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
            <Building2 className="w-10 h-10 text-gray-400" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-900">{booking.title}</h3>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {room?.name || "Unknown Room"}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {time}
          </span>
        </div>
        {booking.participants && (
          <div className="flex items-center gap-2 mt-3">
            <Users className="w-4 h-4 text-gray-500" />
            <div className="flex -space-x-2">
              {booking.participants.slice(0, 4).map((p, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow"
                >
                  {p.charAt(0).toUpperCase()}
                </div>
              ))}
              {booking.participants.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center border-2 border-white">
                  +{booking.participants.length - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider ${
            booking.status === "cancelled"
              ? "bg-red-100 text-red-700"
              : booking.status === "completed"
              ? "bg-gray-100 text-gray-600"
              : "bg-green-100 text-green-700"
          }`}
        >
          {booking.status || "Confirmed"}
        </span>
      </div>
    </div>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-64"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-8">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-16 bg-gray-200 rounded mt-4 w-20"></div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
        <Calendar className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="mt-6 text-xl font-semibold text-gray-700">
        No Upcoming Meetings
      </h3>
      <p className="mt-2 text-gray-500">
        Enjoy your free time or book a new meeting room!
      </p>
    </div>
  );
}