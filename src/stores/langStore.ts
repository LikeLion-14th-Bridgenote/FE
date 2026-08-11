import { create } from "zustand";

type Lang = "ko" | "en" | "vi";

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

// 페이지 간 공유되는 UI 언어 설정 (로그인 여부와 무관, 프로필의 언어와는 다른 개념)
export const useLangStore = create<LangState>((set) => ({
  lang: "ko",
  setLang: (lang) => set({ lang }),
}));