import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
}

// TODO(재웅/수민): 토큰 저장 방식(localStorage vs 메모리) 최종 확정 후 반영
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  setTokens: (access, refresh) =>
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),
  logout: () => set({ accessToken: null, refreshToken: null, isAuthenticated: false }),
}));