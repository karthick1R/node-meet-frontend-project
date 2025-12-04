import { useEffect, useState } from "react";
import {
  cancelBooking,
  deleteBooking,
  getAllBookings,
} from "../api/bookings";
import { fetchRooms } from "../api/rooms";

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

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const res = await getAllBookings(params);
      setBookings(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getAllBookings();
        setBookings(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await fetchRooms();
        setRooms(res.data);
      } catch {
        // ignore
      }
    };
    loadRooms();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleCancel = async (id) => {
    const reason = window.prompt("Cancellation reason:");
    if (reason === null) return;
    try {
      await cancelBooking(id, reason);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to cancel booking");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking permanently?")) return;
    try {
      await deleteBooking(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete booking");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">All Bookings</h1>
          <p className="text-gray-500">
            Review, filter, and manage every meeting across the organization.
          </p>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form
        className="bg-white rounded-xl shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4"
        onSubmit={handleFilter}
      >
        <select
          className="border rounded-lg p-2"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          className="border rounded-lg p-2"
          value={filters.roomId}
          onChange={(e) => setFilters({ ...filters, roomId: e.target.value })}
        >
          <option value="">Room</option>
          {rooms.map((room) => (
            <option key={room._id} value={room._id}>
              {room.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border rounded-lg p-2"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
        />

        <input
          type="date"
          className="border rounded-lg p-2"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Apply Filters
        </button>
      </form>

      <div className="bg-white rounded-xl shadow p-5">
        {loading ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm">
                  <th className="py-2">Title</th>
                  <th>Room</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-t">
                    <td className="py-3 font-medium">{booking.title}</td>
                    <td>{booking.roomId?.name}</td>
                    <td>{booking.userId?.name}</td>
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
    </div>
  );
}

