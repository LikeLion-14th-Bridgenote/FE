import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../apis/authApi";
import { userApi } from "../../apis/userApi";
import { t } from "../../i18n";
import { useAuthStore } from "../../stores/authStore";
import { useLangStore } from "../../stores/langStore";

type Section = "profile" | "language" | "job" | "account";
type ConfirmModal = "logout" | "withdraw" | null;

const SECTIONS: { id: Section; labelKey: string }[] = [
  { id: "profile", labelKey: "mypage.section.profile" },
  { id: "language", labelKey: "mypage.section.language" },
  { id: "job", labelKey: "mypage.section.job" },
  { id: "account", labelKey: "mypage.section.account" },
];

const LANGUAGE_OPTIONS = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "vi", label: "Tiếng Việt" },
];

const CULTURE_OPTIONS = [
  { value: "KR", labelKey: "mypage.option.culture.kr" },
  { value: "VN", labelKey: "mypage.option.culture.vn" },
  { value: "US", labelKey: "mypage.option.culture.us" },
];

const JOB_OPTIONS = [
  { value: "pm", labelKey: "mypage.option.job.pm" },
  { value: "dev_it", labelKey: "mypage.option.job.dev" },
  { value: "design", labelKey: "mypage.option.job.design" },
  { value: "data", labelKey: "mypage.option.job.data" },
  { value: "marketing", labelKey: "mypage.option.job.marketing" },
];

const inputClass =
  "h-11 w-full rounded-lg border border-gray-200 bg-[#F1F3F2] px-3 text-sm text-gray-800 outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/10 disabled:cursor-default disabled:text-gray-500";

const IS_DEV_PREVIEW = import.meta.env.VITE_SKIP_AUTH === "true";

