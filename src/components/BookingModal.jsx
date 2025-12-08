import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchRooms } from "../api/rooms";
import { createBooking } from "../api/bookings";

const initialForm = {
  roomId: "",
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  attendees: "",
  recurrence: {
    isRecurring: false,
    pattern: "daily",
    interval: 1,
    endDate: "",
  },
};

export default function BookingModal({
  close,
  refresh,
  defaultRoomId = null,
}) {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  /* ✅ Load rooms */
  useEffect(() => {
    fetchRooms()
      .then((res) => setRooms(res.data || []))
      .catch(() => {
        Swal.fire("Error", "Unable to load rooms", "error");
      });
  }, []);

  /* ✅ Preselect room when opened from Rooms page */
  useEffect(() => {
    if (defaultRoomId) {
      setForm((prev) => ({ ...prev, roomId: defaultRoomId }));
    }
  }, [defaultRoomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.roomId || !form.title || !form.date || !form.startTime || !form.endTime) {
      Swal.fire("Missing fields", "Please fill all required fields", "warning");
      return;
    }

    const payload = {
      roomId: form.roomId,
      title: form.title,
      description: form.description,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      attendees: form.attendees
        ? form.attendees.split(",").map((v) => v.trim())
        : [],
    };

    if (form.recurrence.isRecurring) {
      payload.recurrence = {
        isRecurring: true,
        pattern: form.recurrence.pattern,
        interval: Number(form.recurrence.interval),
        endDate: form.recurrence.endDate,
      };
    }

    try {
      setSaving(true);

      await createBooking(payload);

      /* ✅ SUCCESS POPUP */
      Swal.fire({
        icon: "success",
        title: "Booking Created",
        text: "Your meeting has been booked successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      setForm(initialForm);
      refresh?.();
      close(); // ✅ close only after success
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Error creating booking",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Booking</h2>
          <button onClick={close} className="text-2xl">&times;</button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <select
            className="w-full border p-2 rounded"
            value={form.roomId}
            onChange={(e) => setForm({ ...form, roomId: e.target.value })}
            required
          >
            <option value="">Select room</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Title"
            className="w-full border p-2 rounded"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <textarea
            placeholder="Description"
            className="w-full border p-2 rounded"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <input
              type="time"
              className="border p-2 rounded w-full"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />
            <input
              type="time"
              className="border p-2 rounded w-full"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              required
            />
          </div>

          <input
            type="text"
            placeholder="Attendees (comma separated emails)"
            className="w-full border p-2 rounded"
            value={form.attendees}
            onChange={(e) => setForm({ ...form, attendees: e.target.value })}
          />

          {/* ✅ Recurrence */}
          <div className="border rounded-lg p-4">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={form.recurrence.isRecurring}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    recurrence: {
                      ...prev.recurrence,
                      isRecurring: e.target.checked,
                    },
                  }))
                }
              />
              <span>Recurring booking</span>
            </label>

            {form.recurrence.isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  className="border rounded p-2"
                  value={form.recurrence.pattern}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      recurrence: {
                        ...prev.recurrence,
                        pattern: e.target.value,
                      },
                    }))
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>

                <input
                  type="number"
                  min="1"
                  className="border rounded p-2"
                  value={form.recurrence.interval}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      recurrence: {
                        ...prev.recurrence,
                        interval: e.target.value,
                      },
                    }))
                  }
                />

                <input
                  type="date"
                  className="border rounded p-2"
                  value={form.recurrence.endDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      recurrence: {
                        ...prev.recurrence,
                        endDate: e.target.value,
                      },
                    }))
                  }
                  required
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Close
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
