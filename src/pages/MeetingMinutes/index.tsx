import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

// 로그인 / 백엔드 연동 전까지 true
const USE_DEV_DATA = true;
const TRANSCRIPT_PAGE_SIZE = 7;

type Language = "ko" | "en" | "vi";
type JobRole = "dev" | "design" | "pm" | "sales";
type MainTab = "minutes" | "role" | "culture" | "transcript";
type MinuteTab = "decisions" | "discussions" | "action_items";

interface Participant {
  profile_id: string;
  nickname: string;
  language: Language;
  speaker_index: number;
}

interface Meeting {
  id: string;
  title: string;
  status: string;
  started_at?: string;
  ended_at?: string;
  participants: Participant[];
}

interface MinutesItem {
  language: Language;
  job_role: JobRole;
  decisions: string[];
  discussions: string[];
  action_items: string[];
}

interface CulturalNote {
  id: number;
  category: "문화 이해" | "커뮤니케이션" | "업무 스타일";
  sentence: string;
  description: string;
}

interface Utterance {
  id?: number;
  time?: string;
  created_at?: string;
  speaker?: string;
  nickname?: string;
  speaker_name?: string;
  original?: string;
  text?: string;
  original_text?: string;
  translation?: string;
  translated_text?: string;
  sentence_id?: string;
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "vi", label: "Tiếng Việt" },
];

const JOB_ROLES: { value: JobRole; label: string }[] = [
  { value: "dev", label: "개발" },
  { value: "design", label: "디자인" },
  { value: "pm", label: "PM" },
  { value: "sales", label: "영업" },
];

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: "minutes", label: "결정 / 논의 / 액션" },
  { id: "role", label: "관점별 핵심 요약" },
  { id: "culture", label: "문화 가이드" },
  { id: "transcript", label: "전체 전사 기록" },
];

const MINUTE_TABS: { id: MinuteTab; label: string }[] = [
  { id: "decisions", label: "결정" },
  { id: "discussions", label: "논의" },
  { id: "action_items", label: "액션 아이템" },
];

const DEV_MEETING: Meeting = {
  id: "meeting-1",
  title: "글로벌 프로젝트 킥오프 회의",
  status: "ended",
  started_at: "2026-08-04T05:00:00Z",
  ended_at: "2026-08-04T05:45:00Z",
  participants: [
    {
      profile_id: "1",
      nickname: "종윤",
      language: "ko",
      speaker_index: 0,
    },
    {
      profile_id: "2",
      nickname: "Minh",
      language: "vi",
      speaker_index: 1,
    },
    {
      profile_id: "3",
      nickname: "James",
      language: "en",
      speaker_index: 2,
    },
  ],
};

const ROLE_CONTENT: Record<
  JobRole,
  Pick<MinutesItem, "decisions" | "discussions" | "action_items">
> = {
  dev: {
    decisions: [
      "금요일까지 1차 기능 개발을 완료하기로 결정했습니다.",
      "실시간 번역 기능을 MVP 범위에 포함하기로 결정했습니다.",
      "회의록 자동 생성은 회의 종료 후 배치 처리하기로 했습니다.",
    ],
    discussions: [
      "실시간 자막과 번역문을 sentence_id 기준으로 연결하는 방식을 논의했습니다.",
      "회의 종료 후 회의록 생성 API 연결 방식을 검토했습니다.",
    ],
    action_items: [
      "종윤: 회의록 생성 API 연결",
      "동균: 과거 회의록 및 상세 화면 구현",
      "개발팀: 전체 전사 기록 API 연결",
      "개발팀: 에러 응답 처리 정리",
    ],
  },
  design: {
    decisions: [
      "문화 가이드는 별도 회의록이 아닌 상세 회의록 탭으로 제공합니다.",
      "언어 선택은 상세 회의록 상단 드롭다운으로 제공합니다.",
    ],
    discussions: [
      "문화 가이드를 각주처럼 이해할 수 있는 구조를 논의했습니다.",
      "결정/논의/액션과 관점별 핵심 요약의 시각적 구분을 검토했습니다.",
    ],
    action_items: [
      "문화 가이드 탭 디자인",
      "언어 드롭다운 디자인",
      "전체 전사 테이블 가독성 보완",
    ],
  },
  pm: {
    decisions: [
      "MVP 지원 언어는 한국어, 영어, 베트남어로 정리했습니다.",
      "직무 라벨은 개발, 디자인, PM, 영업으로 통일합니다.",
    ],
    discussions: [
      "데모에서 실시간 번역과 문화적 오해 감지를 핵심 흐름으로 보여주기로 했습니다.",
      "회의 종료 후 회의록 확인 흐름을 논의했습니다.",
    ],
    action_items: [
      "기능 명세 최종 확인",
      "시연 시나리오 정리",
      "백엔드 API 응답 필드 확인",
    ],
  },
  sales: {
    decisions: [
      "서비스 소개에서는 글로벌 협업 중 발생하는 커뮤니케이션 오해를 강조합니다.",
    ],
    discussions: [
      "문화적 오해가 실제 업무에 미치는 영향을 어떻게 보여줄지 논의했습니다.",
      "회의록을 통한 후속 업무 정리 가치를 검토했습니다.",
    ],
    action_items: [
      "서비스 가치 제안 문구 정리",
      "시연용 비즈니스 상황 준비",
    ],
  },
};

