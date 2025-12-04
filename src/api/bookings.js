import api from "./client";

export const createBooking = (payload) => api.post("/bookings", payload);

export const getMyBookings = () => api.get("/bookings/me");

export const getAllBookings = (params) => api.get("/bookings", { params });

export const cancelBooking = (id, reason) =>
  api.patch(`/bookings/${id}/cancel`, { reason });

export const deleteBooking = (id) => api.delete(`/bookings/${id}`);

export const getCalendarEvents = (params) =>
  api.get("/bookings/calendar/events", { params });


