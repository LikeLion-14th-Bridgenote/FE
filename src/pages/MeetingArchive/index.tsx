import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { meetingApi } from "../../apis/meetingApi";

const PAGE_SIZE = 7;

interface Meeting {
  id: string;
  title: string;
  status: string;
  participant_count?: number;
  started_at?: string;
  ended_at?: string;
}

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date(dateString))
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
}

function formatTime(dateString?: string) {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }).format(
    new Date(dateString)
  );
}

function getLocalDateValue(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function MeetingArchive() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keywordInput, setKeywordInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await meetingApi.getList();
        const ended = (res.data as Meeting[]).filter((m) => m.status === "ended");
        ended.sort(
          (a, b) => new Date(b.started_at || 0).getTime() - new Date(a.started_at || 0).getTime()
        );
        setMeetings(ended);
      } catch (err) {
        setError("회의록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, [accessToken]);

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const keywordMatch = !keyword || meeting.title.toLowerCase().includes(keyword.toLowerCase());
      const dateMatch = !date || getLocalDateValue(meeting.started_at) === date;
      return keywordMatch && dateMatch;
    });
  }, [meetings, keyword, date]);

  const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / PAGE_SIZE));
  const visibleMeetings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMeetings.slice(start, start + PAGE_SIZE);
  }, [filteredMeetings, currentPage]);

  const handleSearch = () => {
    setKeyword(keywordInput.trim());
    setDate(dateInput);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setKeywordInput("");
    setDateInput("");
    setKeyword("");
    setDate("");
    setCurrentPage(1);
  };

  const handleDetail = (meetingId: string) => navigate(`/meetings/${meetingId}/minutes`);

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[#EDECE6] px-6 py-10">
        <div className="mx-auto max-w-[1280px]">
          <h1 className="mb-7 text-[28px] font-semibold text-[#172033]">과거 회의록 보관함</h1>
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
          <h1 className="mb-7 text-[28px] font-semibold text-[#172033]">과거 회의록 보관함</h1>
          <div className="rounded-2xl border border-[#E0E5E8] bg-white py-20 text-center text-sm text-[#E2795F]">
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#EDECE6] px-6 py-10 text-[#172033] lg:px-10">
      <div className="mx-auto max-w-[1280px]">
        <h1 className="mb-7 text-[28px] font-semibold tracking-[-0.03em]">과거 회의록 보관함</h1>

        <section className="mb-6 rounded-2xl border border-[#E0E5E8] bg-white p-5">
          <div className="grid gap-3 md:grid-cols-[1.5fr_0.85fr_auto_auto]">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="회의 제목 검색"
              className="h-12 rounded-xl border border-[#D8DEE3] px-4 text-sm text-[#172033] outline-none focus:border-[#2C7B98]"
            />
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="h-12 rounded-xl border border-[#D8DEE3] px-4 text-sm text-[#172033] outline-none focus:border-[#2C7B98]"
            />
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
          총 <span className="font-semibold text-[#172033]">{filteredMeetings.length}</span>건
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#E0E5E8] bg-white">
          <div className="hidden grid-cols-[1.7fr_1fr_1.4fr_100px] bg-[#F8FAFB] px-6 py-4 text-sm font-semibold text-[#586475] md:grid">
            <div>회의 제목</div>
            <div>날짜 / 시간</div>
            <div>참가자</div>
            <div />
          </div>
          {visibleMeetings.length > 0 ? (
            visibleMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="grid gap-3 border-t border-[#EDF0F2] px-6 py-5 md:grid-cols-[1.7fr_1fr_1.4fr_100px] md:items-center md:gap-0"
              >
                <div className="font-medium">{meeting.title || "제목 없음"}</div>
                <div className="text-sm text-[#667281]">
                  {formatDate(meeting.started_at)}
                  <span className="ml-2 text-[#9AA3AE]">{formatTime(meeting.started_at)}</span>
                </div>
                <div className="truncate text-sm text-[#667281]">참가자 {meeting.participant_count ?? 0}명</div>
                <button
                  type="button"
                  onClick={() => handleDetail(meeting.id)}
                  className="text-left text-sm font-medium text-[#2C7B98] hover:opacity-70 md:text-right"
                >
                  상세보기 ›
                </button>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-sm text-[#929BA6]">검색 조건에 맞는 회의록이 없습니다.</div>
          )}
        </section>

        {filteredMeetings.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="h-9 w-9 rounded-lg text-[#6F7B88] disabled:opacity-30"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium ${
                  currentPage === page ? "bg-[#2C7B98] text-white" : "text-[#6F7B88]"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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