function createDevMinutes(language: Language): MinutesItem[] {
  return (Object.keys(ROLE_CONTENT) as JobRole[]).map((job_role) => ({
    language,
    job_role,
    ...ROLE_CONTENT[job_role],
  }));
}

const DEV_CULTURAL_NOTES: CulturalNote[] = [
  {
    id: 1,
    category: "문화 이해",
    sentence: "금요일까지는 조금 어려울 것 같습니다.",
    description:
      "간접적인 표현으로 일정 준수가 어렵다는 의미를 전달한 것으로 해석될 수 있습니다.",
  },
  {
    id: 2,
    category: "문화 이해",
    sentence: "한번 검토해보겠습니다.",
    description:
      "긍정적인 확답보다 추가 검토가 필요하다는 의미로 사용되었을 가능성이 있습니다.",
  },
  {
    id: 3,
    category: "커뮤니케이션",
    sentence: "이 부분은 다시 수정해주세요.",
    description:
      "문화권에 따라 비교적 직접적인 지시로 받아들여질 수 있습니다.",
  },
  {
    id: 4,
    category: "업무 스타일",
    sentence: "담당자가 확인하고 공유해주세요.",
    description:
      "담당자와 완료 시점을 구체적으로 지정하면 실행 과정의 혼선을 줄일 수 있습니다.",
  },
  {
    id: 5,
    category: "커뮤니케이션",
    sentence: "좋은 것 같습니다.",
    description:
      "동의인지 단순한 긍정적 반응인지 추가 확인이 필요할 수 있습니다.",
  },
  {
    id: 6,
    category: "문화 이해",
    sentence: "가능하면 오늘 중으로 부탁드립니다.",
    description:
      "상대 문화권에 따라 요청의 강도가 다르게 해석될 수 있습니다.",
  },
];

const DEV_UTTERANCES: Utterance[] = [
  {
    id: 1,
    time: "14:00:12",
    speaker: "종윤",
    original: "오늘은 BridgeNote MVP 범위를 정리하겠습니다.",
    translation: "Today, we'll define the scope of the BridgeNote MVP.",
    sentence_id: "sentence_001",
  },
  {
    id: 2,
    time: "14:02:40",
    speaker: "Minh",
    original: "Tính năng dịch thời gian thực sẽ được đưa vào MVP chứ?",
    translation: "실시간 번역 기능은 MVP에 포함되는 건가요?",
    sentence_id: "sentence_002",
  },
  {
    id: 3,
    time: "14:04:10",
    speaker: "종윤",
    original: "네, 실시간 번역은 포함하는 방향으로 진행하겠습니다.",
    translation: "Yes, we'll proceed with real-time translation included.",
    sentence_id: "sentence_003",
  },
  {
    id: 4,
    time: "14:06:23",
    speaker: "James",
    original: "How should we display cultural misunderstandings?",
    translation: "문화적 오해는 어떤 방식으로 보여주면 될까요?",
    sentence_id: "sentence_004",
  },
  {
    id: 5,
    time: "14:09:44",
    speaker: "종윤",
    original: "문화 가이드 탭 안에서 각주 형태로 보여주면 좋을 것 같습니다.",
    translation:
      "I think cultural notes should be displayed inside the Cultural Guide tab.",
    sentence_id: "sentence_005",
  },
  {
    id: 6,
    time: "14:12:11",
    speaker: "Minh",
    original: "Ngôn ngữ có thể được thay đổi từ menu phía trên.",
    translation: "언어는 상단 메뉴에서 변경할 수 있습니다.",
    sentence_id: "sentence_006",
  },
  {
    id: 7,
    time: "14:15:30",
    speaker: "종윤",
    original: "금요일까지는 조금 어려울 것 같습니다.",
    translation: "It may be difficult to complete it by Friday.",
    sentence_id: "sentence_007",
  },
  {
    id: 8,
    time: "14:18:10",
    speaker: "James",
    original: "Then let's confirm the final deadline.",
    translation: "그럼 최종 기한을 다시 확인하겠습니다.",
    sentence_id: "sentence_008",
  },
];


