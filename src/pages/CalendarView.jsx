import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getCalendarEvents } from "../api/bookings";
import { fetchRooms } from "../api/rooms";
import { Calendar, MapPin, Building2, Loader2 } from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Room color mapping
  const roomColors = {
    all: "#3B82F6",
  };

  // Load rooms + assign colors
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await fetchRooms();
        const roomList = res.data || [];
        setRooms(roomList);

        const colors = [
          "#8B5CF6", "#EC4899", "#10B981", "#F59E0B",
          "#EF4444", "#06B6D4", "#6366F1", "#14B8A6", "#F97316", "#84CC16"
        ];

        roomList.forEach((room, i) => {
          roomColors[room._id] = colors[i % colors.length];
        });
      } catch (err) {
        console.error("Failed to load rooms", err);
      }
    };
    loadRooms();
  }, []);

  // Load events
  const loadEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const params = selectedRoomId !== "all" ? { roomId: selectedRoomId } : {};
      const res = await getCalendarEvents(params);

      const formatted = res.data.map((booking) => {
        const room = rooms.find(r => r._id === booking.roomId) || {};
        const color = roomColors[booking.roomId] || roomColors.all;

        return {
          id: booking._id,
          title: booking.title,
          start: booking.startDateTime,
          end: booking.endDateTime,
          backgroundColor: color,
          borderColor: color,
          textColor: "white",
          extendedProps: {
            roomName: room.name || "Unknown Room",
            status: booking.status || "confirmed",
          },
        };
      });

      setEvents(formatted);
    } catch (err) {
      setError("Failed to load calendar events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rooms.length > 0 || selectedRoomId === "all") {
      loadEvents();
    }
  }, [selectedRoomId, rooms]);

  const handleRoomFilter = (roomId) => {
    setSelectedRoomId(roomId);
  };

  // Custom event display
  const eventContent = (eventInfo) => {
    const { roomName, status } = eventInfo.event.extendedProps;
    const isCancelled = status === "cancelled";

    return (
      <div className={`p-1.5 text-xs font-medium rounded ${isCancelled ? "opacity-70" : ""}`}>
        <div className="truncate font-bold">{eventInfo.event.title}</div>
        <div className="flex items-center gap-1 mt-1 opacity-90">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{roomName}</span>
        </div>
        {isCancelled && <div className="text-[10px] bg-red-600 text-white px-1 rounded mt-1">CANCELLED</div>}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-4">
          <Calendar className="w-11 h-11 text-blue-600" />
          Calendar View
        </h1>
        <p className="text-lg text-gray-600 mt-3">
          Real-time overview of all meeting room bookings
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Room Filter */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleRoomFilter("all")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            selectedRoomId === "all"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Rooms
        </button>
        {rooms.map((room) => (
          <button
            key={room._id}
            onClick={() => handleRoomFilter(room._id)}
            className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
              selectedRoomId === room._id ? "text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={{
              backgroundColor: selectedRoomId === room._id ? roomColors[room._id] : undefined,
            }}
          >
            <Building2 className="w-4 h-4" />
            {room.name}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading calendar...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700">No Bookings</h3>
            <p className="text-gray-500 mt-3">No events match your current filter</p>
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
            }}
            height="75vh"
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            weekends={true}
            nowIndicator={true}
            events={events}
            eventContent={eventContent}
            eventClassNames="cursor-pointer hover:z-10 hover:scale-105 transition-transform"
            dayHeaderClassNames="bg-gray-50 text-gray-700 font-semibold"
            slotLabelClassNames="text-gray-600"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: "08:00",
              endTime: "18:00",
            }}
          />
        )}
      </div>

      {/* Legend */}
      {rooms.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">Room Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {rooms.map((room) => (
              <div key={room._id} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full shadow-md"
                  style={{ backgroundColor: roomColors[room._id] }}
                />
                <span className="text-sm font-medium text-gray-700">{room.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}