import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const USE_DEV_DATA = true;
const PAGE_SIZE = 7;

interface Participant {
  profile_id?: string;
  nickname: string;
  language?: string;
  speaker_index?: number;
}

interface Meeting {
  id: string;
  title: string;
  status: string;
  participant_count?: number;
  started_at?: string;
  ended_at?: string;
  participants?: Participant[];
}

const DEV_MEETINGS: Meeting[] = [
  {
    id: "meeting-1",
    title: "글로벌 프로젝트 킥오프 회의",
    status: "ended",
    participant_count: 3,
    started_at: "2026-08-04T05:00:00Z",
    ended_at: "2026-08-04T05:45:00Z",
    participants: [
      { nickname: "종윤", language: "ko" },
      { nickname: "Minh", language: "vi" },
      { nickname: "James", language: "en" },
    ],
  },
  {
    id: "meeting-2",
    title: "BridgeNote 기능 범위 논의",
    status: "ended",
    participant_count: 4,
    started_at: "2026-08-03T04:00:00Z",
    ended_at: "2026-08-03T05:00:00Z",
    participants: [
      { nickname: "종윤", language: "ko" },
      { nickname: "동균", language: "ko" },
      { nickname: "Minh", language: "vi" },
      { nickname: "James", language: "en" },
    ],
  },
  {
    id: "meeting-3",
    title: "문화 가이드 UI 리뷰",
    status: "ended",
    participant_count: 3,
    started_at: "2026-08-02T07:00:00Z",
    ended_at: "2026-08-02T07:40:00Z",
    participants: [
      { nickname: "동균", language: "ko" },
      { nickname: "수민", language: "ko" },
      { nickname: "James", language: "en" },
    ],
  },
  {
    id: "meeting-4",
    title: "실시간 번역 테스트",
    status: "ended",
    participant_count: 2,
    started_at: "2026-08-01T01:30:00Z",
    ended_at: "2026-08-01T02:15:00Z",
    participants: [
      { nickname: "수민", language: "ko" },
      { nickname: "Minh", language: "vi" },
    ],
  },
];

function getAccessToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

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

