import { useState } from "react";

type Section = "profile" | "language" | "culture" | "account";
type ConfirmModal = "logout" | "withdraw" | null;

const SECTIONS: { id: Section; label: string }[] = [
  { id: "profile", label: "프로필" },
  { id: "language", label: "언어 설정" },
  { id: "culture", label: "문화권·직무" },
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
  { value: "CN", label: "중국" },
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
  "h-11 w-full rounded-lg border border-gray-200 bg-[#F8F9F7] px-3 text-sm text-gray-800 outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/10 disabled:cursor-default disabled:text-gray-500";

export default function MyPage() {
  const [section, setSection] = useState<Section>("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [modal, setModal] = useState<ConfirmModal>(null);
  const [toast, setToast] = useState("");

  const [nickname, setNickname] = useState("김재웅");
  const [organization, setOrganization] = useState("LikeLion Bridgenote");
  const [language, setLanguage] = useState("ko");
  const [captionLanguage, setCaptionLanguage] = useState("en");
  const [minutesLanguage, setMinutesLanguage] = useState("ko");
  const [culture, setCulture] = useState("KR");
  const [jobRole, setJobRole] = useState("pm");

  const email = "jaewoong@bridgenote.team";

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const handleSave = () => {
    setIsEditingProfile(false);
    showToast("변경사항을 저장했어요.");
  };

  const handleSectionChange = (nextSection: Section) => {
    setSection(nextSection);
    setIsEditingProfile(false);
    setIsPasswordOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-[210px_minmax(0,1fr)] md:gap-7">
        <aside className="self-start rounded-2xl border border-gray-100 bg-white p-3 shadow-sm md:sticky md:top-24 md:p-4">
          <h1 className="hidden px-3 pb-4 pt-1 text-lg font-bold text-gray-900 md:block">
            마이페이지
          </h1>

          <nav className="grid grid-cols-2 gap-1.5 md:grid-cols-1" aria-label="마이페이지 메뉴">
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionChange(item.id)}
                aria-current={section === item.id ? "page" : undefined}
                className={`rounded-xl px-3 py-3 text-left text-sm transition-colors ${
                  section === item.id
                    ? "bg-primary/10 font-bold text-primary"
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
            className="mt-4 hidden w-full border-t border-gray-100 px-3 pt-5 text-left text-sm text-gray-400 transition-colors hover:text-gray-700 md:block"
          >
            로그아웃
          </button>
        </aside>

        <main className="min-h-[540px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 md:p-10">
          {section === "profile" && (
            <section>
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
                  김
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900">{nickname}</p>
                  <p className="mt-1 break-all text-sm text-gray-400">{email}</p>
                </div>
              </div>

              <h3 className="mb-4 text-sm font-bold text-gray-800">기본 정보</h3>
              <div className="grid gap-5 sm:grid-cols-2">
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

                <label className="text-xs font-bold text-gray-700">
                  소속 조직
                  <input
                    value={organization}
                    onChange={(event) => setOrganization(event.target.value)}
                    disabled={!isEditingProfile}
                    className={`${inputClass} mt-2`}
                  />
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
                    className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  >
                    변경사항 저장
                  </button>
                </div>
              )}
            </section>
          )}

          {section === "language" && (
            <section>
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">언어 설정</h2>
                <p className="mt-1.5 text-sm text-gray-400">
                  자막과 회의록에 사용할 기본 언어를 선택해요.
                </p>
              </div>

              <div className="max-w-xl space-y-5">
                <SelectField
                  id="native-language"
                  label="모국어"
                  description="서비스 화면과 개인화된 회의 결과의 기본 언어예요."
                  value={language}
                  options={LANGUAGE_OPTIONS}
                  onChange={setLanguage}
                />
                <SelectField
                  id="caption-language"
                  label="자막 번역 언어"
                  description="회의 중 개인 화면에 표시할 자막 언어예요."
                  value={captionLanguage}
                  options={LANGUAGE_OPTIONS}
                  onChange={setCaptionLanguage}
                />
                <SelectField
                  id="minutes-language"
                  label="회의록 기본 언어"
                  description="회의 종료 후 생성되는 회의록의 기본 언어예요."
                  value={minutesLanguage}
                  options={LANGUAGE_OPTIONS}
                  onChange={setMinutesLanguage}
                />
              </div>

              <SaveActions onSave={handleSave} />
            </section>
          )}

          {section === "culture" && (
            <section>
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  문화권·직무 설정
                </h2>
                <p className="mt-1.5 text-sm text-gray-400">
                  문화 각주와 직무별 회의록의 개인화 기준을 설정해요.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  id="culture"
                  label="문화권"
                  value={culture}
                  options={CULTURE_OPTIONS}
                  onChange={setCulture}
                />
                <SelectField
                  id="job-role"
                  label="직무"
                  value={jobRole}
                  options={JOB_OPTIONS}
                  onChange={setJobRole}
                />
              </div>

              <div className="mt-6 rounded-xl bg-primary/10 px-4 py-4 text-sm leading-6 text-[#466875]">
                선택한 문화권과 직무는 상대 문화에 맞는 표현을 설명하고, 회의록을 내 업무
                관점으로 정리하는 데 사용돼요.
              </div>

              <SaveActions onSave={handleSave} />
            </section>
          )}

          {section === "account" && (
            <section>
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">계정 관리</h2>
                <p className="mt-1.5 text-sm text-gray-400">
                  로그인 정보와 계정 상태를 관리해요.
                </p>
              </div>

              <div className="border-t border-gray-100">
                <AccountRow title="가입 이메일" description={email} />

                <div className="border-b border-gray-100 py-5">
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">비밀번호</h3>
                      <p className="mt-1 text-xs text-gray-400">
                        주기적인 변경으로 계정을 안전하게 보호하세요.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPasswordOpen((current) => !current)}
                      className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:border-primary hover:text-primary"
                    >
                      {isPasswordOpen ? "변경 취소" : "비밀번호 변경"}
                    </button>
                  </div>

                  {isPasswordOpen && (
                    <div className="mt-5 grid gap-3 rounded-xl bg-[#F8F9F7] p-4 sm:grid-cols-2">
                      <label className="text-xs font-bold text-gray-700">
                        새 비밀번호
                        <input type="password" placeholder="8자 이상" className={`${inputClass} mt-2 bg-white`} />
                      </label>
                      <label className="text-xs font-bold text-gray-700">
                        비밀번호 확인
                        <input type="password" placeholder="다시 입력" className={`${inputClass} mt-2 bg-white`} />
                      </label>
                      <div className="sm:col-span-2 sm:text-right">
                        <button
                          type="button"
                          onClick={handleSave}
                          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white"
                        >
                          비밀번호 변경
                        </button>
                      </div>
                    </div>
                  )}
                </div>

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
                onClick={() => {
                  const message = modal === "logout" ? "로그아웃을 준비했어요." : "회원 탈퇴를 준비했어요.";
                  setModal(null);
                  showToast(message);
                }}
                className={`rounded-lg px-4 py-2.5 text-sm font-bold text-white ${
                  modal === "logout" ? "bg-primary" : "bg-accent"
                }`}
              >
                {modal === "logout" ? "로그아웃" : "회원 탈퇴"}
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

function SaveActions({ onSave }: { onSave: () => void }) {
  return (
    <div className="mt-8 flex justify-end gap-2">
      <button
        type="button"
        className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600"
      >
        취소
      </button>
      <button
        type="button"
        onClick={onSave}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        변경사항 저장
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