function formatDate(dateString?: string) {
  if (!dateString) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(dateString))
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
}

function formatTime(dateString?: string) {
  if (!dateString) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(dateString));
}

function getMeetingDuration(startedAt?: string, endedAt?: string) {
  if (!startedAt || !endedAt) return "-";

  const minutes = Math.max(
    0,
    Math.floor(
      (new Date(endedAt).getTime() - new Date(startedAt).getTime()) /
        1000 /
        60
    )
  );

  if (minutes < 60) return `${minutes}분`;

  const hour = Math.floor(minutes / 60);
  const remain = minutes % 60;

  return remain ? `${hour}시간 ${remain}분` : `${hour}시간`;
}

export default function MeetingMinutes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [minutes, setMinutes] = useState<MinutesItem[]>([]);
  const [utterances, setUtterances] = useState<Utterance[]>([]);
  const [cultureNotes, setCultureNotes] = useState<CulturalNote[]>([]);

  const [mainTab, setMainTab] = useState<MainTab>("minutes");
  const [minuteTab, setMinuteTab] = useState<MinuteTab>("decisions");
  const [language, setLanguage] = useState<Language>("ko");
  const [jobRole, setJobRole] = useState<JobRole>("dev");
  const [transcriptPage, setTranscriptPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [minutesLoading, setMinutesLoading] = useState(false);
  const [error, setError] = useState("");

  // 회의 기본 정보 + 전체 전사
  useEffect(() => {
    const loadMeeting = async () => {
      try {
        setLoading(true);
        setError("");

        if (USE_DEV_DATA) {
          setMeeting({
            ...DEV_MEETING,
            id: id || DEV_MEETING.id,
          });
          setUtterances(DEV_UTTERANCES);
          setCultureNotes(DEV_CULTURAL_NOTES);
          return;
        }

        if (!id) {
          throw new Error("회의 ID가 없습니다.");
        }

        if (!accessToken) {
          throw new Error("로그인 정보가 없습니다. 다시 로그인해주세요.");
        }

        const [meetingResponse, utteranceResponse] = await Promise.all([
          fetch(`/api/meetings/${id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }),
          fetch(`/api/meetings/${id}/utterances`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }),
        ]);

        const meetingData = await meetingResponse.json();

        if (!meetingResponse.ok) {
          throw new Error(
            meetingData.message || "회의 정보를 불러오지 못했습니다."
          );
        }

        setMeeting(meetingData);

        if (utteranceResponse.ok) {
          const utteranceData = await utteranceResponse.json();

          setUtterances(
            Array.isArray(utteranceData)
              ? utteranceData
              : utteranceData.utterances || []
          );
        } else {
          setUtterances([]);
        }

        // 현재 문화 가이드 전용 GET API가 없으므로 실제 API 모드에서는 비워둠
        setCultureNotes([]);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "상세 회의록 조회 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [id, accessToken]);

  // 언어 변경 시 해당 언어의 회의록 조회
  useEffect(() => {
    const loadMinutes = async () => {
      try {
        setMinutesLoading(true);

        if (USE_DEV_DATA) {
          setMinutes(createDevMinutes(language));
          return;
        }

        if (!id) {
          setMinutes([]);
          return;
        }

        if (!accessToken) {
          setMinutes([]);
          return;
        }

        const response = await fetch(
          `/api/meetings/${id}/minutes?language=${encodeURIComponent(language)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );

        if (response.status === 404) {
          setMinutes([]);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "회의록을 불러오지 못했습니다.");
        }

        setMinutes(data.minutes || []);
      } catch (err) {
        console.error(err);
        setMinutes([]);
      } finally {
        setMinutesLoading(false);
      }
    };

    loadMinutes();
  }, [id, language, accessToken]);

  const baseMinutes = useMemo(() => {
    return (
      minutes.find((item) => item.language === language) ||
      minutes[0] ||
      null
    );
  }, [minutes, language]);

  const selectedRoleMinutes = useMemo(() => {
    return (
      minutes.find(
        (item) => item.language === language && item.job_role === jobRole
      ) ||
      minutes.find((item) => item.job_role === jobRole) ||
      null
    );
  }, [minutes, language, jobRole]);

  const cultureStats = useMemo(() => {
    const result: Record<
      CulturalNote["category"],
      number
    > = {
      "문화 이해": 0,
      커뮤니케이션: 0,
      "업무 스타일": 0,
    };

    cultureNotes.forEach((note) => {
      result[note.category] += 1;
    });

    return result;
  }, [cultureNotes]);

  const transcriptTotalPages = Math.max(
    1,
    Math.ceil(utterances.length / TRANSCRIPT_PAGE_SIZE)
  );

  const visibleUtterances = useMemo(() => {
    const start = (transcriptPage - 1) * TRANSCRIPT_PAGE_SIZE;

    return utterances.slice(start, start + TRANSCRIPT_PAGE_SIZE);
  }, [utterances, transcriptPage]);

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#EDECE6] px-6 py-10">
        <div className="mx-auto max-w-[1200px] rounded-2xl border border-[#E2E8F0] bg-white py-24 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#EDECE6] border-t-[#2C7B98]" />
          <p className="text-sm text-[#64748B]">
            상세 회의록을 불러오는 중입니다.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#EDECE6] px-6 py-10">
        <div className="mx-auto max-w-[1200px] rounded-2xl border border-[#E2E8F0] bg-white py-20 text-center">
          <p className="text-sm text-[#E2795F]">{error}</p>

          <button
            type="button"
            onClick={() => navigate("/archive")}
            className="mt-5 rounded-lg border border-[#DCE2E8] px-4 py-2 text-sm"
          >
            회의록 목록으로
          </button>
        </div>
      </main>
    );
  }

  if (!meeting) return null;

  return (
    <main
      className="min-h-[calc(100vh-72px)] bg-[#EDECE6] px-6 py-8 text-[#172033] lg:px-10"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* 회의 정보 */}
        <section className="mb-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => navigate("/archive")}
                className="mb-4 text-sm text-[#64748B] transition hover:text-[#2C7B98]"
              >
                ← 회의록 목록
              </button>

              <h1 className="text-[28px] font-semibold tracking-[-0.03em]">
                {meeting.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#64748B]">
                <span>📅 {formatDate(meeting.started_at)}</span>
                <span>{formatTime(meeting.started_at)}</span>
                <span>
                  ⏱ {getMeetingDuration(meeting.started_at, meeting.ended_at)}
                </span>
                <span>참가자 {meeting.participants?.length || 0}명</span>
              </div>
            </div>

            {/* 언어 선택 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94A3B8]">표시 언어</span>

              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as Language);
                  setTranscriptPage(1);
                }}
                className="h-10 rounded-lg border border-[#D8DEE3] bg-white px-3 text-sm outline-none focus:border-[#2C7B98]"
              >
                {LANGUAGES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 메인 탭 */}
        <div className="mb-7 border-b border-[#D9E0E5]">
          <div className="flex gap-10 overflow-x-auto">
            {MAIN_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMainTab(tab.id)}
                className={`relative whitespace-nowrap pb-3 text-sm font-medium transition ${
                  mainTab === tab.id
                    ? "text-[#172033]"
                    : "text-[#7A8594] hover:text-[#172033]"
                }`}
              >
                {tab.label}

                {mainTab === tab.id && (
                  <span className="absolute bottom-[-1px] left-0 h-[3px] w-full rounded-full bg-[#2C7B98]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 결정 / 논의 / 액션 */}
        {mainTab === "minutes" &&
          (minutesLoading ? (
            <EmptyState text="회의록을 불러오는 중입니다." />
          ) : (
            <section>
              <div className="mb-6 flex flex-wrap gap-3">
                {MINUTE_TABS.map((tab) => {
                  const count = baseMinutes?.[tab.id]?.length || 0;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setMinuteTab(tab.id)}
                      className={`min-w-[130px] rounded-lg border px-5 py-2.5 text-sm font-medium transition ${
                        minuteTab === tab.id
                          ? "border-[#2C7B98] bg-[#2C7B98] text-white"
                          : "border-[#DCE2E8] bg-white text-[#667281]"
                      }`}
                    >
                      {tab.label} ({count})
                    </button>
                  );
                })}
              </div>

              <h2 className="mb-4 text-lg font-semibold">
                {MINUTE_TABS.find((tab) => tab.id === minuteTab)?.label} (
                {baseMinutes?.[minuteTab]?.length || 0})
              </h2>

              <div className="space-y-3">
                {baseMinutes?.[minuteTab]?.length ? (
                  baseMinutes[minuteTab].map((item, index) => (
                    <div
                      key={`${minuteTab}-${index}`}
                      className="rounded-xl border border-[#DFE5E8] bg-white px-5 py-5 text-sm leading-7"
                    >
                      {item}
                    </div>
                  ))
                ) : (
                  <EmptyState text="등록된 내용이 없습니다." />
                )}
              </div>
            </section>
          ))}

        {/* 관점별 핵심 요약 */}
        {mainTab === "role" &&
          (minutesLoading ? (
            <EmptyState text="회의록을 불러오는 중입니다." />
          ) : (
            <section>
              <div className="mb-6 flex flex-wrap gap-3">
                {JOB_ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setJobRole(role.value)}
                    className={`min-w-[130px] rounded-lg border px-5 py-2.5 text-sm font-medium transition ${
                      jobRole === role.value
                        ? "border-[#2C7B98] bg-[#2C7B98] text-white"
                        : "border-[#DCE2E8] bg-white text-[#667281]"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>

              <h2 className="mb-4 text-lg font-semibold">
                {JOB_ROLES.find((role) => role.value === jobRole)?.label} 관점
                핵심 요약
              </h2>

              {selectedRoleMinutes ? (
                <div className="space-y-6">
                  <SummarySection
                    title="결정"
                    items={selectedRoleMinutes.decisions}
                  />

                  <SummarySection
                    title="논의"
                    items={selectedRoleMinutes.discussions}
                  />

                  <SummarySection
                    title="액션 아이템"
                    items={selectedRoleMinutes.action_items}
                  />
                </div>
              ) : (
                <EmptyState text="해당 직무의 회의록이 없습니다." />
              )}
            </section>
          ))}

        {/* 문화 가이드 */}
        {mainTab === "culture" && (
          <section>
            {cultureNotes.length > 0 ? (
              <>
                <h2 className="mb-4 text-lg font-semibold">문화 각주 통계</h2>

                <div className="mb-8 grid gap-4 md:grid-cols-4">
                  <StatCard label="전체 각주" count={cultureNotes.length} />
                  <StatCard
                    label="문화 이해"
                    count={cultureStats["문화 이해"]}
                  />
                  <StatCard
                    label="커뮤니케이션"
                    count={cultureStats["커뮤니케이션"]}
                  />
                  <StatCard
                    label="업무 스타일"
                    count={cultureStats["업무 스타일"]}
                  />
                </div>

                <h2 className="mb-4 text-lg font-semibold">
                  유형별 각주 개수
                </h2>

                <div className="mb-8 space-y-6 rounded-xl border border-[#DFE5E8] bg-white p-6">
                  {Object.entries(cultureStats).map(([category, count]) => {
                    const maxCount = Math.max(
                      1,
                      ...Object.values(cultureStats)
                    );

                    return (
                      <div
                        key={category}
                        className="grid grid-cols-[120px_1fr_50px] items-center gap-4"
                      >
                        <span className="text-sm">{category}</span>

                        <div className="h-2 rounded-full bg-[#EDF1F3]">
                          <div
                            className="h-2 rounded-full bg-[#2C7B98]"
                            style={{
                              width: `${(count / maxCount) * 100}%`,
                            }}
                          />
                        </div>

                        <span className="text-right text-sm">{count}개</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  {cultureNotes.map((note) => (
                    <article
                      key={note.id}
                      className="rounded-xl border border-[#DFE5E8] bg-white p-5"
                    >
                      <span className="inline-flex rounded-full bg-[#EDECE6] px-3 py-1 text-xs font-medium text-[#2C7B98]">
                        {note.category}
                      </span>

                      <p className="mt-4 font-medium">“{note.sentence}”</p>

                      <p className="mt-3 text-sm leading-6 text-[#64748B]">
                        {note.description}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState text="문화 가이드 조회 API 연결이 필요합니다." />
            )}
          </section>
        )}

        {/* 전체 전사 기록 */}
        {mainTab === "transcript" && (
          <section>
            <div className="overflow-hidden rounded-xl border border-[#DFE5E8] bg-white">
              <div className="hidden grid-cols-[100px_120px_1.3fr_1.3fr_150px] bg-[#F8FAFB] px-5 py-3 text-xs font-semibold text-[#586475] md:grid">
                <div>시간</div>
                <div>발화자</div>
                <div>원문</div>
                <div>번역문</div>
                <div>sentence_id</div>
              </div>

              {visibleUtterances.length > 0 ? (
                visibleUtterances.map((item, index) => (
                  <div
                    key={item.id || item.sentence_id || index}
                    className="grid gap-2 border-t border-[#EDF0F2] px-5 py-4 text-sm md:grid-cols-[100px_120px_1.3fr_1.3fr_150px] md:gap-0"
                  >
                    <div className="text-[#64748B]">
                      {item.time || item.created_at || "-"}
                    </div>

                    <div className="font-medium">
                      {item.speaker ||
                        item.nickname ||
                        item.speaker_name ||
                        "-"}
                    </div>

                    <div className="pr-5">
                      {item.original ||
                        item.text ||
                        item.original_text ||
                        "-"}
                    </div>

                    <div className="pr-5 text-[#64748B]">
                      {item.translation || item.translated_text || "-"}
                    </div>

                    <div className="text-xs text-[#94A3B8]">
                      {item.sentence_id || "-"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-sm text-[#94A3B8]">
                  전사 기록이 없습니다.
                </div>
              )}
            </div>

            {transcriptTotalPages > 1 && (
              <div className="mt-7 flex justify-center gap-1">
                <button
                  type="button"
                  disabled={transcriptPage === 1}
                  onClick={() =>
                    setTranscriptPage((prev) => Math.max(1, prev - 1))
                  }
                  className="h-9 w-9 rounded-lg text-sm disabled:opacity-30"
                >
                  ‹
                </button>

                {Array.from(
                  { length: transcriptTotalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setTranscriptPage(page)}
                    className={`h-9 min-w-9 rounded-lg px-3 text-sm ${
                      transcriptPage === page
                        ? "bg-[#2C7B98] text-white"
                        : "text-[#64748B]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={transcriptPage === transcriptTotalPages}
                  onClick={() =>
                    setTranscriptPage((prev) =>
                      Math.min(transcriptTotalPages, prev + 1)
                    )
                  }
                  className="h-9 w-9 rounded-lg text-sm disabled:opacity-30"
                >
                  ›
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-[#DFE5E8] bg-white py-16 text-center text-sm text-[#94A3B8]">
      {text}
    </div>
  );
}

function SummarySection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section>
      <h3 className="mb-3 font-semibold">{title}</h3>

      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="rounded-xl border border-[#DFE5E8] bg-white px-5 py-4 text-sm leading-6"
            >
              {item}
            </div>
          ))
        ) : (
          <p className="text-sm text-[#94A3B8]">내용이 없습니다.</p>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-xl border border-[#DCE2E8] bg-white px-5 py-5 text-center">
      <p className="text-sm text-[#64748B]">{label}</p>

      <p className="mt-2 text-[30px] font-semibold">
        {count}
        <span className="ml-1 text-sm font-normal">개</span>
      </p>
    </div>
  );
}