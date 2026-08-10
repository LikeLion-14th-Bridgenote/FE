import { useState } from "react";

// 담당: 주연
// TODO: useMeetingSocket 훅으로 실시간 데이터 연결 (진수 STOMP 토픽 확정 후)
// 지금은 데모용 정적 데이터로 레이아웃/스타일만 구현된 상태

interface Participant {
  id: string;
  name: string;
  lang: string;
  isMe: boolean;
}

interface CulturalNote {
  speakerIntent: string;
  listenerMisread: string;
  advice: string;
}

interface SubtitleLine {
  id: string;
  speakerId: string;
  speakerName: string;
  main: string;
  sub?: string;
  note?: CulturalNote;
}

const participants: Participant[] = [
  { id: "p1", name: "장주연", lang: "KR", isMe: true },
  { id: "p2", name: "Diep", lang: "VN", isMe: false },
  { id: "p3", name: "John", lang: "US", isMe: false },
];

const subtitles: SubtitleLine[] = [
  {
    id: "s1",
    speakerId: "p1",
    speakerName: "장주연 · KR",
    main: "그 부분은 검토해보겠습니다.",
    note: {
      speakerIntent: "신중한 유보, 즉답 회피",
      listenerMisread: "긍정 신호로 오독 가능",
      advice: "구체적 기한을 되물어 확인",
    },
  },
  {
    id: "s2",
    speakerId: "p2",
    speakerName: "Diep · VN",
    main: "네, 이해했습니다.",
    sub: "Vâng, tôi hiểu rồi.",
  },
  {
    id: "s3",
    speakerId: "p3",
    speakerName: "John · US",
    main: "좋아요, 그럼 승인된 거죠?",
    sub: "Great, so is this approved then?",
    note: {
      speakerIntent: "확인 차 가볍게 되물음",
      listenerMisread: "확정 승인으로 단정할 위험",
      advice: "\"승인\"이 아닌 \"검토\" 단계임을 재확인",
    },
  },
];

export default function MeetingRoom() {
  const [currentSpeaker, setCurrentSpeaker] = useState("p1");
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#EDECE9] flex flex-col">
      {/* 회의 자체 헤더 (공통 Navbar 아님) */}
      <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold">쭈&apos;s 회의</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>경과 12:34 · 실시간 처리 중</span>
          </div>
        </div>
        <button className="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
          회의 종료
        </button>
      </header>

      {/* 참가자 아바타 스트립 (발화자 전환 겸용) */}
      <div className="flex items-center gap-6 px-6 py-4 bg-white/60 border-b border-gray-100">
        {participants.map((p) => (
          <button
            key={p.id}
            onClick={() => setCurrentSpeaker(p.id)}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div
              className={`relative w-11 h-11 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                p.isMe ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
              } ${currentSpeaker === p.id ? "ring-2 ring-primary ring-offset-2 animate-pulse" : "group-hover:ring-2 group-hover:ring-gray-200"}`}
            >
              {p.isMe ? "나" : p.lang}
            </div>
            <span className="text-xs text-gray-500">{p.name}</span>
          </button>
        ))}
        {currentSpeaker && (
          <div className="flex items-end gap-0.5 h-5 ml-1">
            {[6, 12, 18, 10, 7].map((h, i) => (
              <span
                key={i}
                className="w-0.5 bg-primary rounded-full animate-pulse"
                style={{ height: h, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 자막 피드 */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-3 max-w-2xl mx-auto w-full">
        {subtitles.map((line) => {
          const isMe = participants.find((p) => p.id === line.speakerId)?.isMe;
          return (
            <div key={line.id} className={`max-w-[80%] ${isMe ? "self-end" : "self-start"}`}>
              <div
                className={`rounded-2xl px-4 py-2.5 ${
                  isMe ? "bg-primary/10" : "bg-white border border-gray-100"
                } ${line.note ? "cursor-pointer" : ""}`}
                onClick={() => line.note && setOpenNoteId(openNoteId === line.id ? null : line.id)}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[11px] font-medium text-gray-400">
                    {isMe ? `나 · ${line.speakerName}` : line.speakerName}
                  </span>
                  {line.note && <span className="text-accent text-xs">⚠</span>}
                </div>
                <p className="text-sm text-gray-800">{line.main}</p>
                {line.sub && <p className="text-xs text-gray-400 mt-0.5">{line.sub}</p>}
              </div>

              {line.note && openNoteId === line.id && (
                <div className="mt-1.5 rounded-xl border-l-2 border-accent bg-accent/5 px-3 py-2.5 text-xs space-y-1.5">
                  <div>
                    <p className="text-gray-400">화자 의도</p>
                    <p className="text-gray-700">{line.note.speakerIntent}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">수신자 오해 소지</p>
                    <p className="text-gray-700">{line.note.listenerMisread}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">권장 대응</p>
                    <p className="text-gray-700">{line.note.advice}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
