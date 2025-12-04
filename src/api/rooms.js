import api from "./client";

export const fetchRooms = (params) => api.get("/rooms", { params });

export const createRoom = (payload) => api.post("/rooms", payload);

export const updateRoom = (id, payload) => api.put(`/rooms/${id}`, payload);

export const deleteRoom = (id) => api.delete(`/rooms/${id}`);


