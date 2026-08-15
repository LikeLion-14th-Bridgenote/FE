import api from "./axiosInstance";
import type { UserProfile, UserProfileUpdate } from "../types/user";

// BE 담당: 조수민 (/users/...)
export const userApi = {
  getProfile: () => api.get<UserProfile>("/users/me"),
  updateProfile: (data: UserProfileUpdate) =>
    api.patch<UserProfile>("/users/me", data),
  withdraw: () => api.delete("/users/me"),
};
