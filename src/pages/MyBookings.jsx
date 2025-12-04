import { useEffect, useState } from "react";
import {
  cancelBooking,
  deleteBooking,
  getMyBookings,
} from "../api/bookings";
import BookingModal from "../components/BookingModal";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyBookings();
      setBookings(res.data);
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
      : bookings.filter((booking) => booking.status === statusFilter);

  const handleCancel = async (id) => {
    const reason = window.prompt("Cancellation reason:");
    if (reason === null) return;
    try {
      await cancelBooking(id, reason);
      await loadBookings();
      window.alert("Booking cancelled successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to cancel booking");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking permanently?")) return;
    try {
      await deleteBooking(id);
      await loadBookings();
      window.alert("Booking deleted successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete booking");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-gray-500">
            Create new meetings, review upcoming reservations, or cancel if
            plans change.
          </p>
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={() => setShowModal(true)}
        >
          + New Booking
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex justify-end mb-4">
          <select
            className="border rounded-lg p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <p>Loading bookings...</p>
        ) : filteredBookings.length === 0 ? (
          <p className="text-gray-500">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm">
                  <th className="py-2">Title</th>
                  <th>Room</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-t">
                    <td className="py-3 font-medium">{booking.title}</td>
                    <td>{booking.roomId?.name}</td>
                    <td>{booking.date}</td>
                    <td>
                      {booking.startTime} - {booking.endTime}
                    </td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs uppercase ${
                          booking.status === "cancelled"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="text-right space-x-3 text-sm">
                      {booking.status !== "cancelled" && (
                        <button
                          className="text-blue-600"
                          onClick={() => handleCancel(booking._id)}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        className="text-red-600"
                        onClick={() => handleDelete(booking._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <BookingModal
          close={() => setShowModal(false)}
          refresh={loadBookings}
        />
      )}
    </div>
  );
}

