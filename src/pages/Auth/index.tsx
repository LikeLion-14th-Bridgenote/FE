import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { t } from "../../i18n";
import { useLangStore } from "../../stores/langStore";
import { useAuthStore } from "../../stores/authStore";
import { authApi } from "../../apis/authApi";

// 담당: 재웅 (주연이 먼저 초안 작업)
// 회원가입 폼에 모국어/문화권/직업/기관까지 포함되면서, /onboarding 페이지 제거됨
// 직업/문화권 value는 코드로 고정, 화면 표시만 언어별로 전환됨
// profileId는 authStore.setTokens 안에서 JWT의 sub 값으로 자동 세팅됨
// TODO: 비밀번호 규칙(최소 길이/특수문자 등) 백엔드 확인 후 프론트 유효성 검사 추가 필요

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

function getErrorStatus(err: unknown): number | undefined {
  if (typeof err === "object" && err !== null && "response" in err) {
    const res = (err as { response?: { status?: number } }).response;
    return res?.status;
  }
  return undefined;
}

export default function Auth() {
  const { lang } = useLangStore();
  const navigate = useNavigate();
  const { setTokens } = useAuthStore();
  const [mode, setMode] = useState<Mode>("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
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
    setLoginErrorMessage("");
    setLoginLoading(true);
    try {
      const res = await authApi.login(loginEmail, loginPw);
      setTokens(res.data.access_token, res.data.refresh_token);
      navigate("/dashboard");
    } catch (err) {
      setLoginError(true);
      const status = getErrorStatus(err);
      if (status === 401) {
        setLoginErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (status === 500) {
        setLoginErrorMessage("서버에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setLoginErrorMessage(t("auth.retryPassword", lang));
      }
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
        name: nickname,
        language,
        culture,
        job,
        organization: org || undefined,
      });
      const loginRes = await authApi.login(signupEmail, signupPw);
      setTokens(loginRes.data.access_token, loginRes.data.refresh_token);
      navigate("/dashboard");
    } catch (err) {
      const status = getErrorStatus(err);
      if (status === 409) {
        setSignupError("이미 가입된 이메일입니다. 로그인을 이용해주세요.");
      } else if (status === 400) {
        setSignupError("입력 정보를 다시 확인해주세요. (이메일 형식, 비밀번호 조건 등)");
      } else if (status === 500) {
        setSignupError("서버에 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setSignupError("회원가입 중 오류가 발생했습니다. 입력 정보를 확인해주세요.");
      }
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
              <div className="relative">
                <input
                  type={showLoginPw ? "text" : "password"}
                  value={loginPw}
                  onChange={(e) => setLoginPw(e.target.value)}
                  className={`w-full px-4 py-2.5 pr-12 border rounded-lg text-sm focus:outline-none ${
                    loginError ? "border-accent" : "border-gray-300 focus:border-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPw((current) => !current)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-400 transition-colors hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label={t(showLoginPw ? "auth.hidePassword" : "auth.showPassword", lang)}
                  aria-pressed={showLoginPw}
                >
                  {showLoginPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {loginError && (
                <p className="text-xs text-accent mt-1.5">{loginErrorMessage}</p>
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
              <p className="text-[11px] text-gray-400 mt-1">
                영문 대/소문자, 숫자, 특수문자를 조합해 8자 이상 입력해주세요.
              </p>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
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

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18M10.6 6.1A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.2 2.9M6.2 6.3C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6a10 10 0 0 0 4-.8M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
