import { useEffect, useState } from "react";
import { fetchRooms } from "../api/rooms";
import BookingModal from "../components/BookingModal";
import {
  Users,
  MapPin,
  Wifi,
  Tv,
  Coffee,
  Projector,
  Phone,
  Building2,
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await fetchRooms();
        setRooms(res.data || []);
      } catch (err) {
        setError("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, []);

  const openBookingModal = (roomId) => {
    setSelectedRoomId(roomId);
    setShowBookingModal(true);
  };

  if (loading) return <RoomsSkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Meeting Rooms</h1>
        <p className="text-gray-500">
          Browse and book from our premium meeting spaces
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {rooms.map((room) => (
          <RoomCard
            key={room._id}
            room={room}
            onBook={() => openBookingModal(room._id)}
          />
        ))}
      </div>

      {/* ✅ Booking Modal */}
      {showBookingModal && (
        <BookingModal
          defaultRoomId={selectedRoomId}
          close={() => {
            setShowBookingModal(false);
            setSelectedRoomId(null);
          }}
        />
      )}
    </div>
  );
}

/* ✅ ROOM CARD */
function RoomCard({ room, onBook }) {
  const amenitiesIcons = {
    wifi: <Wifi className="w-4 h-4" />,
    projector: <Projector className="w-4 h-4" />,
    tv: <Tv className="w-4 h-4" />,
    "conference phone": <Phone className="w-4 h-4" />,
    coffee: <Coffee className="w-4 h-4" />,
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:-translate-y-2 transition">
      <div className="relative h-56">
        {room.image ? (
          <img
            src={`${BACKEND_URL}${room.image}`}
            className="w-full h-full object-cover"
            alt={room.name}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-200">
            <Building2 className="w-16 h-16 text-gray-400" />
          </div>
        )}

        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full flex items-center gap-2 shadow">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="font-bold">{room.capacity}</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold">{room.name}</h3>

        <div className="flex items-center gap-2 text-gray-600 mt-1">
          <MapPin size={14} />
          {room.location || "Location not set"}
        </div>

        {room.description && (
          <p className="text-gray-600 text-sm mt-3 line-clamp-2">
            {room.description}
          </p>
        )}

        {!!room.amenities?.length && (
          <div className="flex flex-wrap gap-2 mt-4">
            {room.amenities.slice(0, 4).map((a, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full flex gap-1 items-center"
              >
                {amenitiesIcons[a.toLowerCase()]}
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={onBook}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
        >
          Book This Room
        </button>
      </div>
    </div>
  );
}

/* ✅ Skeleton */
function RoomsSkeleton() {
  return <div className="h-64 bg-gray-200 animate-pulse rounded-xl" />;
}
