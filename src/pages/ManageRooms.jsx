import { useEffect, useRef, useState } from "react";
import {
  createRoom,
  deleteRoom,
  fetchRooms,
  updateRoom,
} from "../api/rooms";
import {
  Upload,
  X,
  Edit2,
  Trash2,
  Users,
  MapPin,
  Wifi,
  Tv,
  Coffee,
  Projector,
  Loader2,
  Building2,
  Camera,          // ← THIS WAS MISSING
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

const initialForm = {
  name: "",
  capacity: 10,
  location: "",
  description: "",
  amenities: "",
  image: null,
};

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const fileInputRef = useRef(null);

  const loadRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchRooms({ includeInactive: true });
      setRooms(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("capacity", form.capacity);
    formData.append("location", form.location);
    formData.append("description", form.description);
    if (form.amenities) {
      form.amenities
        .split(",")
        .map((a) => a.trim())
        .forEach((amenity) => formData.append("amenities[]", amenity));
    }
    if (form.image) formData.append("image", form.image);

    try {
      if (editingId) {
        await updateRoom(editingId, formData);
      } else {
        await createRoom(formData);
      }
      resetForm();
      await loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save room");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (room) => {
    setEditingId(room._id);
    setForm({
      name: room.name,
      capacity: room.capacity,
      location: room.location || "",
      description: room.description || "",
      amenities: room.amenities?.join(", ") || "",
      image: null,
    });
    setPreview(room.image ? `${BACKEND_URL}${room.image}` : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm("Delete this room permanently? This cannot be undone.")) return;
    try {
      await deleteRoom(roomId);
      await loadRooms();
    } catch (err) {
      setError("Failed to delete room");
    }
  };

  if (loading) return <RoomsSkeleton />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Manage Meeting Rooms</h1>
        <p className="text-gray-500 mt-2">
          Create, edit, or remove meeting rooms available for booking
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">
            {editingId ? "Edit Room" : "Add New Room"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Room Photo
            </label>
            <div className="flex items-center gap-6">
              <div
                onClick={() => fileInputRef.current.click()}
                className="relative cursor-pointer group"
              >
                <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center overflow-hidden">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Camera className="w-10 h-10 text-white" />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition"
                >
                  {preview ? "Change Photo" : "Upload Photo"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity
              </label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: Number(e.target.value) })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Floor 5, Building A"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities (comma separated)
              </label>
              <input
                type="text"
                value={form.amenities}
                onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                placeholder="WiFi, Projector, TV, Whiteboard"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-60 transition-all flex items-center gap-3"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{editingId ? "Update Room" : "Create Room"}</>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Rooms Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          All Meeting Rooms
        </h2>

        {rooms.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {rooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                onEdit={() => handleEdit(room)}
                onDelete={() => handleDelete(room._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Room Card ---------- */
function RoomCard({ room, onEdit, onDelete }) {
  const amenityIcons = {
    wifi: <Wifi className="w-4 h-4" />,
    projector: <Projector className="w-4 h-4" />,
    tv: <Tv className="w-4 h-4" />,
    whiteboard: <Coffee className="w-4 h-4" />,
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
      <div className="h-48 bg-gray-100 relative">
        {room.image ? (
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

        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button
            onClick={onEdit}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-blue-50 transition"
          >
            <Edit2 className="w-5 h-5 text-blue-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Capacity: {room.capacity} people</span>
          </div>
          {room.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{room.location}</span>
            </div>
          )}
        </div>

        {room.amenities && room.amenities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {room.amenities.slice(0, 4).map((amenity, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
              >
                {amenityIcons[amenity.toLowerCase()] || null}
                {amenity}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{room.amenities.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Skeleton & Empty State ---------- */
function RoomsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 bg-gray-200 rounded w-96"></div>
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
                <div className="h-12 bg-gray-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
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

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Building2 className="w-16 h-16 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-700 mb-3">
        No Rooms Created Yet
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Start by adding your first meeting room using the form above.
      </p>
    </div>
  );
}