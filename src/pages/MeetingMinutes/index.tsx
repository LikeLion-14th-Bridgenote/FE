import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { meetingApi } from "../../apis/meetingApi";
import { useAuthStore } from "../../stores/authStore";

const MEETING_MINUTES_STYLES = `
@font-face {
  font-family: "YuhanKimberlyPureunsoop";
  src: url("https://cdn.jsdelivr.net/gh/Project-Noonnu/2607101517@font-2/font-2/font-2-300.woff2")
    format("woff2");
  font-weight: 300;
  font-display: swap;
}

@font-face {
  font-family: "YuhanKimberlyPureunsoop";
  src: url("https://cdn.jsdelivr.net/gh/Project-Noonnu/2607101517@font-2/font-2/font-2-500.woff2")
    format("woff2");
  font-weight: 500;
  font-display: swap;
}
@font-face {
  font-family: "YuhanKimberlyPureunsoop";
  src: url("https://cdn.jsdelivr.net/gh/Project-Noonnu/2607101517@font-2/font-2/font-2-700.woff2")
    format("woff2");
  font-weight: 700;
  font-display: swap;
}

.meeting-minutes-page {
  --primary: #2c7b98;
  --accent: #e2795f;
  --bg: #edece6;
  --white: #ffffff;
  --ink: #172033;
  --muted: #64748b;
  --muted-2: #667281;
  --faint: #94a3b8;
  --line: #dfe5e8;
  --line-2: #dce2e8;
  --line-3: #edf0f2;
  --head-bg: #f8fafb;
  --bar-bg: #edf1f3;
  --sub: #586475;
  --font: "YuhanKimberlyPureunsoop", "Noto Sans KR", sans-serif;

  min-height: 100vh;
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
}

.meeting-minutes-page *,
.meeting-minutes-page *::before,
.meeting-minutes-page *::after {
  box-sizing: border-box;
}


.mm-wrap {
  max-width: 1200px;
  margin: 0 auto;
}

.mm-page {
  padding: 32px 24px 80px;
}

.mm-info {
  margin-bottom: 28px;
}

.mm-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.mm-back {
  display: inline-block;
  margin: 0 0 16px;
  padding: 0;
  border: none;
  background: none;
  color: var(--muted);
  font-family: var(--font);
  font-size: 14px;
  cursor: pointer;
}

.mm-back:hover {
  color: var(--primary);
}

.meeting-minutes-page h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.meeting-minutes-page h2 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
}

.mm-meta {
  margin-top: 12px;
  color: var(--muted);
  font-size: 14px;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.mm-lang-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mm-lang-label {
  font-size: 14px;
  color: var(--muted);
}

.mm-lang-row select {
  height: 40px;
  padding: 0 34px 0 12px;
  border: 1px solid #d8dee3;
  border-radius: 8px;
  outline: none;
  color: var(--ink);
  background-color: var(--white);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23667281' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  appearance: none;
  cursor: pointer;
  font-family: var(--font);
  font-size: 14px;
}

.mm-lang-row select:focus {
  border-color: var(--primary);
}

.mm-tabs {
  display: flex;
  gap: 4px;
  margin: 24px 0 28px;
  padding: 6px;
  border: 1px solid #DFE5E8;
  border-radius: 12px;
  background: #FFFFFF;
  overflow-x: auto;
}

.mm-tabs::-webkit-scrollbar {
  display: none;
}

.mm-tab {
  position: relative;
  min-height: 42px;
  padding: 9px 14px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #667281;
  font-family: var(--font);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.mm-tab:hover {
  background: #F5F7F7;
  color: #2C7B98;
}

.mm-tab[aria-selected="true"] {
  background: #E9EFF1;
  color: #2C7B98;
  font-weight: 700;
}

.mm-tab[aria-selected="true"]::after {
  content: "";
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 0;
  height: 2px;
  border-radius: 999px;
  background: #2C7B98;
}

.mm-tab-count {
  margin-left: 5px;
  color: #94A3B8;
  font-size: 12px;
  font-weight: 500;
}

.mm-tab[aria-selected="true"] .mm-tab-count {
  color: #2C7B98;
}

.mm-panel {
  display: block;
}

.mm-card {
  margin-bottom: 12px;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--white);
  font-size: 14px;
  line-height: 1.75;
}

.mm-tablebox {
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--white);
}

.mm-table-row {
  display: grid;
  grid-template-columns: 1fr 130px 130px;
  gap: 0;
  padding: 14px 20px;
  border-top: 1px solid var(--line-3);
  align-items: center;
  font-size: 14px;
}

.mm-table-head {
  padding: 12px 20px;
  border-top: none;
  background: var(--head-bg);
  color: var(--sub);
  font-size: 12.5px;
  font-weight: 600;
}

.mm-owner {
  font-weight: 500;
}

.mm-due {
  color: var(--muted);
}

.mm-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.mm-role {
  min-width: 130px;
  padding: 10px 20px;
  border: 1px solid var(--line-2);
  border-radius: 8px;
  background: var(--white);
  color: var(--muted-2);
  font-family: var(--font);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.15s;
}

.mm-role[aria-selected="true"] {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}

.mm-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 26px;
}

.mm-stat {
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--white);
  text-align: center;
}

.mm-stat-label {
  margin-bottom: 8px;
  color: var(--muted);
  font-size: 13.5px;
}

.mm-stat-value {
  font-size: 26px;
  font-weight: 700;
}

.mm-stat-value span {
  margin-left: 3px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 400;
}

.mm-barbox {
  margin-bottom: 26px;
  padding: 20px 22px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--white);
}

.mm-bar {
  display: grid;
  grid-template-columns: 110px 1fr 46px;
  gap: 16px;
  margin-bottom: 12px;
  align-items: center;
  font-size: 14px;
}

.mm-bar:last-child {
  margin-bottom: 0;
}

.mm-track {
  height: 8px;
  border-radius: 999px;
  background: var(--bar-bg);
}

.mm-fill {
  height: 8px;
  border-radius: 999px;
  background: var(--primary);
}

.mm-bar-count {
  color: var(--muted);
  font-size: 13.5px;
  text-align: right;
}

.mm-culture-note {
  margin-bottom: 14px;
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--white);
}

.mm-chip {
  display: inline-block;
  margin-bottom: 10px;
  padding: 4px 11px;
  border-radius: 999px;
  background: var(--bar-bg);
  color: var(--muted-2);
  font-size: 12px;
}

.mm-culture-quote {
  margin-bottom: 7px;
  font-size: 15.5px;
  font-weight: 600;
}

.mm-culture-description {
  color: var(--muted);
  font-size: 14px;
}

.mm-transcript-head {
  display: grid;
  grid-template-columns: 92px 110px 1.3fr 1.3fr;
  padding: 12px 20px;
  background: var(--head-bg);
  color: var(--sub);
  font-size: 12.5px;
  font-weight: 600;
}

.mm-turn {
  padding: 15px 20px;
  border-top: 1px solid var(--line-3);
}

.mm-turn-grid {
  display: grid;
  grid-template-columns: 92px 110px 1.3fr 1.3fr;
  gap: 0;
  align-items: start;
  font-size: 14px;
}

.mm-time {
  color: var(--muted);
}

.mm-who {
  font-weight: 500;
}

.mm-source {
  padding-right: 20px;
}

.mm-translation {
  padding-right: 20px;
  color: var(--muted);
}

.mm-note {
  margin-top: 12px;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-left: 3px solid var(--accent);
  border-radius: 10px;
  background: #fcf8f6;
}

.mm-note-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.mm-note-tag {
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
}

.mm-note-chip {
  padding: 2px 9px;
  border: 1px solid var(--line-2);
  border-radius: 999px;
  background: var(--white);
  color: var(--muted-2);
  font-size: 11.5px;
}

.mm-note-grid {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 7px 14px;
  font-size: 13.5px;
}

.mm-note-grid dt {
  color: var(--faint);
  font-size: 12.5px;
}

.mm-note-grid dd {
  margin: 0;
}

.mm-rewrite {
  grid-column: 1 / -1;
  margin-top: 8px;
  padding: 11px 13px;
  border: 1px solid var(--line-2);
  border-radius: 8px;
  background: var(--white);
  font-size: 13.5px;
}

.mm-rewrite b {
  display: block;
  margin-bottom: 4px;
  color: var(--accent);
  font-size: 11.5px;
  font-weight: 700;
}

.mm-digest {
  margin-bottom: 20px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--white);
}

.mm-digest-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border: none;
  background: none;
  color: var(--ink);
  font-family: var(--font);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.mm-digest-head:hover {
  background: var(--head-bg);
}

.mm-digest-title {
  font-weight: 600;
}

.mm-digest-count {
  color: var(--faint);
  font-size: 13px;
}

.mm-digest-arrow {
  margin-left: auto;
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: #EEF4F6;
  color: #2C7B98;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  transition:
    transform 0.18s ease,
    background 0.15s ease;
}

.mm-digest-head:hover .mm-digest-arrow {
  background: #E3EEF2;
}

.mm-digest[data-open="false"] .mm-digest-arrow {
  transform: rotate(-90deg);
}

.mm-digest-body {
  padding: 0 20px 16px;
}

.mm-digest-body ul {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
  list-style: none;
}

.mm-digest-body li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.7;
}

.mm-dot {
  width: 5px;
  height: 5px;
  flex: none;
  margin-top: 9px;
  border-radius: 50%;
  background: var(--primary);
}

.mm-digest-more {
  display: inline-block;
  margin-top: 12px;
  padding: 0;
  border: none;
  background: none;
  color: var(--primary);
  font-family: var(--font);
  font-size: 13px;
  cursor: pointer;
}

.mm-digest-more:hover {
  text-decoration: underline;
}

.meeting-minutes-page :focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: 6px;
}
  
@media (min-width: 1024px) {
  .mm-page { padding: 32px 40px 80px; }
}

@media (max-width: 860px) {
  .mm-transcript-head { display: none; }
  .mm-turn-grid { grid-template-columns: 1fr; gap: 6px; }
  .mm-table-row { grid-template-columns: 1fr; gap: 6px; }
  .mm-stats { grid-template-columns: repeat(2, 1fr); }
}
`;