export default function MyPage() {
  const navigate = useNavigate();
  const { lang, setLang } = useLangStore();
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
  const [language, setLanguage] = useState(lang);
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

        setNickname(data.name);
        setEmail(data.email);
        const profileLanguage = data.language === "en" || data.language === "vi" ? data.language : "ko";
        setLanguage(profileLanguage);
        setLang(profileLanguage);
        setCulture(data.culture);
        setJobRole(data.job);
        setOrganization(data.organization ?? "");
      } catch {
        if (!isCancelled) {
          setToast(t("mypage.toast.loadError", useLangStore.getState().lang));
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
  }, [accessToken, setLang]);

  const handleLanguageChange = (nextLanguage: string) => {
    const nextLang = nextLanguage === "en" || nextLanguage === "vi" ? nextLanguage : "ko";
    setLanguage(nextLang);
    setLang(nextLang);
  };

  const handleSave = async () => {
    if (!accessToken) {
      setIsEditingProfile(false);
      showToast(t("mypage.toast.previewSaved", lang));
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
                job: jobRole,
                organization: organization.trim() || null,
              };

      const { data } = await userApi.updateProfile(payload);
      setNickname(data.name);
      setEmail(data.email);
      const savedLanguage = data.language === "en" || data.language === "vi" ? data.language : "ko";
      setLanguage(savedLanguage);
      setLang(savedLanguage);
      setCulture(data.culture);
      setJobRole(data.job);
      setOrganization(data.organization ?? "");
      setIsEditingProfile(false);
      showToast(t("mypage.toast.saved", lang));
    } catch {
      showToast(t("mypage.toast.saveError", lang));
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
        showToast(t("mypage.toast.previewWithdraw", lang));
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
        showToast(t("mypage.toast.withdrawError", lang));
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
            {t("nav.mypage", lang)}
          </h1>

          <nav className="grid grid-cols-2 gap-1.5 md:grid-cols-1" aria-label={t("mypage.menuLabel", lang)}>
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
                {t(item.labelKey, lang)}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setModal("logout")}
            className="mt-auto hidden w-full border-t border-gray-100 px-4 pt-5 text-left text-sm text-gray-500 transition-colors hover:text-gray-800 md:block"
          >
            {t("mypage.logout", lang)}
          </button>
        </aside>

        <main
          className="min-h-[560px] p-6 sm:p-8 md:min-h-0 md:px-14 md:py-12 lg:px-20"
          aria-busy={isLoading || isSaving}
        >
          {isLoading && (
            <p className="mb-5 text-sm text-gray-400">{t("mypage.loading", lang)}</p>
          )}
          {section === "profile" && (
            <section className="flex min-h-full flex-col">
              <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t("mypage.profile.title", lang)}</h2>
                  <p className="mt-1.5 text-sm text-gray-400">
                    {t("mypage.profile.description", lang)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile((current) => !current)}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:border-primary hover:text-primary"
                >
                  {isEditingProfile ? t("mypage.profile.cancelEdit", lang) : t("mypage.profile.edit", lang)}
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

              <h3 className="mb-4 text-sm font-bold text-gray-800">{t("mypage.profile.basicInfo", lang)}</h3>
              <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
                <label className="text-xs font-bold text-gray-700">
                  {t("mypage.profile.nickname", lang)}
                  <input
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    disabled={!isEditingProfile}
                    className={`${inputClass} mt-2`}
                  />
                </label>

                <label className="text-xs font-bold text-gray-700">
                  {t("mypage.account.email", lang)}
                  <input value={email} disabled className={`${inputClass} mt-2`} />
                  <span className="mt-2 block font-medium text-gray-400">
                    {t("mypage.profile.emailReadonly", lang)}
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
                    {t("mypage.cancel", lang)}
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSaving ? t("mypage.saving", lang) : t("mypage.save", lang)}
                  </button>
                </div>
              )}
            </section>
          )}

          {section === "language" && (
            <section className="flex min-h-full flex-col">
              <div className="mb-12">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t("mypage.language.title", lang)}</h2>
                <p className="mt-1.5 text-sm text-gray-400">
                  {t("mypage.language.description", lang)}
                </p>
              </div>

              <div className="max-w-xl space-y-7">
                <SelectField
                  id="native-language"
                  label={t("mypage.language.native", lang)}
                  description={t("mypage.language.nativeDescription", lang)}
                  value={language}
                  options={LANGUAGE_OPTIONS}
                  onChange={handleLanguageChange}
                />
              </div>

              <SaveActions onSave={handleSave} isSaving={isSaving} lang={lang} />
            </section>
          )}

          {section === "job" && (
            <section className="flex min-h-full flex-col">
              <div className="mb-12">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t("mypage.job.title", lang)}</h2>
                <p className="mt-1.5 text-sm text-gray-400">
                  {t("mypage.job.description", lang)}
                </p>
              </div>

              <div className="grid w-full max-w-md gap-8">
                <SelectField
                  id="culture"
                  label={t("mypage.job.culture", lang)}
                  value={culture}
                  options={CULTURE_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey, lang) }))}
                  onChange={setCulture}
                />
                <label className="block text-xs font-bold text-gray-700">
                  {t("mypage.job.organization", lang)}
                  <input
                    value={organization}
                    onChange={(event) => setOrganization(event.target.value)}
                    className={`${inputClass} mt-2`}
                  />
                </label>
                <SelectField
                  id="job-role"
                  label={t("mypage.job.role", lang)}
                  value={jobRole}
                  options={JOB_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey, lang) }))}
                  onChange={setJobRole}
                />
              </div>

              <SaveActions onSave={handleSave} isSaving={isSaving} lang={lang} />
            </section>
          )}

          {section === "account" && (
            <section className="flex min-h-full flex-col">
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t("mypage.account.title", lang)}</h2>
                <p className="mt-1.5 text-sm text-gray-400">
                  {t("mypage.account.description", lang)}
                </p>
              </div>

              <div className="border-t border-gray-100">
                <AccountRow title={t("mypage.account.email", lang)} description={email} />

                <AccountRow
                  title={t("mypage.logout", lang)}
                  description={t("mypage.account.logoutDescription", lang)}
                  actionLabel={t("mypage.logout", lang)}
                  onAction={() => setModal("logout")}
                />
                <AccountRow
                  title={t("mypage.withdraw", lang)}
                  description={t("mypage.account.withdrawDescription", lang)}
                  actionLabel={t("mypage.withdraw", lang)}
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
              {modal === "logout" ? t("mypage.modal.logoutTitle", lang) : t("mypage.modal.withdrawTitle", lang)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              {modal === "logout"
                ? t("mypage.modal.logoutDescription", lang)
                : t("mypage.modal.withdrawDescription", lang)}
            </p>
            <div className="mt-7 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg px-4 py-2.5 text-sm font-bold text-gray-500"
              >
                {t("mypage.cancel", lang)}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSaving}
                className={`rounded-lg px-4 py-2.5 text-sm font-bold text-white ${
                  modal === "logout" ? "bg-primary" : "bg-accent"
                } disabled:cursor-wait disabled:opacity-60`}
              >
                {isSaving
                  ? t("mypage.processing", lang)
                  : modal === "logout"
                    ? t("mypage.logout", lang)
                    : t("mypage.withdraw", lang)}
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
  lang,
}: {
  onSave: () => void | Promise<void>;
  isSaving: boolean;
  lang: "ko" | "en" | "vi";
}) {
  return (
    <div className="mt-auto flex justify-end pt-12">
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="min-w-36 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
      >
        {isSaving ? t("mypage.saving", lang) : t("mypage.save", lang)}
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
