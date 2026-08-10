import api from "./axiosInstance";

// BE 담당: 조수민 (/users/...)
export const userApi = {
  getProfile: () => api.get("/users/me"),
  updateProfile: (data: { language: string; culture: string; jobRole: string; org?: string }) =>
    api.patch("/users/me", data),
};