type Lang = "ko" | "en" | "vi";
type TabKey = "tr" | "dec" | "dis" | "act" | "role" | "cul";
type RoleKey = "dev" | "design" | "pm" | "sales";

interface TabItem {
  key: TabKey;
  label: string;
}

interface RoleItem {
  key: RoleKey;
  label: string;
}

const TAB_ITEMS: TabItem[] = [
  { key: "tr", label: "전체 전사 기록" },
  { key: "dec", label: "결정" },
  { key: "dis", label: "논의" },
  { key: "act", label: "액션 아이템" },
  { key: "role", label: "관점별 핵심 요약" },
  { key: "cul", label: "문화 가이드" },
];

const ROLE_ITEMS: RoleItem[] = [
  { key: "dev", label: "개발" },
  { key: "design", label: "디자인" },
  { key: "pm", label: "PM" },
  { key: "sales", label: "영업" },
];

// TODO: 원본에 있던 정확한 문구로 교체 확인 필요 (임시로 채워둔 라벨)
const UI: Record<Lang, {
  digest: string;
  count: (n: number) => string;
  tr: string;
  dec: string;
  dis: string;
  act: string;
  persp: string;
  task: string;
  owner: string;
  due: string;
  none: string;
}> = {
  ko: {
    digest: "핵심 결정 요약",
    count: (n) => `${n}건`,
    tr: "번역문",
    dec: "결정",
    dis: "논의",
    act: "액션 아이템",
    persp: "관점 요약",
    task: "작업",
    owner: "담당자",
    due: "기한",
    none: "미정",
  },
  en: {
    digest: "Key Decisions",
    count: (n) => `${n} items`,
    tr: "Translation",
    dec: "Decisions",
    dis: "Discussions",
    act: "Action Items",
    persp: "Summary",
    task: "Task",
    owner: "Owner",
    due: "Due",
    none: "TBD",
  },
  vi: {
    digest: "Quyết định chính",
    count: (n) => `${n} mục`,
    tr: "Bản dịch",
    dec: "Quyết định",
    dis: "Thảo luận",
    act: "Việc cần làm",
    persp: "Tóm tắt",
    task: "Công việc",
    owner: "Người phụ trách",
    due: "Hạn chót",
    none: "Chưa xác định",
  },
};

