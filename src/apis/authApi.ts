import api from "./axiosInstance";

interface LoginResponse {
  user_id: number;
  access_token: string;
  refresh_token: string;
}

interface SignupResponse {
  id: string;
  email: string;
  nickname: string;
  language: string | null;
  culture: string | null;
  job: string | null;
  organization: string | null;
  created_at: string;
}

interface MessageResponse {
  message: string;
}

// BE 담당: 조수민 (/auth/...)
export const authApi = {
  signup: (data: {
    email: string;
    password: string;
    nickname: string;
    language: string;
    culture: string;
    job: string;
    organization?: string;
  }) => api.post<SignupResponse>("/auth/signup", data),

  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { email, password }),

  logout: () => api.post<MessageResponse>("/auth/logout"),
};