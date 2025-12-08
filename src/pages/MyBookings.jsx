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
    try {
      setLoading(true);
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

  const submitCancel = async (reason) => {
    await cancelBooking(selectedId, reason);
    await loadBookings();
    setReasonType(null);
    Swal.fire("Cancelled!", "", "success");
  };

  const submitDelete = async (reason) => {
    await deleteBooking(selectedId, reason);
    await loadBookings();
    setReasonType(null);
    Swal.fire("Deleted!", "", "success");
  };

  if (loading) return <BookingsSkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-gray-500">Manage your reservations</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-4 rounded-full shadow-xl flex items-center gap-2"
        >
          <Plus /> New Booking
        </button>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {["all", "confirmed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-6 py-2 rounded-lg ${
              statusFilter === f ? "bg-white shadow" : ""
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredBookings.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            onCancel={() => {
              setSelectedId(booking._id);
              setReasonType("cancel");
            }}
            onDelete={() => {
              setSelectedId(booking._id);
              setReasonType("delete");
            }}
          />
        ))}
      </div>

      {showModal && (
        <BookingModal
          close={() => {
            setShowModal(false);
            loadBookings();
          }}
        />
      )}

      {reasonType === "cancel" && (
        <ReasonModal title="Cancel Booking" onSubmit={submitCancel} onClose={() => setReasonType(null)} />
      )}

      {reasonType === "delete" && (
        <ReasonModal title="Delete Booking" onSubmit={submitDelete} onClose={() => setReasonType(null)} />
      )}
    </div>
  );
}

/* ✅ BOOKING CARD */
function BookingCard({ booking, onCancel, onDelete }) {
  const room = booking.roomId || {};
  const isCancelled = booking.status === "cancelled";

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="h-48 bg-gray-200 relative">
        {room.image ? (
          <img
            src={`${BACKEND_URL}${room.image}`}
            className="w-full h-full object-cover"
            alt={room.name}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Building2 className="w-16 h-16 text-gray-400" />
          </div>
        )}

        <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm ${
          isCancelled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}>
          {booking.status}
        </span>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold">{booking.title}</h3>

        <div className="mt-3 space-y-2 text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            {room.name || "Unknown Room"}
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            {new Date(booking.date).toDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            {booking.startTime} - {booking.endTime}
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} />
            {booking.participants?.length || 0} participants
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          {!isCancelled && (
            <button onClick={onCancel} className="flex-1 bg-orange-100 py-2 rounded">
              Cancel
            </button>
          )}
          <button onClick={onDelete} className="flex-1 bg-red-100 py-2 rounded">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingsSkeleton() {
  return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />;
}
