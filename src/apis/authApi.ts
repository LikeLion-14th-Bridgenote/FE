import api from "./axiosInstance";

interface AuthUserSummary {
  id: string;
  email: string;
  nickname: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  user: AuthUserSummary;
}

interface SignupResponse {
  id: string;
  email: string;
  nickname: string;
  language: string | null;
  culture: string | null;
  job_role: string | null;
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
    job_role: string;
    organization?: string;
  }) => api.post<SignupResponse>("/auth/signup", data),

  login: (email: string, password: string) =>
    api.post<LoginResponse>("/auth/login", { email, password }),

  logout: () => api.post<MessageResponse>("/auth/logout"),
};
