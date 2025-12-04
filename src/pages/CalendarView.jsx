import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getCalendarEvents } from "../api/bookings";
import { fetchRooms } from "../api/rooms";

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ roomId: "" });
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.roomId) params.roomId = filters.roomId;
      const res = await getCalendarEvents(params);
      setEvents(
        res.data.map((event) => ({
          ...event,
          start: event.start,
          end: event.end,
          title: `${event.title} (${event.room})`,
        }))
      );
    } catch (err) {
      console.error("Calendar error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

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

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-gray-500">
            Real-time view of all bookings with room-level filtering.
          </p>
        </div>

        <select
          className="border rounded-lg p-2"
          value={filters.roomId}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, roomId: e.target.value }))
          }
        >
          <option value="">All rooms</option>
          {rooms.map((room) => (
            <option key={room._id} value={room._id}>
              {room.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <p>Loading calendar...</p>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            weekends
            height="auto"
            events={events}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
          />
        )}
      </div>
    </div>
  );
}


