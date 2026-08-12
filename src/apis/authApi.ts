import api from "./axiosInstance";

// BE 담당: 조수민 (/auth/...)
export const authApi = {
  signup: (data: {
    email: string;
    password: string;
    nickname: string;
    language: string;
    culture: string;
    job_role: string;
    organization?: string;
  }) => api.post("/auth/signup", data),

  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  logout: () => api.post("/auth/logout"),
};