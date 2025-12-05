import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  cancelBooking,
  deleteBooking,
  getMyBookings,
} from "../api/bookings";
import BookingModal from "../components/BookingModal";
import ReasonModal from "../components/ReasonModal";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  XCircle,
  Trash2,
  Plus,
  Filter,
  Building2,
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [reasonType, setReasonType] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyBookings();
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

  const filteredBookings =
    statusFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const handleCancel = (id) => {
    setSelectedId(id);
    setReasonType("cancel");
  };

  const handleDelete = (id) => {
    setSelectedId(id);
    setReasonType("delete");
  };

  const submitCancel = async (reason) => {
    try {
      await cancelBooking(selectedId, reason);
      await loadBookings();
      setReasonType(null);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Booking cancelled",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    }
  };

  const submitDelete = async (reason) => {
    try {
      await deleteBooking(selectedId, reason);
      await loadBookings();
      setReasonType(null);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Booking deleted",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    }
  };

  if (loading) return <BookingsSkeleton />;
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
        {error}
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 mt-2">
            Manage your meeting reservations and schedule new ones
          </p>
        </div>

        {/* Floating New Booking Button */}
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 py-4 rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-3"
        >
          <Plus className="w-6 h-6" />
          New Booking
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {["all", "confirmed", "cancelled"].map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-6 py-3 rounded-lg font-medium capitalize transition-all ${
              statusFilter === filter
                ? "bg-white text-blue-700 shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {filter === "all" ? "All Bookings" : filter}
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={() => handleCancel(booking._id)}
              onDelete={() => handleDelete(booking._id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <BookingModal
          close={() => {
            setShowModal(false);
            loadBookings();
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Booking created successfully!",
              timer: 2500,
              showConfirmButton: false,
            });
          }}
          refresh={loadBookings}
        />
      )}

      {reasonType === "cancel" && (
        <ReasonModal
          title="Cancel Booking"
          subtitle="Please provide a reason for cancellation"
          onSubmit={submitCancel}
          onClose={() => setReasonType(null)}
        />
      )}

      {reasonType === "delete" && (
        <ReasonModal
          title="Delete Booking Permanently"
          subtitle="This action cannot be undone. Please confirm with a reason."
          onSubmit={submitDelete}
          onClose={() => setReasonType(null)}
        />
      )}
    </div>
  );
}

// Premium Booking Card
function BookingCard({ booking, onCancel, onDelete }) {
  const room = booking.roomId;
  const isCancelled = booking.status === "cancelled";

  return (
    <div className={`bg-white rounded-2xl shadow-lg border ${isCancelled ? "border-red-200 opacity-80" : "border-gray-100"} overflow-hidden hover:shadow-xl transition-all duration-300`}>
      {/* Room Image */}
      <div className="h-48 bg-gray-100 relative">
        {room?.image ? (
          <img
            src={`${BACKEND_URL}${room.image}`}
            alt={room.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Building2 className="w-20 h-20 text-gray-400" />
          </div>
        )}
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
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
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{booking.title}</h3>
        
        <div className="space-y-3 text-gray-600">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-500" />
            <span className="font-medium">{room?.name || "Unknown Room"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span>{new Date(booking.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <span>{booking.startTime} - {booking.endTime}</span>
          </div>
          {booking.participants && (
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-500" />
              <span>{booking.participants.length} participants</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
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

// Loading Skeleton
function BookingsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-64"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Calendar className="w-16 h-16 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-700 mb-3">
        No Bookings Found
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        You haven't made any bookings yet. Click the "New Booking" button to get started!
      </p>
    </div>
  );
}