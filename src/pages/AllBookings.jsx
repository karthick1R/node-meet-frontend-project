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
  Loader2,
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
  const [actionType, setActionType] = useState(""); // 'cancel' or 'delete'
  const [selectedBookingId, setSelectedBookingId] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await getAllBookings(params);
      setBookings(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await fetchRooms();
        setRooms(res.data || []);
      } catch (err) {
        console.error("Failed to load rooms", err);
      }
    };
    loadRooms();
  }, []);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    loadData();
  };

  const clearFilters = () => {
    setFilters({ status: "", roomId: "", from: "", to: "" });
    loadData();
  };

  const openReasonModal = (id, type) => {
    setSelectedBookingId(id);
    setActionType(type);
    setShowReasonModal(true);
  };

  const handleAction = async (reason) => {
    if (!reason?.trim()) {
      alert("Reason is required");
      return;
    }

    try {
      if (actionType === "cancel") {
        await cancelBooking(selectedBookingId, reason);
      } else if (actionType === "delete") {
        await deleteBooking(selectedBookingId, reason);
      }
      setShowReasonModal(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  if (loading) return <BookingsSkeleton />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">All Bookings</h1>
        <p className="text-gray-500 mt-2">
          Complete overview of every meeting across the organization
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>

        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
          >
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.roomId}
            onChange={(e) => setFilters({ ...filters, roomId: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
          >
            <option value="">All Rooms</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
            placeholder="From"
          />

          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
            placeholder="To"
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Bookings Grid */}
      {bookings.length === 0 ? (
        <EmptyState hasFilters={hasActiveFilters} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={() => openReasonModal(booking._id, "cancel")}
              onDelete={() => openReasonModal(booking._id, "delete")}
            />
          ))}
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <ReasonModal
          title={actionType === "cancel" ? "Cancel Booking" : "Delete Booking"}
          subtitle={
            actionType === "cancel"
              ? "Please provide a reason for cancellation"
              : "This action is permanent. Please confirm with a reason."
          }
          onSubmit={handleAction}
          onClose={() => setShowReasonModal(false)}
        />
      )}
    </div>
  );
}

// Premium Booking Card
function BookingCard({ booking, onCancel, onDelete }) {
  const room = booking.roomId;
  const user = booking.userId;
  const isCancelled = booking.status === "cancelled";

  return (
    <div className={`bg-white rounded-2xl shadow-lg border ${isCancelled ? "border-red-200 opacity-80" : "border-gray-100"} overflow-hidden hover:shadow-xl transition-all duration-300`}>
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{booking.title}</h3>
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              isCancelled
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {booking.status || "Confirmed"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Room & User */}
        <div className="flex items-center gap-4">
          {room?.image ? (
            <img
              src={`${BACKEND_URL}${room.image}`}
              alt={room.name}
              className="w-16 h-16 rounded-xl object-cover shadow-md"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-900">{room?.name || "Unknown Room"}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user?.name || "Unknown User"}</span>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">
                {new Date(booking.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">
              {booking.startTime} - {booking.endTime}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 flex gap-3">
          {!isCancelled && (
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 font-medium transition"
            >
              <XCircle className="w-5 h-5" />
              Cancel
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 font-medium transition"
          >
            <Trash2 className="w-5 h-5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Reason Modal Component
function ReasonModal({ title, subtitle, onSubmit, onClose }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSubmit(reason)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 rounded-xl hover:shadow-lg transition"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 py-3 rounded-xl hover:bg-gray-50 font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
function BookingsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 bg-gray-200 rounded w-96"></div>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-32 bg-gray-200"></div>
            <div className="p-6 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty State
function EmptyState({ hasFilters }) {
  return (
    <div className="text-center py-20">
      <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Calendar className="w-16 h-16 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-700 mb-3">
        {hasFilters ? "No Bookings Match Filters" : "No Bookings Found"}
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        {hasFilters
          ? "Try adjusting your filters to see more results."
          : "There are currently no bookings in the system."}
      </p>
    </div>
  );
}