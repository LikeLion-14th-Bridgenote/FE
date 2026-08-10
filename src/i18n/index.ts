import ko from "./locales/ko.json";
import en from "./locales/en.json";
import vi from "./locales/vi.json";

// TODO(주연): 프로필 language 값과 연동, 각 페이지 텍스트는 페이지 담당자가
// 여기 딕셔너리에 키를 추가하고 t("key") 형태로 사용
const dict = { ko, en, vi } as const;
type Lang = keyof typeof dict;

export function t(key: string, lang: Lang = "ko"): string {
  return (dict[lang] as Record<string, string>)[key] ?? key;
}
