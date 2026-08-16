import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../apis/userApi";
import { meetingApi } from "../../apis/meetingApi";
import { useAuthStore } from "../../stores/authStore";

// 담당: 주연
// TODO: 각주 개수, 참가자 수 통계는 집계 API가 명세서에 없어서 보류 (팀에 확인 필요)

interface MeetingListItem {
  id: string;
  title: string;
  status: string;
  participant_count: number;
  started_at: string;
  ended_at?: string;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "오늘도 수고 많으세요";
  return "오늘 하루도 고생하셨어요";
}

function isThisMonth(dateString: string) {
  const d = new Date(dateString);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [inviteLink, setInviteLink] = useState("");
  const [nickname, setNickname] = useState("");
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 30); // 30초마다 갱신
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    const loadData = async () => {
      try {
        const [profileRes, meetingsRes] = await Promise.all([
          userApi.getProfile(),
          meetingApi.getList(),
        ]);
        setNickname(profileRes.data.nickname);
        setMeetings(meetingsRes.data);
      } catch (e) {
        // 실패해도 화면은 최대한 보여줌
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [accessToken]);

  const meetingsThisMonth = meetings.filter((m) => isThisMonth(m.started_at)).length;
  const recentMeetings = [...meetings]
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
    .slice(0, 5);

  const todayLabel = now.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  const timeLabel = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const id = inviteLink.trim().split("/").pop();
    if (id) navigate(`/meetings/${id}/join`);
  };

  return (
    <div className="min-h-screen bg-[#EDECE6] px-4 pt-6 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* 인사말 + 날짜/시간/이번달 회의 */}
        <div className="flex flex-col sm:flex-row sm:items-stretch sm:justify-between gap-4 mb-10">
          <div className="flex flex-col justify-center">
            <p className="text-xl font-semibold text-gray-900 mb-1">
              {getGreeting()}{nickname ? `, ${nickname}님` : ""}
            </p>
            <p className="text-sm text-gray-400">오늘도 문화적 오해 없이 매끄러운 회의 되세요</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm px-6 py-4 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 min-w-[180px]">
            <div className="sm:text-right">
              <p className="text-xs text-gray-400">{todayLabel}</p>
              <p className="text-xl font-bold text-primary tabular-nums">{timeLabel}</p>
            </div>
            <div className="h-px w-full bg-gray-100 hidden sm:block my-1" />
            <p className="text-xs text-gray-500">
              이번 달 <span className="text-primary font-semibold">{loading ? "-" : `${meetingsThisMonth}건`}</span>
            </p>
          </div>
        </div>

        {/* 회의 시작 / 참여 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">회의 시작</p>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-sm font-semibold text-gray-900 mb-1">새 회의 만들기</p>
              <p className="text-xs text-gray-400 mb-4">회의 생성 후 링크 공유</p>
              <button
                onClick={() => navigate("/meetings/new")}
                className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                회의 생성
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">회의 참여</p>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-sm font-semibold text-gray-900 mb-1">링크로 회의 참여</p>
              <p className="text-xs text-gray-400 mb-4">전달받은 회의 링크 입력하기</p>
              <form onSubmit={handleJoin} className="flex gap-2">
                <input
                  value={inviteLink}
                  onChange={(e) => setInviteLink(e.target.value)}
                  placeholder="회의 링크 입력"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  입장하기
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 최근 회의록 */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">최근 회의록</p>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <p className="text-sm text-gray-400 px-5 py-8 text-center">불러오는 중...</p>
            ) : recentMeetings.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-400 mb-3">아직 참여한 회의가 없습니다</p>
                <button
                  onClick={() => navigate("/meetings/new")}
                  className="text-sm text-primary font-medium underline"
                >
                  첫 회의를 만들어보세요
                </button>
              </div>
            ) : (
              recentMeetings.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => navigate(`/meetings/${m.id}/minutes`)}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors ${
                    i !== recentMeetings.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(m.started_at).toLocaleDateString("ko-KR")} · 참가자 {m.participant_count}명
                    </p>
                  </div>
                  <span className="text-gray-300">›</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}