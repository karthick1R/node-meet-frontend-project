import { useEffect, useState } from "react";
import { fetchRooms } from "../api/rooms";
import {
  Users,
  MapPin,
  Wifi,
  Tv,
  Coffee,
  Projector,
  Phone,
  Loader2,
  Building2,
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchRooms();
        setRooms(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, []);

  if (loading) return <RoomsSkeleton />;
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
        {error}
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meeting Rooms</h1>
        <p className="text-gray-500 mt-2">
          Browse and book from our premium meeting spaces
        </p>
      </div>

      {/* Rooms Grid */}
      {rooms.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {rooms.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}

// Premium Room Card
function RoomCard({ room }) {
  const amenitiesIcons = {
    wifi: <Wifi className="w-4 h-4" />,
    projector: <Projector className="w-4 h-4" />,
    tv: <Tv className="w-4 h-4" />,
    "conference phone": <Phone className="w-4 h-4" />,
    whiteboard: <Coffee className="w-4 h-4" />,
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
      {/* Room Image */}
      <div className="relative h-56 bg-gray-100">
        {room.image ? (
          <img
            src={`${BACKEND_URL}${room.image}`}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Building2 className="w-20 h-20 text-gray-400" />
          </div>
        )}
        {/* Capacity Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-gray-800">{room.capacity}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.name}</h3>
        
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">{room.location || "Location not set"}</span>
        </div>

        {room.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-5">
            {room.description}
          </p>
        )}

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {room.amenities.slice(0, 4).map((amenity, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
              >
                {amenitiesIcons[amenity.toLowerCase()] || null}
                {amenity}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{room.amenities.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
          Book This Room
        </button>
      </div>
    </div>
  );
}

// Loading Skeleton
function RoomsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-64"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-56 bg-gray-200"></div>
            <div className="p-6 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Building2 className="w-16 h-16 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-700 mb-3">
        No Meeting Rooms Available
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        There are currently no meeting rooms configured. Please contact your administrator to add rooms.
      </p>
    </div>
  );
}