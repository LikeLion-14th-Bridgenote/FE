import { Link } from "react-router-dom";
import { useState } from "react";
import { t } from "../../i18n";
import { useLangStore } from "../../stores/langStore";
import logo from "../../assets/logo_2.png";
import globe from "../../assets/globe.png";
import magnifier from "../../assets/magnifier.png";

// 담당: 주연

const GLOBE_TAGS: { label: string; top: string; left: string; align: "left" | "right" }[] = [
  { label: "한국어", top: "20%", left: "74%", align: "left" },
  { label: "Tiếng Việt", top: "54%", left: "-20%", align: "right" },
  { label: "English", top: "70%", left: "80%", align: "left" },
];

function FocusMarker() {
  return (
    <div className="fixed focus-float pointer-events-none select-none z-30">
      <div className="relative w-20 h-20 md:w-28 md:h-28">
        <span className="absolute top-0 left-0 w-5 h-5 md:w-6 md:h-6 border-t-2 border-l-2 border-gray-700" />
        <span className="absolute top-0 right-0 w-5 h-5 md:w-6 md:h-6 border-t-2 border-r-2 border-gray-700" />
        <span className="absolute bottom-0 left-0 w-5 h-5 md:w-6 md:h-6 border-b-2 border-l-2 border-gray-700" />
        <span className="absolute bottom-0 right-0 w-5 h-5 md:w-6 md:h-6 border-b-2 border-r-2 border-gray-700" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-800 text-lg md:text-xl leading-none">
          +
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const { lang, setLang } = useLangStore();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#EDECE6] overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-[160px] md:h-[240px] bg-[#3A6478]" />

      {/* 상단 버튼: 로그인 / 언어 선택 */}
      <div className="absolute top-5 right-5 md:top-8 md:right-8 flex items-center gap-2 md:gap-3 z-20">
        <Link
          to="/login"
          className="px-3.5 md:px-5 py-1.5 md:py-2 rounded-full bg-white text-xs md:text-sm font-medium text-gray-800 shadow-sm"
        >
          {t("common.login", lang)}
        </Link>
        <div className="relative">
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white text-xs md:text-sm font-medium text-gray-800 shadow-sm flex items-center gap-1.5"
          >
            🌐 <span className="hidden sm:inline">language</span> <span className="text-xs">⌄</span>
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
              <button
                onClick={() => { setLang("ko"); setLangOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${lang === "ko" ? "font-semibold text-primary" : "text-gray-600"}`}
              >
                한국어
              </button>
              <button
                onClick={() => { setLang("en"); setLangOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${lang === "en" ? "font-semibold text-primary" : "text-gray-600"}`}
              >
                English
              </button>
              <button
                onClick={() => { setLang("vi"); setLangOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${lang === "vi" ? "font-semibold text-primary" : "text-gray-600"}`}
              >
                Tiếng Việt
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 로고 + 워드마크 + 태그라인 */}
      <div className="flex flex-col items-center gap-2 md:gap-3 pt-20 md:pt-16 px-4 relative z-10">
        <img src={logo} alt="Bridgenote logo" className="w-14 h-14 md:w-16 md:h-16 object-contain" />
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">bridgenote</h1>
        <p className="text-[10px] md:text-sm text-gray-500 whitespace-nowrap">
          Context Beyond Words.
        </p>
      </div>

      {/* 지구본 + 언어 태그 */}
      <div className="relative w-[280px] md:w-[420px] mx-auto mt-4 md:mt-6 z-10">
        <img src={globe} alt="Bridgenote globe" className="w-full h-auto" />
        {GLOBE_TAGS.map((tag) => (
          <div
            key={tag.label}
            className={`absolute flex items-center gap-1.5 md:gap-2 text-[11px] md:text-sm text-gray-800 ${tag.align === "right" ? "flex-row-reverse" : ""}`}
            style={{ top: tag.top, left: tag.left }}
          >
            <span className="h-px w-6 md:w-10 border-t-2 border-dotted border-gray-800" />
            <span className="bg-white/70 px-1.5 py-0.5 rounded">{tag.label}</span>
          </div>
        ))}
      </div>

      <img
        src={magnifier}
        alt=""
        className="absolute right-[8%] md:right-[12%] bottom-0 w-50 md:w-120 h-auto z-20"
      />

      <FocusMarker />

      <style>{`
        @keyframes driftFocus {
          0%   { top: 15%; left: 10%; }
          20%  { top: 25%; left: 75%; }
          40%  { top: 65%; left: 82%; }
          60%  { top: 78%; left: 18%; }
          80%  { top: 40%; left: 45%; }
          100% { top: 15%; left: 10%; }
        }
        .focus-float {
          animation: driftFocus 26s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}