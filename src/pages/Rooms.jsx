import { useEffect, useState } from "react";
import { fetchRooms } from "../api/rooms";

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
        setRooms(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  if (loading) return <p>Loading rooms...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Rooms</h1>
          <p className="text-gray-500">
            Browse available meeting rooms and their capabilities.
          </p>
        </div>
      </div>

      {rooms.length === 0 ? (
        <p className="text-gray-500">No rooms have been created yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room._id} className="bg-white rounded-xl shadow p-5">
              <h2 className="text-xl font-semibold">{room.name}</h2>
              <p className="text-gray-500">{room.location}</p>

              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <p>Capacity: {room.capacity}</p>
                {room.description && <p>{room.description}</p>}
                {room.amenities?.length > 0 && (
                  <p>Amenities: {room.amenities.join(", ")}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


