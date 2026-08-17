import { create } from "zustand";

function decodeJwtSub(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  profileId: string | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string) => void;
  setProfileId: (id: string) => void;
  logout: () => void;
}

// TODO(재웅/수민): 토큰 저장 방식(localStorage vs 메모리) 최종 확정 후 반영
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  profileId: null,
  isAuthenticated: false,
  setTokens: (access, refresh) => {
    const sub = decodeJwtSub(access);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true, profileId: sub });
  },
  setProfileId: (id) => set({ profileId: id }),
  logout: () =>
    set({ accessToken: null, refreshToken: null, profileId: null, isAuthenticated: false }),
}));