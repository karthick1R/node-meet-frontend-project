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
  Camera,
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
    try {
      const res = await fetchRooms({ includeInactive: true });
      setRooms(res.data || []);
    } catch (err) {
      setError("Failed to load rooms");
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
      form.amenities.split(",").map(a => a.trim()).forEach(a => formData.append("amenities[]", a));
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room permanently?")) return;
    try {
      await deleteRoom(id);
      await loadRooms();
    } catch (err) {
      setError("Failed to delete");
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Manage Meeting Rooms</h1>
        <p className="text-gray-600 mt-2">Add, edit, or remove meeting rooms</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl">{error}</div>}

      {/* Form */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-t-3xl">
          <h2 className="text-2xl font-bold text-white">{editingId ? "Edit Room" : "Add New Room"}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex items-center gap-8">
            <div
              onClick={() => fileInputRef.current.click()}
              className="relative cursor-pointer group"
            >
              <div className="w-40 h-40 bg-gray-100 border-4 border-dashed border-gray-300 rounded-3xl overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Upload className="w-12 h-12" />
                    <span className="mt-2 text-sm">Click to upload</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-3xl">
                <Camera className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <button type="button" onClick={() => fileInputRef.current.click()} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium">
                {preview ? "Change Image" : "Upload Room Image"}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <input type="text" placeholder="Room Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="px-5 py-4 border rounded-xl focus:ring-4 focus:ring-blue-500/20" />
            <input type="number" placeholder="Capacity" value={form.capacity} onChange={e => setForm({...form, capacity: +e.target.value})} required className="px-5 py-4 border rounded-xl" />
            <input type="text" placeholder="Location (e.g. Floor 5)" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="px-5 py-4 border rounded-xl" />
            <input type="text" placeholder="Amenities (comma separated)" value={form.amenities} onChange={e => setForm({...form, amenities: e.target.value})} className="px-5 py-4 border rounded-xl" />
          </div>

          <textarea rows={3} placeholder="Description (optional)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-5 py-4 border rounded-xl" />

          <div className="flex gap-4">
            <button type="submit" disabled={saving} className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl disabled:opacity-60 flex items-center gap-3">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {editingId ? "Update Room" : "Create Room"}
            </button>
            {editingId && <button type="button" onClick={resetForm} className="px-6 py-4 border rounded-xl hover:bg-gray-50">Cancel</button>}
          </div>
        </form>
      </div>

      {/* Rooms Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">All Rooms</h2>
        {rooms.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No rooms yet. Create one above!</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {rooms.map(room => (
              <div key={room._id} className="bg-white rounded-2xl shadow-lg overflow-hidden group">
                {room.image ? (
                  <img src={`${BACKEND_URL}${room.image}`} alt={room.name} className="w-full h-56 object-cover" />
                ) : (
                  <div className="h-56 bg-gray-200 flex items-center justify-center">
                    <Building2 className="w-20 h-20 text-gray-400" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold">{room.name}</h3>
                  <p className="text-gray-600 mt-1">{room.location}</p>
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => handleEdit(room)} className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => handleDelete(room._id)} className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}