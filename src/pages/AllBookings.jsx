import { useEffect, useState } from "react";
import {
  cancelBooking,
  deleteBooking,
  getAllBookings,
} from "../api/bookings";
import { fetchRooms } from "../api/rooms";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  XCircle,
  Trash2,
  Filter,
  X,
  Building2,
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    roomId: "",
    from: "",
    to: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState("");

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => v && (params[k] = v));
      const res = await getAllBookings(params);
      setBookings(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    fetchRooms().then((res) => setRooms(res.data || []));
  }, []);

  const handleAction = async (reason) => {
    if (!reason?.trim()) return alert("Reason required");

    if (actionType === "cancel") {
      await cancelBooking(selectedBookingId, reason);
    } else {
      await deleteBooking(selectedBookingId, reason);
    }
    setShowReasonModal(false);
    loadBookings();
  };

  if (loading) return <BookingsSkeleton />;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">All Bookings</h1>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadBookings();
          }}
          className="grid md:grid-cols-5 gap-4"
        >
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            className="border px-4 py-3 rounded-xl"
          >
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.roomId}
            onChange={(e) =>
              setFilters({ ...filters, roomId: e.target.value })
            }
            className="border px-4 py-3 rounded-xl"
          >
            <option value="">All Rooms</option>
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="border px-4 py-3 rounded-xl"
            value={filters.from}
            onChange={(e) =>
              setFilters({ ...filters, from: e.target.value })
            }
          />
          <input
            type="date"
            className="border px-4 py-3 rounded-xl"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />

          <button className="bg-blue-600 text-white rounded-xl font-bold">
            Apply
          </button>
        </form>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {bookings.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            onCancel={() => {
              setSelectedBookingId(booking._id);
              setActionType("cancel");
              setShowReasonModal(true);
            }}
            onDelete={() => {
              setSelectedBookingId(booking._id);
              setActionType("delete");
              setShowReasonModal(true);
            }}
          />
        ))}
      </div>

      {showReasonModal && (
        <ReasonModal
          title={actionType === "cancel" ? "Cancel Booking" : "Delete Booking"}
          subtitle="Please provide a reason"
          onSubmit={handleAction}
          onClose={() => setShowReasonModal(false)}
        />
      )}
    </div>
  );
}

/* ✅ BOOKING CARD */
function BookingCard({ booking, onCancel, onDelete }) {
  const room = booking.roomId || {};
  const user = booking.userId || {};
  const isCancelled = booking.status === "cancelled";

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="p-6 flex gap-4 items-center">
        {room.image ? (
          <img
            src={`${BACKEND_URL}${room.image}`}
            className="w-16 h-16 rounded-xl object-cover"
            alt={room.name}
          />
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-xl">
            <Building2 className="text-gray-400" />
          </div>
        )}

        <div className="flex-1">
          <h3 className="font-bold">{booking.title}</h3>
          <p className="text-sm text-gray-600">
            <MapPin size={14} /> {room.name || "Unknown Room"}
          </p>
          <p className="text-sm text-gray-600">
            <User size={14} /> {user.name || "Unknown User"}
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-2 text-sm">
        <div>
          <Calendar size={14} />{" "}
          {new Date(booking.date).toDateString()}
        </div>
        <div>
          <Clock size={14} /> {booking.startTime} - {booking.endTime}
        </div>
      </div>

      <div className="px-6 pb-6 flex gap-3">
        {!isCancelled && (
          <button
            onClick={onCancel}
            className="flex-1 bg-orange-100 text-orange-700 py-2 rounded"
          >
            Cancel
          </button>
        )}
        <button
          onClick={onDelete}
          className="flex-1 bg-red-100 text-red-700 py-2 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* MODAL */
function ReasonModal({ title, subtitle, onSubmit, onClose }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="font-bold text-xl">{title}</h2>
        <p className="text-gray-600 mb-3">{subtitle}</p>
        <textarea
          className="border w-full p-2 rounded"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onSubmit(reason)}
            className="flex-1 bg-blue-600 text-white rounded py-2"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="flex-1 border rounded py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingsSkeleton() {
  return <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />;
}
