import api from "./axiosInstance";

// BE 담당: 조수민 (/users/...)
export const userApi = {
  getProfile: () => api.get("/users/me"),
  updateProfile: (data: {
    nickname?: string;
    language?: string;
    culture?: string;
    job_role?: string;
    organization?: string;
  }) => api.patch("/users/me", data),
  withdraw: () => api.delete("/users/me"),
};