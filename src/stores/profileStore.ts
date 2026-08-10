import { create } from "zustand";

interface ProfileState {
  language: string | null;
  culture: string | null;
  jobRole: string | null;
  setProfile: (p: { language: string; culture: string; jobRole: string }) => void;
  clearProfile: () => void;
}

// TODO(재웅/수민): /users 응답 스키마 확정 후 필드 맞추기
export const useProfileStore = create<ProfileState>((set) => ({
  language: null,
  culture: null,
  jobRole: null,
  setProfile: (p) => set(p),
  clearProfile: () => set({ language: null, culture: null, jobRole: null }),
}));