function getLocalDateValue(dateString?: string) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function MeetingArchive() {
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keywordInput, setKeywordInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [participantInput, setParticipantInput] = useState("전체");

  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("");
  const [participant, setParticipant] = useState("전체");

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError("");

        if (USE_DEV_DATA) {
          setMeetings(DEV_MEETINGS);
          return;
        }

        const token = getAccessToken();

        if (!token) {
          throw new Error("로그인 정보가 없습니다.");
        }

        const response = await fetch("/api/meetings", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "회의 목록을 불러오지 못했습니다.");
        }

        const list: Meeting[] = Array.isArray(data) ? data : [];

        const endedMeetings = list.filter(
          (meeting) => meeting.status === "ended"
        );

        const detailedMeetings = await Promise.all(
          endedMeetings.map(async (meeting) => {
            try {
              const detailResponse = await fetch(
                `/api/meetings/${meeting.id}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                }
              );

              if (!detailResponse.ok) {
                return {
                  ...meeting,
                  participants: [],
                };
              }

              const detailData = await detailResponse.json();

              return {
                ...meeting,
                participants: detailData.participants || [],
              };
            } catch {
              return {
                ...meeting,
                participants: [],
              };
            }
          })
        );

        detailedMeetings.sort(
          (a, b) =>
            new Date(b.started_at || 0).getTime() -
            new Date(a.started_at || 0).getTime()
        );

        setMeetings(detailedMeetings);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "회의록을 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const participantOptions = useMemo(() => {
    const names = meetings.flatMap((meeting) =>
      (meeting.participants || [])
        .map((item) => item.nickname)
        .filter(Boolean)
    );

    return ["전체", ...Array.from(new Set(names))];
  }, [meetings]);

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const normalizedKeyword = keyword.toLowerCase();

      const keywordMatch =
        !keyword ||
        meeting.title.toLowerCase().includes(normalizedKeyword) ||
        (meeting.participants || []).some((item) =>
          item.nickname.toLowerCase().includes(normalizedKeyword)
        );

      const dateMatch =
        !date || getLocalDateValue(meeting.started_at) === date;

      const participantMatch =
        participant === "전체" ||
        (meeting.participants || []).some(
          (item) => item.nickname === participant
        );

      return keywordMatch && dateMatch && participantMatch;
    });
  }, [meetings, keyword, date, participant]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMeetings.length / PAGE_SIZE)
  );

  const visibleMeetings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMeetings.slice(start, start + PAGE_SIZE);
  }, [filteredMeetings, currentPage]);

  const handleSearch = () => {
    setKeyword(keywordInput.trim());
    setDate(dateInput);
    setParticipant(participantInput);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setKeywordInput("");
    setDateInput("");
    setParticipantInput("전체");

    setKeyword("");
    setDate("");
    setParticipant("전체");
    setCurrentPage(1);
  };

  const handleDetail = (meetingId: string) => {
    navigate(`/meetings/${meetingId}/minutes`);
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#EDECE6] px-6 py-10">
        <div className="mx-auto max-w-[1280px]">
          <h1 className="mb-7 text-[28px] font-semibold text-[#172033]">
            과거 회의록 보관함
          </h1>

          <div className="rounded-2xl border border-[#E0E5E8] bg-white py-24 text-center text-sm text-[#7A8594]">
            회의록을 불러오는 중입니다.
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#EDECE6] px-6 py-10">
        <div className="mx-auto max-w-[1280px]">
          <h1 className="mb-7 text-[28px] font-semibold text-[#172033]">
            과거 회의록 보관함
          </h1>

          <div className="rounded-2xl border border-[#E0E5E8] bg-white py-20 text-center text-sm text-[#E2795F]">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-[calc(100vh-72px)] bg-[#EDECE6] px-6 py-10 text-[#172033] lg:px-10"
    >
      <div className="mx-auto max-w-[1280px]">
        <h1 className="mb-7 text-[28px] font-semibold tracking-[-0.03em]">
          과거 회의록 보관함
        </h1>

        <section className="mb-6 rounded-2xl border border-[#E0E5E8] bg-white p-5">
          <div className="grid gap-3 md:grid-cols-[1.5fr_0.85fr_0.85fr_auto_auto]">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="회의 제목, 참가자 검색"
              className="h-12 rounded-xl border border-[#D8DEE3] px-4 text-sm outline-none focus:border-[#2C7B98]"
            />

            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="h-12 rounded-xl border border-[#D8DEE3] px-4 text-sm outline-none focus:border-[#2C7B98]"
            />

            <select
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
              className="h-12 rounded-xl border border-[#D8DEE3] bg-white px-4 text-sm outline-none focus:border-[#2C7B98]"
            >
              {participantOptions.map((name) => (
                <option key={name} value={name}>
                  {name === "전체" ? "참가자 선택" : name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSearch}
              className="h-12 rounded-xl bg-[#2C7B98] px-7 text-sm font-semibold text-white transition hover:opacity-90"
            >
              검색
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="h-12 rounded-xl border border-[#D8DEE3] bg-white px-5 text-sm font-medium text-[#667281]"
            >
              초기화
            </button>
          </div>
        </section>

        <div className="mb-3 text-sm text-[#657180]">
          총{" "}
          <span className="font-semibold text-[#172033]">
            {filteredMeetings.length}
          </span>
          건
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#E0E5E8] bg-white">
          <div className="hidden grid-cols-[1.7fr_1fr_1.4fr_100px] bg-[#F8FAFB] px-6 py-4 text-sm font-semibold text-[#586475] md:grid">
            <div>회의 제목</div>
            <div>날짜 / 시간</div>
            <div>참가자</div>
            <div />
          </div>

          {visibleMeetings.length > 0 ? (
            visibleMeetings.map((meeting) => {
              const names = (meeting.participants || [])
                .map((item) => item.nickname)
                .filter(Boolean);

              return (
                <div
                  key={meeting.id}
                  className="grid gap-3 border-t border-[#EDF0F2] px-6 py-5 md:grid-cols-[1.7fr_1fr_1.4fr_100px] md:items-center md:gap-0"
                >
                  <div className="font-medium">
                    {meeting.title || "제목 없음"}
                  </div>

                  <div className="text-sm text-[#667281]">
                    {formatDate(meeting.started_at)}
                    <span className="ml-2 text-[#9AA3AE]">
                      {formatTime(meeting.started_at)}
                    </span>
                  </div>

                  <div className="truncate text-sm text-[#667281]">
                    {names.length > 0
                      ? `${names.join(", ")} (${
                          meeting.participant_count ?? names.length
                        }명)`
                      : `참가자 ${meeting.participant_count ?? 0}명`}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDetail(meeting.id)}
                    className="text-left text-sm font-medium text-[#2C7B98] hover:opacity-70 md:text-right"
                  >
                    상세보기 ›
                  </button>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center text-sm text-[#929BA6]">
              검색 조건에 맞는 회의록이 없습니다.
            </div>
          )}
        </section>

        {filteredMeetings.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => Math.max(1, prev - 1))
              }
              className="h-9 w-9 rounded-lg text-[#6F7B88] disabled:opacity-30"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium ${
                    currentPage === page
                      ? "bg-[#2C7B98] text-white"
                      : "text-[#6F7B88]"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              className="h-9 w-9 rounded-lg text-[#6F7B88] disabled:opacity-30"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </main>
  );
}