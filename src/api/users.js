import api from "./client";

export const createUser = (payload) => api.post("/users", payload);

export const getMe = () => api.get("/users/me");

export const updateMe = (payload) => api.put("/users/me", payload);

export const uploadLogo = (formData) =>
  api.put("/users/me/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });


