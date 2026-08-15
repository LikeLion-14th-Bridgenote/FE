import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { t } from "../../i18n";
import { useLangStore } from "../../stores/langStore";
import { useAuthStore } from "../../stores/authStore";
import { authApi } from "../../apis/authApi";

// 담당: 재웅 (주연이 먼저 초안 작업)
// 회원가입 폼에 모국어/문화권/직업/기관까지 포함되면서, /onboarding 페이지 제거됨
// 직업/문화권 value는 코드로 고정, 화면 표시만 언어별로 전환됨

type Mode = "login" | "signup";

const JOB_OPTIONS = [
  { code: "dev_it", ko: "개발/IT", en: "Development/IT", vi: "Phát triển/CNTT" },
  { code: "design", ko: "디자인", en: "Design", vi: "Thiết kế" },
  { code: "data", ko: "데이터 분석", en: "Data Analysis", vi: "Phân tích dữ liệu" },
  { code: "marketing", ko: "마케팅/광고", en: "Marketing/Advertising", vi: "Marketing/Quảng cáo" },
  { code: "sales", ko: "영업/사업개발", en: "Sales/Biz Dev", vi: "Kinh doanh/Phát triển" },
  { code: "pm", ko: "기획/PM", en: "Planning/PM", vi: "Hoạch định/PM" },
  { code: "hr", ko: "인사/조직", en: "HR/Org", vi: "Nhân sự/Tổ chức" },
  { code: "finance", ko: "재무/회계", en: "Finance/Accounting", vi: "Tài chính/Kế toán" },
  { code: "legal", ko: "법무", en: "Legal", vi: "Pháp lý" },
  { code: "research", ko: "연구", en: "Research", vi: "Nghiên cứu" },
  { code: "operations", ko: "생산/운영", en: "Production/Operations", vi: "Sản xuất/Vận hành" },
  { code: "medical", ko: "의료/보건", en: "Medical/Health", vi: "Y tế/Sức khỏe" },
  { code: "education", ko: "교육", en: "Education", vi: "Giáo dục" },
  { code: "public", ko: "공공행정", en: "Public Administration", vi: "Hành chính công" },
  { code: "management", ko: "경영관리", en: "Management", vi: "Quản lý" },
  { code: "student", ko: "학생", en: "Student", vi: "Học sinh/Sinh viên" },
  { code: "etc", ko: "기타", en: "Other", vi: "Khác" },
] as const;

const CULTURE_OPTIONS = [
  { code: "KR", ko: "대한민국", en: "South Korea", vi: "Hàn Quốc" },
  { code: "VN", ko: "베트남", en: "Vietnam", vi: "Việt Nam" },
  { code: "CN", ko: "중국", en: "China", vi: "Trung Quốc" },
  { code: "US", ko: "미국", en: "United States", vi: "Hoa Kỳ" },
] as const;

export default function Auth() {
  const { lang } = useLangStore();
  const navigate = useNavigate();
  const { setTokens, setProfileId } = useAuthStore();
  const [mode, setMode] = useState<Mode>("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const [nickname, setNickname] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPw, setSignupPw] = useState("");
  const [language, setLanguage] = useState("");
  const [culture, setCulture] = useState("");
  const [job, setJob] = useState("");
  const [org, setOrg] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(false);
    setLoginLoading(true);
    try {
      const res = await authApi.login(loginEmail, loginPw);
      setTokens(res.data.access_token, res.data.refresh_token);
      setProfileId(res.data.user.id);
      navigate("/dashboard");
    } catch (e) {
      setLoginError(true);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setSignupLoading(true);
    try {
      await authApi.signup({
        email: signupEmail,
        password: signupPw,
        nickname,
        language,
        culture,
        job,
        organization: org || undefined,
      });
      // 회원가입 응답엔 토큰이 없어서, 가입 직후 로그인 API 한 번 더 호출
      const loginRes = await authApi.login(signupEmail, signupPw);
      setTokens(loginRes.data.access_token, loginRes.data.refresh_token);
      setProfileId(loginRes.data.user.id);
      navigate("/dashboard");
    } catch (e) {
      setSignupError("회원가입 중 오류가 발생했습니다. 입력 정보를 확인해주세요.");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDECE6] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 md:p-10">
        <div className="flex flex-col items-center gap-2 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "login" ? t("common.login", lang) : t("common.signup", lang)}
          </h1>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1.5">
                {t("auth.email", lang)}
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1.5">
                {t("auth.password", lang)}
              </label>
              <input
                type="password"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none ${
                  loginError ? "border-accent" : "border-gray-300 focus:border-primary"
                }`}
              />
              {loginError && (
                <p className="text-xs text-accent mt-1.5">{t("auth.retryPassword", lang)}</p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 text-sm text-gray-500 text-right">
              {t("auth.noAccount", lang)}{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="underline text-gray-800 font-medium"
              >
                {t("common.signup", lang)}
              </button>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="mt-2 w-full py-3 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loginLoading ? "로그인 중..." : t("common.login", lang)}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1.5">
                {t("auth.nickname", lang)}
              </label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1.5">
                {t("auth.email", lang)}
              </label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1.5">
                {t("auth.password", lang)}
              </label>
              <input
                type="password"
                value={signupPw}
                onChange={(e) => setSignupPw(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-800 mb-4">
                {t("auth.selectInfo", lang)}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-semibold text-gray-800 block mb-0.5">
                    {t("auth.motherTongue", lang)}
                  </label>
                  <p className="text-[11px] text-gray-400 mb-1.5 min-h-[28px]">
                    {t("auth.motherTongueDesc", lang)}
                  </p>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">{t("auth.select", lang)}</option>
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-800 block mb-0.5">
                    {t("auth.job", lang)}
                  </label>
                  <p className="text-[11px] text-gray-400 mb-1.5 min-h-[28px]"></p>
                  <select
                    value={job}
                    onChange={(e) => setJob(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">{t("auth.select", lang)}</option>
                    {JOB_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>{opt[lang]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-800 block mb-0.5">
                    {t("auth.culture", lang)}
                  </label>
                  <p className="text-[11px] text-gray-400 mb-1.5 min-h-[28px]">
                    {t("auth.cultureDesc", lang)}
                  </p>
                  <select
                    value={culture}
                    onChange={(e) => setCulture(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">{t("auth.select", lang)}</option>
                    {CULTURE_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>{opt[lang]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-800 block mb-0.5">
                    {t("auth.org", lang)}
                  </label>
                  <p className="text-[11px] text-gray-400 mb-1.5 min-h-[28px]">
                    {t("auth.orgDesc", lang)}
                  </p>
                  <input
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {signupError && <p className="text-xs text-accent">{signupError}</p>}

            <button
              type="submit"
              disabled={signupLoading}
              className="mt-2 w-full py-3 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {signupLoading ? "가입 중..." : t("common.signup", lang)}
            </button>

            <p className="text-xs text-gray-400 text-center">
              {t("auth.hasAccount", lang)}{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="underline text-gray-600"
              >
                {t("common.login", lang)}
              </button>
            </p>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">
            {t("auth.backHome", lang)}
          </Link>
        </div>
      </div>
    </div>
  );
}