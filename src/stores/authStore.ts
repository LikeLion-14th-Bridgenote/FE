import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

// TODO(재웅/수민): 토큰 저장 방식(localStorage vs 메모리) 최종 확정 후 반영
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  setToken: (token) => set({ accessToken: token, isAuthenticated: true }),
  logout: () => set({ accessToken: null, isAuthenticated: false }),
}));
