import { useEffect, useState } from "react";
import {
  createRoom,
  deleteRoom,
  fetchRooms,
  updateRoom,
} from "../api/rooms";

const initialForm = {
  name: "",
  capacity: 10,
  location: "",
  description: "",
  amenities: "",
};

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchRooms({ includeInactive: true });
      setRooms(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      amenities: form.amenities
        ? form.amenities.split(",").map((item) => item.trim())
        : [],
    };

    try {
      if (editingId) {
        await updateRoom(editingId, payload);
      } else {
        await createRoom(payload);
      }
      setForm(initialForm);
      setEditingId(null);
      await loadRooms();
      window.alert("Room saved successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save room");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (room) => {
    setEditingId(room._id);
    setForm({
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      description: room.description || "",
      amenities: room.amenities?.join(", ") || "",
    });
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm("Delete this room permanently?")) return;
    try {
      await deleteRoom(roomId);
      await loadRooms();
      window.alert("Room deleted successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete room");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Rooms</h1>
          <p className="text-gray-500">
            Create, update, or remove meeting rooms available for booking.
          </p>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-5 space-y-4 lg:col-span-1"
        >
          <h2 className="text-xl font-semibold mb-2">
            {editingId ? "Edit Room" : "Add Room"}
          </h2>

          <input
            type="text"
            placeholder="Room name"
            className="border rounded-lg w-full p-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            type="number"
            min="1"
            placeholder="Capacity"
            className="border rounded-lg w-full p-2"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            required
          />

          <input
            type="text"
            placeholder="Location"
            className="border rounded-lg w-full p-2"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <textarea
            placeholder="Description"
            className="border rounded-lg w-full p-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            type="text"
            placeholder="Amenities (comma separated)"
            className="border rounded-lg w-full p-2"
            value={form.amenities}
            onChange={(e) => setForm({ ...form, amenities: e.target.value })}
          />

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Update Room" : "Create Room"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
                className="text-gray-600 underline"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="lg:col-span-2 bg-white rounded-xl shadow p-5">
          <h2 className="text-xl font-semibold mb-4">Rooms</h2>

          {loading ? (
            <p>Loading rooms...</p>
          ) : rooms.length === 0 ? (
            <p className="text-gray-500">No rooms available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-sm">
                    <th className="py-2">Name</th>
                    <th>Capacity</th>
                    <th>Location</th>
                    <th>Amenities</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room._id} className="border-t">
                      <td className="py-3 font-medium">{room.name}</td>
                      <td>{room.capacity}</td>
                      <td>{room.location}</td>
                      <td className="text-sm text-gray-500">
                        {room.amenities?.join(", ") || "-"}
                      </td>
                      <td className="text-right space-x-3">
                        <button
                          className="text-blue-600"
                          onClick={() => handleEdit(room)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600"
                          onClick={() => handleDelete(room._id)}
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
    </div>
  );
}

