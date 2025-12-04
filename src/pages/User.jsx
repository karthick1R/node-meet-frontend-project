import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Layout from "../layout/Layout";
import axios from "axios";
import BookingModal from "../components/BookingModal";

export default function UserDashboard() {
  const [events, setEvents] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch user's bookings
  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings/my-bookings", {
        headers: { Authorization: "Bearer " + token }
      });

      const calendarEvents = res.data.map((b) => ({
        title: b.title,
        date: b.date.split("-").reverse().join("-"), // convert dd-mm-yyyy to yyyy-mm-dd
      }));

      setEvents(calendarEvents);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <Layout>
      <div className="flex justify-between mb-5 items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => setOpenModal(true)}
        >
          + New Booking
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Calendar</h2>

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height={600}
        />
      </div>

      {openModal && <BookingModal close={() => setOpenModal(false)} refresh={fetchBookings} />}
    </Layout>
  );
}