// TODO: 원본에 있던 정확한 직무명으로 교체 확인 필요
const ROLE_LABEL: Record<RoleKey, Record<Lang, string>> = {
  dev: { ko: "개발", en: "Development", vi: "Phát triển" },
  design: { ko: "디자인", en: "Design", vi: "Thiết kế" },
  pm: { ko: "PM", en: "PM", vi: "PM" },
  sales: { ko: "영업", en: "Sales", vi: "Kinh doanh" },
};

interface RealParticipant {
  profile_id: string;
  nickname: string;
  language: string;
}

interface RealMeeting {
  title: string;
  started_at?: string;
  ended_at?: string;
  participants: RealParticipant[];
}

interface RealUtterance {
  sentence_id: string | number;
  speaker_id?: string;
  source_text?: string;
  spoken_at?: string;
}

interface RealMinutesItem {
  language: Lang;
  job_role: string;
  decisions: string[];
  discussions: string[];
  action_items: string[];
}

interface RealCulturalNote {
  sentence_id?: string;
  note_type?: string;
  speaker_intent?: string;
  listener_misread?: string;
  advice?: string;
  rewrite_text?: string;
}

export default function MeetingMinutes() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [lang, setLang] = useState<Lang>("ko");
  const [activeTab, setActiveTab] = useState<TabKey>("tr");
  const [role, setRole] = useState<RoleKey>("dev");
  const [digestOpen, setDigestOpen] = useState(true);

  const [meeting, setMeeting] = useState<RealMeeting | null>(null);
  const [utterances, setUtterances] = useState<RealUtterance[]>([]);
  const [minutesAll, setMinutesAll] = useState<RealMinutesItem[]>([]);
  const [culturalNotes, setCulturalNotes] = useState<RealCulturalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !accessToken) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [meetingRes, utterRes, notesRes] = await Promise.all([
          meetingApi.get(id),
          meetingApi.getUtterances(id),
          meetingApi.getCulturalNotes(id),
        ]);
        setMeeting(meetingRes.data);
        setUtterances(meetingRes.data.utterances || utterRes.data.utterances || []);
        setCulturalNotes(notesRes.data.cultural_notes || notesRes.data || []);
      } catch (e) {
        setError("회의록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, accessToken]);

  useEffect(() => {
    if (!id || !accessToken) return;
    let cancelled = false;
    let tries = 0;
    const MAX_TRIES = 20;

    const loadMinutes = async () => {
      try {
        const res = await meetingApi.getMinutes(id);
        if (cancelled) return;
        if (res.data.status === "pending" || res.data.minutes === undefined) {
          if (tries < MAX_TRIES) {
            tries += 1;
            setTimeout(loadMinutes, 3000);
          }
          return;
        }
        setMinutesAll(res.data.minutes || []);
      } catch (e) {
        if (!cancelled) setMinutesAll([]);
      }
    };
    loadMinutes();
    return () => {
      cancelled = true;
    };
  }, [id, accessToken]);

  const ui = UI[lang];

  const currentLangMinutes = useMemo(
    () => minutesAll.filter((m) => m.language === lang),
    [minutesAll, lang]
  );
  const decisions = useMemo(
    () => Array.from(new Set(currentLangMinutes.flatMap((m) => m.decisions || []))),
    [currentLangMinutes]
  );
  const discussions = useMemo(
    () => Array.from(new Set(currentLangMinutes.flatMap((m) => m.discussions || []))),
    [currentLangMinutes]
  );
  const actionItems = useMemo(
    () => Array.from(new Set(currentLangMinutes.flatMap((m) => m.action_items || []))),
    [currentLangMinutes]
  );

  const roleMinutes = useMemo(
    () => minutesAll.find((m) => m.language === lang && m.job_role === role),
    [minutesAll, lang, role]
  );

  const transcriptRows = useMemo(() => {
    return utterances.map((u) => {
      const speaker = meeting?.participants?.find((p) => p.profile_id === u.speaker_id);
      const note = culturalNotes.find((n) => n.sentence_id === String(u.sentence_id));
      return {
        time: u.spoken_at
          ? new Date(u.spoken_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
          : "-",
        who: speaker?.nickname || "-",
        src: u.source_text || "-",
        note: note
          ? {
              cat: note.note_type || "문화 각주",
              intent: note.speaker_intent || "-",
              misread: note.listener_misread || "-",
              advice: note.advice || "-",
              rewrite: note.rewrite_text || "-",
            }
          : undefined,
      };
    });
  }, [utterances, meeting, culturalNotes]);

  const cultureStatsByCat = useMemo(() => {
    const result: Record<string, number> = {};
    culturalNotes.forEach((n) => {
      const cat = n.note_type || "기타";
      result[cat] = (result[cat] || 0) + 1;
    });
    return result;
  }, [culturalNotes]);

  if (loading) {
    return (
      <div className="meeting-minutes-page">
        <style>{MEETING_MINUTES_STYLES}</style>
        <main className="mm-page">
          <div className="mm-wrap" style={{ textAlign: "center", padding: "80px 0", color: "#94A3B8" }}>
            회의록을 불러오는 중입니다.
          </div>
        </main>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="meeting-minutes-page">
        <style>{MEETING_MINUTES_STYLES}</style>
        <main className="mm-page">
          <div className="mm-wrap" style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ color: "#E2795F", marginBottom: 16 }}>{error || "회의를 찾을 수 없습니다."}</p>
            <button className="mm-back" onClick={() => navigate("/archive")}>
              ← 회의록 목록
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="meeting-minutes-page" lang={lang}>
      <style>{MEETING_MINUTES_STYLES}</style>
      <main className="mm-page">
        <div className="mm-wrap">
          <section className="mm-info">
            <div className="mm-title-row">
              <div>
                <button className="mm-back" type="button" onClick={() => navigate("/archive")}>
                  ← 회의록 목록
                </button>

                <h1>{meeting.title}</h1>

                <div className="mm-meta">
                  <span>📅 {meeting.started_at ? new Date(meeting.started_at).toLocaleDateString("ko-KR") : "-"}</span>
                  <span>
                    {meeting.started_at
                      ? new Date(meeting.started_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
                      : "-"}
                  </span>
                  <span>참가자 {meeting.participants?.length ?? 0}명</span>
                </div>
              </div>

              <div className="mm-lang-row">
                <span className="mm-lang-label">표시 언어</span>
                <select value={lang} aria-label="표시 언어" onChange={(e) => setLang(e.target.value as Lang)}>
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                </select>
              </div>
            </div>
          </section>

          <div className="mm-tabs" role="tablist">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab.key}
                className="mm-tab"
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "tr" && (
            <section className="mm-panel">
              <div className="mm-digest" data-open={digestOpen}>
                <button
                  className="mm-digest-head"
                  type="button"
                  aria-expanded={digestOpen}
                  onClick={() => setDigestOpen((prev) => !prev)}
                >
                  <span className="mm-digest-title">{ui.digest}</span>
                  <span className="mm-digest-count">{ui.count(decisions.length)}</span>
                  <span className="mm-digest-arrow">▾</span>
                </button>

                {digestOpen && (
                  <div className="mm-digest-body">
                    <ul>
                      {decisions.map((item) => (
                        <li key={item}>
                          <span className="mm-dot" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <h2>전체 전사 기록</h2>

              <div className="mm-tablebox">
                <div className="mm-transcript-head">
                  <div>시간</div>
                  <div>발화자</div>
                  <div>원문</div>
                  <div>{ui.tr}</div>
                </div>

                {transcriptRows.length === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: "#94A3B8" }}>
                    전사 기록이 없습니다.
                  </div>
                ) : (
                  transcriptRows.map((item, idx) => (
                    <div className="mm-turn" key={idx}>
                      <div className="mm-turn-grid">
                        <div className="mm-time">{item.time}</div>
                        <div className="mm-who">{item.who}</div>
                        <div className="mm-source">{item.src}</div>
                        <div className="mm-translation">-</div>
                      </div>

                      {item.note && (
                        <div className="mm-note">
                          <div className="mm-note-head">
                            <span className="mm-note-tag">✦ 문화 각주</span>
                            <span className="mm-note-chip">{item.note.cat}</span>
                          </div>

                          <dl className="mm-note-grid">
                            <dt>화자 의도</dt>
                            <dd>{item.note.intent}</dd>

                            <dt>오해 소지</dt>
                            <dd>{item.note.misread}</dd>

                            <dt>조언</dt>
                            <dd>{item.note.advice}</dd>

                            <div className="mm-rewrite">
                              <b>이렇게 말하면</b>
                              {item.note.rewrite}
                            </div>
                          </dl>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === "dec" && (
            <section className="mm-panel">
              <h2>
                {ui.dec} ({decisions.length})
              </h2>
              {decisions.length === 0 ? (
                <div className="mm-card">등록된 결정사항이 없습니다.</div>
              ) : (
                decisions.map((item) => (
                  <div className="mm-card" key={item}>
                    {item}
                  </div>
                ))
              )}
            </section>
          )}

          {activeTab === "dis" && (
            <section className="mm-panel">
              <h2>
                {ui.dis} ({discussions.length})
              </h2>
              {discussions.length === 0 ? (
                <div className="mm-card">등록된 논의가 없습니다.</div>
              ) : (
                discussions.map((item) => (
                  <div className="mm-card" key={item}>
                    {item}
                  </div>
                ))
              )}
            </section>
          )}

          {activeTab === "act" && (
            <section className="mm-panel">
              <h2>
                {ui.act} ({actionItems.length})
              </h2>
              <div className="mm-tablebox">
                <div className="mm-table-row mm-table-head">
                  <div>{ui.task}</div>
                  <div>{ui.owner}</div>
                  <div>{ui.due}</div>
                </div>
                {actionItems.length === 0 ? (
                  <div style={{ padding: "20px" }}>{ui.none}</div>
                ) : (
                  actionItems.map((item) => (
                    <div className="mm-table-row" key={item}>
                      <div>{item}</div>
                      <div className="mm-owner">-</div>
                      <div className="mm-due">{ui.none}</div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === "role" && (
            <section className="mm-panel">
              <div className="mm-roles" role="tablist">
                {ROLE_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    className="mm-role"
                    type="button"
                    role="tab"
                    aria-selected={role === item.key}
                    onClick={() => setRole(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <h2>
                {ROLE_LABEL[role][lang]} {ui.persp}
              </h2>

              {!roleMinutes ? (
                <div className="mm-card">해당 직무의 회의록이 없습니다.</div>
              ) : (
                roleMinutes.decisions.map((item) => (
                  <div className="mm-card" key={item}>
                    {item}
                  </div>
                ))
              )}
            </section>
          )}

          {activeTab === "cul" && (
            <section className="mm-panel">
              <h2>문화 각주 통계</h2>

              <div className="mm-stats">
                <div className="mm-stat">
                  <div className="mm-stat-label">전체 각주</div>
                  <div className="mm-stat-value">
                    {culturalNotes.length}
                    <span>개</span>
                  </div>
                </div>
                {Object.entries(cultureStatsByCat)
                  .slice(0, 3)
                  .map(([cat, count]) => (
                    <div className="mm-stat" key={cat}>
                      <div className="mm-stat-label">{cat}</div>
                      <div className="mm-stat-value">
                        {count}
                        <span>개</span>
                      </div>
                    </div>
                  ))}
              </div>

              {culturalNotes.length === 0 ? (
                <div className="mm-culture-note">
                  감지된 문화 각주가 없습니다. (다국어 인식이 아직 불안정할 수 있어요)
                </div>
              ) : (
                culturalNotes.map((item, idx) => (
                  <div className="mm-culture-note" key={idx}>
                    <span className="mm-chip">{item.note_type || "문화 각주"}</span>
                    <div className="mm-culture-description">{item.speaker_intent}</div>
                  </div>
                ))
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}