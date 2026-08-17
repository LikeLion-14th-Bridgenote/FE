import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


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

  .mm-page {
    padding: 32px 40px 80px;
  }
}

@media (max-width: 860px) {
  .mm-transcript-head {
    display: none;
  }

  .mm-turn-grid {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

@media (max-width: 820px) {
  .mm-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 720px) {
  .mm-table-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

`;


type UiText = {
  dec: string;
  dis: string;
  act: string;
  task: string;
  owner: string;
  due: string;
  tr: string;
  none: string;
  persp: string;
  digest: string;
  count: (n: number) => string;
  more: string;
};

type ActionItem = {
  t: string;
  o: string;
  d: string | null;
};

type MeetingData = {
  dec: string[];
  dis: string[];
  act: ActionItem[];
};

type CultureNote = {
  cat: string;
  q: string;
  d: string;
};

type TranscriptCultureNote = {
  cat: string;
  intent: string;
  misread: string;
  advice: string;
  rewrite: string;
};

type TranscriptItem = {
  time: string;
  who: string;
  src: string;
  tr: Partial<Record<Lang, string>>;
  note?: TranscriptCultureNote;
};

type TabItem = {
  key: TabKey;
  label: string;
  count?: number;
};

type RoleItem = {
  key: RoleKey;
  label: string;
};

const UI: Record<Lang, UiText> = {
  ko: {
    dec: "결정",
    dis: "논의",
    act: "액션 아이템",
    task: "할 일",
    owner: "담당자",
    due: "기한",
    tr: "번역문",
    none: "미정",
    persp: "관점 핵심 요약",
    digest: "이 회의의 결정",
    count: (n) => `${n}건`,
    more: "논의·액션 아이템도 보기 →",
  },
  en: {
    dec: "Decisions",
    dis: "Discussions",
    act: "Action items",
    task: "Task",
    owner: "Owner",
    due: "Due",
    tr: "Translation",
    none: "—",
    persp: "summary",
    digest: "Decisions from this meeting",
    count: (n) => `${n}`,
    more: "See discussions & action items →",
  },
  vi: {
    dec: "Quyết định",
    dis: "Thảo luận",
    act: "Việc cần làm",
    task: "Việc",
    owner: "Phụ trách",
    due: "Hạn",
    tr: "Bản dịch",
    none: "—",
    persp: "tóm tắt",
    digest: "Quyết định của cuộc họp",
    count: (n) => `${n}`,
    more: "Xem thảo luận & việc cần làm →",
  },
};

const ROLE_LABEL: Record<RoleKey, Record<Lang, string>> = {
  dev: { ko: "개발", en: "Dev", vi: "Kỹ thuật" },
  design: { ko: "디자인", en: "Design", vi: "Thiết kế" },
  pm: { ko: "PM", en: "PM", vi: "PM" },
  sales: { ko: "영업", en: "Sales", vi: "Kinh doanh" },
};

const DATA: Record<Lang, MeetingData> = {
  ko: {
    dec: [
      "금요일까지 1차 기능 개발을 완료하기로 결정했습니다.",
      "실시간 번역 기능을 MVP 범위에 포함하기로 결정했습니다.",
      "회의록 자동 생성은 회의 종료 후 배치 처리하기로 했습니다.",
    ],
    dis: [
      "로그인 UI는 디자인 시안 확정 후 착수하기로 논의했습니다.",
      "한국·베트남 팀 일정은 시차 없는 오전대를 우선합니다.",
    ],
    act: [
      { t: "로그인 API 마무리", o: "종윤", d: "금요일" },
      { t: "로그인 UI 구현", o: "Minh", d: null },
      { t: "디자인 시안 공유", o: "수민", d: "수요일" },
      { t: "번역 품질 점검", o: "종윤", d: "다음 주" },
    ],
  },
  en: {
    dec: [
      "Complete the first round of feature development by Friday.",
      "Include real-time translation in the MVP scope.",
      "Generate minutes as a batch job after the meeting ends.",
    ],
    dis: [
      "Start the login UI only after the design draft is confirmed.",
      "Prefer morning slots with no time difference for the KR–VN schedule.",
    ],
    act: [
      { t: "Finish the login API", o: "종윤", d: "Friday" },
      { t: "Build the login UI", o: "Minh", d: null },
      { t: "Share the design draft", o: "수민", d: "Wednesday" },
      { t: "Review translation quality", o: "종윤", d: "Next week" },
    ],
  },
  vi: {
    dec: [
      "Hoàn thành đợt phát triển tính năng đầu tiên trước thứ Sáu.",
      "Đưa dịch thời gian thực vào phạm vi MVP.",
      "Tạo biên bản theo lô sau khi cuộc họp kết thúc.",
    ],
    dis: [
      "Chỉ bắt đầu giao diện đăng nhập sau khi chốt bản thiết kế.",
      "Ưu tiên buổi sáng không lệch múi giờ cho lịch KR–VN.",
    ],
    act: [
      { t: "Hoàn thành API đăng nhập", o: "종윤", d: "Thứ Sáu" },
      { t: "Làm giao diện đăng nhập", o: "Minh", d: null },
      { t: "Chia sẻ bản thiết kế", o: "수민", d: "Thứ Tư" },
      { t: "Kiểm tra chất lượng dịch", o: "종윤", d: "Tuần sau" },
    ],
  },
};

const ROLES: Record<RoleKey, Record<Lang, string[]>> = {
  dev: {
    ko: [
      "로그인 API는 금요일 마감. UI(Minh)와 인터페이스 계약을 먼저 맞출 것.",
      "디자인 시안(수요일) 확정 전에는 UI 착수를 보류.",
    ],
    en: [
      "Login API is due Friday; align the interface contract with UI (Minh) first.",
      "Hold UI work until the design draft (Wed) is confirmed.",
    ],
    vi: [
      "API đăng nhập hạn thứ Sáu; thống nhất giao diện với UI (Minh) trước.",
      "Hoãn phần UI cho tới khi chốt bản thiết kế (thứ Tư).",
    ],
  },
  design: {
    ko: [
      "디자인 시안을 수요일에 공유 — 로그인 UI 착수의 선행 조건.",
      "시안 확정이 전체 일정의 크리티컬 패스.",
    ],
    en: [
      "Share the design draft on Wednesday — prerequisite for the login UI.",
      "Draft sign-off is the critical path for the schedule.",
    ],
    vi: [
      "Chia sẻ bản thiết kế vào thứ Tư — điều kiện để bắt đầu UI.",
      "Chốt thiết kế là đường găng của tiến độ.",
    ],
  },
  pm: {
    ko: [
      "담당·마감 확정(API 금요일, 시안 수요일). 다음 회의 금요일 15:00.",
      "한↔베 일정은 시차 없는 오전대를 우선.",
    ],
    en: [
      "Owners and deadlines set (API Fri, draft Wed). Next meeting Fri 15:00.",
      "Prefer morning slots for the KR–VN schedule.",
    ],
    vi: [
      "Đã chốt phụ trách và hạn (API T6, thiết kế T4). Họp tiếp T6 15:00.",
      "Ưu tiên buổi sáng cho lịch KR–VN.",
    ],
  },
  sales: {
    ko: [
      "이번 회의는 내부 일정 중심 — 영업 관련 액션 없음.",
      "고객 대상 마일스톤 공유는 시안 확정 후 논의 예정.",
    ],
    en: [
      "This meeting focused on the internal schedule — no sales actions.",
      "Client-facing milestone sharing to be discussed after draft sign-off.",
    ],
    vi: [
      "Cuộc họp tập trung lịch nội bộ — không có việc cho sales.",
      "Chia sẻ mốc cho khách sẽ bàn sau khi chốt thiết kế.",
    ],
  },
};

const CULTURE: CultureNote[] = [
  {
    cat: "문화 이해",
    q: "금요일까지는 조금 어려울 것 같습니다.",
    d: "간접적인 표현으로 일정 준수가 어렵다는 의미를 전달한 것으로 해석될 수 있습니다.",
  },
  {
    cat: "문화 이해",
    q: "한번 검토해보겠습니다.",
    d: "긍정적인 확답보다 추가 검토가 필요하다는 의미로 사용되었을 가능성이 있습니다.",
  },
  {
    cat: "커뮤니케이션",
    q: "이 부분은 다시 수정해주세요.",
    d: "문화권에 따라 비교적 직접적인 지시로 받아들여질 수 있습니다.",
  },
  {
    cat: "업무 스타일",
    q: "담당자가 확인하고 공유해주세요.",
    d: "담당자와 완료 시점을 구체적으로 지정하면 실행 과정의 혼선을 줄일 수 있습니다.",
  },
  {
    cat: "커뮤니케이션",
    q: "좋은 것 같습니다.",
    d: "동의인지 단순한 긍정적 반응인지 추가 확인이 필요할 수 있습니다.",
  },
  {
    cat: "문화 이해",
    q: "가능하면 오늘 중으로 부탁드립니다.",
    d: "상대 문화권에 따라 요청의 강도가 다르게 해석될 수 있습니다.",
  },
];

const TRANSCRIPT: TranscriptItem[] = [
  {
    time: "00:08",
    who: "종윤",
    src: "로그인 API는 금요일까지 제가 마무리하겠습니다.",
    tr: {
      en: "I'll finish the login API by Friday.",
      vi: "Tôi sẽ hoàn thành API đăng nhập trước thứ Sáu.",
    },
  },
  {
    time: "01:52",
    who: "Minh",
    src: "Tôi sẽ cố gắng hết sức để làm phần giao diện.",
    tr: {
      ko: "제가 화면 쪽은 최선을 다해 보겠습니다.",
      en: "I'll try my best on the interface.",
    },
    note: {
      cat: "커뮤니케이션",
      intent: "최선을 다하겠다는 의지 표현",
      misread: "한국 청자는 확답 회피나 실패 여지로 해석할 수 있습니다",
      advice: "완료 조건과 기한을 함께 물어 확정하세요",
      rewrite: "제가 수요일까지 초안, 금요일까지 완성하는 것을 목표로 하겠습니다.",
    },
  },
  {
    time: "03:41",
    who: "수민",
    src: "네, 검토해보겠습니다.",
    tr: {
      en: "Yes, I'll review it.",
      vi: "Vâng, tôi sẽ xem xét.",
    },
    note: {
      cat: "문화 이해",
      intent: "확답이 아닌 유보 — 진행 여부가 열려 있음",
      misread: "미국·베트남 청자는 승인이나 약속으로 오독할 수 있습니다",
      advice: "구체적인 기한을 되물어 확인하세요",
      rewrite: "검토가 필요합니다 — 언제까지 회신드리면 될까요?",
    },
  },
  {
    time: "05:20",
    who: "종윤",
    src: "그럼 다음 회의는 금요일 오후 3시로 하겠습니다.",
    tr: {
      en: "Then let's meet again Friday at 3 PM.",
      vi: "Vậy họp tiếp vào 3 giờ chiều thứ Sáu.",
    },
  },
];

const TAB_ITEMS: TabItem[] = [
  { key: "tr", label: "전체 전사 기록" },
  { key: "dec", label: "결정", count: 3 },
  { key: "dis", label: "논의", count: 2 },
  { key: "act", label: "액션 아이템", count: 4 },
  { key: "role", label: "관점별 핵심 요약" },
  { key: "cul", label: "문화 가이드", count: 6 },
];

const ROLE_ITEMS: RoleItem[] = [
  { key: "dev", label: "개발" },
  { key: "design", label: "디자인" },
  { key: "pm", label: "PM" },
  { key: "sales", label: "영업" },
];

type Lang = "ko" | "en" | "vi";
type TabKey = "tr" | "dec" | "dis" | "act" | "role" | "cul";
type RoleKey = "dev" | "design" | "pm" | "sales";

export default function MeetingMinutes() {
  const navigate = useNavigate();

  const [lang, setLang] = useState<Lang>("ko");
  const [activeTab, setActiveTab] = useState<TabKey>("tr");
  const [role, setRole] = useState<RoleKey>("dev");
  const [digestOpen, setDigestOpen] = useState(true);

  const ui = UI[lang];
  const data = DATA[lang];

  const transcriptRows = useMemo(
    () =>
      TRANSCRIPT.map((item) => ({
        ...item,
        translated: item.tr?.[lang] || "-",
      })),
    [lang]
  );

  return (
    <div className="meeting-minutes-page" lang={lang}>
      <style>{MEETING_MINUTES_STYLES}</style>
      <main className="mm-page">
        <div className="mm-wrap">
          <section className="mm-info">
            <div className="mm-title-row">
              <div>
                <button
                  className="mm-back"
                  type="button"
                  onClick={() => navigate("/archive")}
                >
                  ← 회의록 목록
                </button>

                <h1>글로벌 프로젝트 킥오프 회의</h1>

                <div className="mm-meta">
                  <span>📅 2026.08.04</span>
                  <span>14:00</span>
                  <span>⏱ 45분</span>
                  <span>참가자 3명</span>
                </div>
              </div>

              <div className="mm-lang-row">
                <span className="mm-lang-label">표시 언어</span>
                <select
                  value={lang}
                  aria-label="표시 언어"
                  onChange={(e) => setLang(e.target.value as Lang)}
                >
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
                {tab.count ? <span className="mm-tab-count">{tab.count}</span> : null}
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
                  <span className="mm-digest-count">{ui.count(data.dec.length)}</span>
                  <span className="mm-digest-arrow">▾</span>
                </button>

                {digestOpen && (
                  <div className="mm-digest-body">
                    <ul>
                      {data.dec.map((item) => (
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

                {transcriptRows.map((item) => (
                  <div className="mm-turn" key={`${item.time}-${item.who}`}>
                    <div className="mm-turn-grid">
                      <div className="mm-time">{item.time}</div>
                      <div className="mm-who">{item.who}</div>
                      <div className="mm-source">{item.src}</div>
                      <div className="mm-translation">{item.translated}</div>
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
                ))}
              </div>
            </section>
          )}

          {activeTab === "dec" && (
            <section className="mm-panel">
              <h2>
                {ui.dec} ({data.dec.length})
              </h2>

              {data.dec.map((item) => (
                <div className="mm-card" key={item}>
                  {item}
                </div>
              ))}
            </section>
          )}

          {activeTab === "dis" && (
            <section className="mm-panel">
              <h2>
                {ui.dis} ({data.dis.length})
              </h2>

              {data.dis.map((item) => (
                <div className="mm-card" key={item}>
                  {item}
                </div>
              ))}
            </section>
          )}

          {activeTab === "act" && (
            <section className="mm-panel">
              <h2>
                {ui.act} ({data.act.length})
              </h2>

              <div className="mm-tablebox">
                <div className="mm-table-row mm-table-head">
                  <div>{ui.task}</div>
                  <div>{ui.owner}</div>
                  <div>{ui.due}</div>
                </div>

                {data.act.map((item) => (
                  <div className="mm-table-row" key={`${item.t}-${item.o}`}>
                    <div>{item.t}</div>
                    <div className="mm-owner">{item.o}</div>
                    <div className="mm-due">{item.d || ui.none}</div>
                  </div>
                ))}
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

              {ROLES[role][lang].map((item) => (
                <div className="mm-card" key={item}>
                  {item}
                </div>
              ))}
            </section>
          )}

          {activeTab === "cul" && (
            <section className="mm-panel">
              <h2>문화 각주 통계</h2>

              <div className="mm-stats">
                <div className="mm-stat">
                  <div className="mm-stat-label">전체 각주</div>
                  <div className="mm-stat-value">
                    6<span>개</span>
                  </div>
                </div>

                <div className="mm-stat">
                  <div className="mm-stat-label">문화 이해</div>
                  <div className="mm-stat-value">
                    3<span>개</span>
                  </div>
                </div>

                <div className="mm-stat">
                  <div className="mm-stat-label">커뮤니케이션</div>
                  <div className="mm-stat-value">
                    2<span>개</span>
                  </div>
                </div>

                <div className="mm-stat">
                  <div className="mm-stat-label">업무 스타일</div>
                  <div className="mm-stat-value">
                    1<span>개</span>
                  </div>
                </div>
              </div>

              <h2>유형별 각주 개수</h2>

              <div className="mm-barbox">
                <CultureBar label="문화 이해" width="100%" count="3개" />
                <CultureBar label="커뮤니케이션" width="66%" count="2개" />
                <CultureBar label="업무 스타일" width="33%" count="1개" />
              </div>

              {CULTURE.map((item) => (
                <div className="mm-culture-note" key={`${item.cat}-${item.q}`}>
                  <span className="mm-chip">{item.cat}</span>
                  <div className="mm-culture-quote">"{item.q}"</div>
                  <div className="mm-culture-description">{item.d}</div>
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

type CultureBarProps = {
  label: string;
  width: string;
  count: string;
};

function CultureBar({ label, width, count }: CultureBarProps) {
  return (
    <div className="mm-bar">
      <span>{label}</span>
      <div className="mm-track">
        <div className="mm-fill" style={{ width }} />
      </div>
      <span className="mm-bar-count">{count}</span>
    </div>
  );
}