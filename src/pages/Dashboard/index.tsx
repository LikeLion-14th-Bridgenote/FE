import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 담당: 주연
// TODO: meetingApi.getArchive()로 실제 최근 회의록 목록 연동
// TODO: userApi.getProfile()로 실제 사용자 이름 연동

const RECENT_MEETINGS = [
  { id: "1", title: "한/영/베 3자 컬래버 킥오프", date: "2026.07.29", count: 3, notes: 2 },
  { id: "2", title: "한/영/베 3자 컬래버 킥오프", date: "2026.07.29", count: 3, notes: 0 },
  { id: "3", title: "한/영/베 3자 컬래버 킥오프", date: "2026.07.29", count: 3, notes: 1 },
];

const STATS = [
  { label: "이번 달 진행한 회의", value: "3건" },
  { label: "감지된 문화 각주", value: "12건" },
  { label: "참여한 회의 참가자", value: "8명" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "오늘도 수고 많으세요";
  return "오늘 하루도 고생하셨어요";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [inviteLink, setInviteLink] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const id = inviteLink.trim().split("/").pop();
    if (id) navigate(`/meetings/${id}/join`);
  };

  return (
    <div className="min-h-screen bg-[#EDECE6] px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* 인사말 */}
        <p className="text-xl font-semibold text-gray-900 mb-1">{getGreeting()}, 주연님</p>
        <p className="text-sm text-gray-400 mb-8">오늘도 문화적 오해 없이 매끄러운 회의 되세요</p>

        {/* 요약 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-2xl font-bold text-primary mb-1">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
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
            {RECENT_MEETINGS.map((m, i) => (
              <button
                key={m.id}
                onClick={() => navigate(`/meetings/${m.id}/minutes`)}
                className={`w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors ${
                  i !== RECENT_MEETINGS.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {m.date} · 참가자 {m.count}명
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {m.notes > 0 && (
                    <span className="text-[11px] font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                      각주 {m.notes}건
                    </span>
                  )}
                  <span className="text-gray-300">›</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}