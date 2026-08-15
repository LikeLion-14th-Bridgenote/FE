import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../apis/authApi";
import { userApi } from "../../apis/userApi";
import { useAuthStore } from "../../stores/authStore";

type Section = "profile" | "language" | "job" | "account";
type ConfirmModal = "logout" | "withdraw" | null;

const SECTIONS: { id: Section; label: string }[] = [
  { id: "profile", label: "프로필" },
  { id: "language", label: "언어 설정" },
  { id: "job", label: "직무 설정" },
  { id: "account", label: "계정 관리" },
];

const LANGUAGE_OPTIONS = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "vi", label: "Tiếng Việt" },
];

const CULTURE_OPTIONS = [
  { value: "KR", label: "대한민국" },
  { value: "VN", label: "베트남" },
  { value: "US", label: "미국" },
];

const JOB_OPTIONS = [
  { value: "pm", label: "기획 / PM" },
  { value: "dev_it", label: "개발 / IT" },
  { value: "design", label: "디자인" },
  { value: "data", label: "데이터 분석" },
  { value: "marketing", label: "마케팅 / 광고" },
];

const inputClass =
  "h-11 w-full rounded-lg border border-gray-200 bg-[#F1F3F2] px-3 text-sm text-gray-800 outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/10 disabled:cursor-default disabled:text-gray-500";

const IS_DEV_PREVIEW = import.meta.env.VITE_SKIP_AUTH === "true";

