import api from "./axiosInstance";

// BE 담당: 조수민 (/auth/...)
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  signup: (email: string, password: string) =>
    api.post("/auth/signup", { email, password }),
  logout: () => api.post("/auth/logout"),
  withdraw: () => api.delete("/auth/withdraw"),
};