export default function MyPage() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.logout);
  const [section, setSection] = useState<Section>("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [modal, setModal] = useState<ConfirmModal>(null);
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(accessToken));
  const [isSaving, setIsSaving] = useState(false);

  const [nickname, setNickname] = useState(IS_DEV_PREVIEW ? "김재웅" : "");
  const [email, setEmail] = useState(IS_DEV_PREVIEW ? "jaewoong@bridgenote.team" : "");
  const [organization, setOrganization] = useState(IS_DEV_PREVIEW ? "LikeLion Bridgenote" : "");
  const [language, setLanguage] = useState("ko");
  const [culture, setCulture] = useState("KR");
  const [jobRole, setJobRole] = useState("pm");

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let isCancelled = false;

    const loadProfile = async () => {
      try {
        const { data } = await userApi.getProfile();
        if (isCancelled) return;

        setNickname(data.nickname);
        setEmail(data.email);
        setLanguage(data.language);
        setCulture(data.culture);
        setJobRole(data.job_role);
        setOrganization(data.organization ?? "");
      } catch {
        if (!isCancelled) {
          setToast("프로필 정보를 불러오지 못했어요.");
          window.setTimeout(() => setToast(""), 1800);
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    void loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [accessToken]);

  const handleSave = async () => {
    if (!accessToken) {
      setIsEditingProfile(false);
      showToast("변경사항을 미리보기에 반영했어요.");
      return;
    }

    setIsSaving(true);
    try {
      const payload =
        section === "profile"
          ? { nickname }
          : section === "language"
            ? { language }
            : {
                culture,
                job_role: jobRole,
                organization: organization.trim() || null,
              };

      const { data } = await userApi.updateProfile(payload);
      setNickname(data.nickname);
      setEmail(data.email);
      setLanguage(data.language);
      setCulture(data.culture);
      setJobRole(data.job_role);
      setOrganization(data.organization ?? "");
      setIsEditingProfile(false);
      showToast("변경사항을 저장했어요.");
    } catch {
      showToast("변경사항을 저장하지 못했어요.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSectionChange = (nextSection: Section) => {
    setSection(nextSection);
    setIsEditingProfile(false);
  };

  const handleConfirm = async () => {
    if (modal === "logout") {
      try {
        if (accessToken) await authApi.logout();
      } finally {
        clearAuth();
        setModal(null);
        navigate("/login");
      }
      return;
    }

    if (modal === "withdraw") {
      if (!accessToken) {
        setModal(null);
        showToast("개발 미리보기에서는 회원 탈퇴를 실행하지 않아요.");
        return;
      }

      setIsSaving(true);
      try {
        await userApi.withdraw();
        clearAuth();
        setModal(null);
        navigate("/");
      } catch {
        setModal(null);
        showToast("회원 탈퇴를 처리하지 못했어요.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:min-h-[640px] md:grid-cols-[190px_minmax(0,1fr)]">
        <aside className="flex flex-col border-b border-gray-100 p-3 md:border-b-0 md:border-r md:p-5">
          <h1 className="hidden px-3 pb-6 pt-2 text-base font-bold text-gray-900 underline decoration-primary decoration-2 underline-offset-8 md:block">
            마이페이지
          </h1>

          <nav className="grid grid-cols-2 gap-1.5 md:grid-cols-1" aria-label="마이페이지 메뉴">
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionChange(item.id)}
                aria-current={section === item.id ? "page" : undefined}
                className={`rounded-lg px-4 py-3 text-left text-sm transition-colors ${
                  section === item.id
                    ? "bg-[#E9EFF1] font-bold text-[#315766]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setModal("logout")}
            className="mt-auto hidden w-full border-t border-gray-100 px-4 pt-5 text-left text-sm text-gray-500 transition-colors hover:text-gray-800 md:block"
          >
            로그아웃
          </button>
        </aside>

        <main
          className="min-h-[560px] p-6 sm:p-8 md:min-h-0 md:px-14 md:py-12 lg:px-20"
          aria-busy={isLoading || isSaving}
        >
          {isLoading && (
            <p className="mb-5 text-sm text-gray-400">프로필 정보를 불러오는 중이에요.</p>
          )}
          {section === "profile" && (
            <section className="flex min-h-full flex-col">
              <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">프로필</h2>
                  <p className="mt-1.5 text-sm text-gray-400">
                    회의에서 사용할 기본 정보를 관리해요.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile((current) => !current)}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:border-primary hover:text-primary"
                >
                  {isEditingProfile ? "편집 취소" : "프로필 편집"}
                </button>
              </div>

              <div className="mb-7 flex items-center gap-4 border-b border-gray-100 pb-7">
                <div
                  className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-lg font-bold text-primary"
                  style={{ flex: "0 0 4rem" }}
                >
                  {nickname.trim().charAt(0) || "?"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900">{nickname}</p>
                  <p className="mt-1 break-all text-sm text-gray-400">{email}</p>
                </div>
              </div>

              <h3 className="mb-4 text-sm font-bold text-gray-800">기본 정보</h3>
              <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
                <label className="text-xs font-bold text-gray-700">
                  닉네임
                  <input
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    disabled={!isEditingProfile}
                    className={`${inputClass} mt-2`}
                  />
                </label>

                <label className="text-xs font-bold text-gray-700">
                  가입 이메일
                  <input value={email} disabled className={`${inputClass} mt-2`} />
                  <span className="mt-2 block font-medium text-gray-400">
                    가입 이메일은 변경할 수 없어요.
                  </span>
                </label>
              </div>

              {isEditingProfile && (
                <div className="mt-8 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSaving ? "저장 중..." : "변경사항 저장"}
                  </button>
                </div>
              )}
            </section>
          )}

          {section === "language" && (
            <section className="flex min-h-full flex-col">
              <div className="mb-12">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">언어 설정</h2>
                <p className="mt-1.5 text-sm text-gray-400">
                  변경된 설정은 다음 회의부터 기본값으로 적용돼요.
                </p>
              </div>

              <div className="max-w-xl space-y-7">
                <SelectField
                  id="native-language"
                  label="모국어 설정"
                  description="실시간 자막 번역과 회의록 표시 언어의 기본값으로 사용돼요."
                  value={language}
                  options={LANGUAGE_OPTIONS}
                  onChange={setLanguage}
                />
              </div>

              <SaveActions onSave={handleSave} isSaving={isSaving} />
            </section>
          )}

          {section === "job" && (
            <section className="flex min-h-full flex-col">
              <div className="mb-12">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">직무 설정</h2>
                <p className="mt-1.5 text-sm text-gray-400">
                  문화 각주와 직무별 회의록에 사용할 정보를 설정해요.
                </p>
              </div>

              <div className="grid w-full max-w-md gap-8">
                <SelectField
                  id="culture"
                  label="주 활동 문화권"
                  value={culture}
                  options={CULTURE_OPTIONS}
                  onChange={setCulture}
                />
                <label className="block text-xs font-bold text-gray-700">
                  소속 조직
                  <input
                    value={organization}
                    onChange={(event) => setOrganization(event.target.value)}
                    className={`${inputClass} mt-2`}
                  />
                </label>
                <SelectField
                  id="job-role"
                  label="직무"
                  value={jobRole}
                  options={JOB_OPTIONS}
                  onChange={setJobRole}
                />
              </div>

              <SaveActions onSave={handleSave} isSaving={isSaving} />
            </section>
          )}

          {section === "account" && (
            <section className="flex min-h-full flex-col">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">계정 관리</h2>
                <p className="mt-1.5 text-sm text-gray-400">
                  로그인 정보와 계정 상태를 관리해요.
                </p>
              </div>

              <div className="border-t border-gray-100">
                <AccountRow title="가입 이메일" description={email} />

                <AccountRow
                  title="로그아웃"
                  description="이 기기에서 현재 계정의 연결을 해제해요."
                  actionLabel="로그아웃"
                  onAction={() => setModal("logout")}
                />
                <AccountRow
                  title="회원 탈퇴"
                  description="계정과 관련 데이터를 삭제해요."
                  actionLabel="회원 탈퇴"
                  danger
                  onAction={() => setModal("withdraw")}
                />
              </div>
            </section>
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-40 rounded-xl bg-[#223C47] px-4 py-3 text-sm font-bold text-white shadow-lg">
          {toast}
        </div>
      )}

      {modal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-gray-900/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-xl">
            <h2 id="confirm-modal-title" className="text-xl font-bold text-gray-900">
              {modal === "logout" ? "로그아웃 하시겠어요?" : "정말 탈퇴하시겠어요?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              {modal === "logout"
                ? "이 기기에서 로그인 정보가 해제됩니다."
                : "프로필과 저장된 회의 정보가 삭제될 수 있으며, 이 작업은 되돌릴 수 없습니다."}
            </p>
            <div className="mt-7 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg px-4 py-2.5 text-sm font-bold text-gray-500"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSaving}
                className={`rounded-lg px-4 py-2.5 text-sm font-bold text-white ${
                  modal === "logout" ? "bg-primary" : "bg-accent"
                } disabled:cursor-wait disabled:opacity-60`}
              >
                {isSaving ? "처리 중..." : modal === "logout" ? "로그아웃" : "회원 탈퇴"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  description?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function SelectField({ id, label, description, value, options, onChange }: SelectFieldProps) {
  return (
    <label htmlFor={id} className="block text-xs font-bold text-gray-700">
      {label}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} mt-2`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {description && <span className="mt-2 block font-medium text-gray-400">{description}</span>}
    </label>
  );
}

function SaveActions({
  onSave,
  isSaving,
}: {
  onSave: () => void | Promise<void>;
  isSaving: boolean;
}) {
  return (
    <div className="mt-auto flex justify-end pt-12">
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="min-w-36 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
      >
        {isSaving ? "저장 중..." : "변경사항 저장"}
      </button>
    </div>
  );
}

interface AccountRowProps {
  title: string;
  description: string;
  actionLabel?: string;
  danger?: boolean;
  onAction?: () => void;
}

function AccountRow({ title, description, actionLabel, danger, onAction }: AccountRowProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 border-b border-gray-100 py-5 sm:flex-row sm:items-center">
      <div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <p className="mt-1 text-xs text-gray-400">{description}</p>
      </div>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className={`rounded-lg border px-4 py-2.5 text-sm font-bold transition-colors ${
            danger
              ? "border-accent/30 bg-accent/5 text-accent hover:bg-accent/10"
              : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
          }`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
