import { useState } from "react";

// 담당: 주연
// TODO: useMeetingSocket 훅으로 실시간 데이터 연결 (진수 STOMP 토픽 확정 후)
//
// 레이아웃: lg(1024px) 이상 = 2단(피드+문화경고 상시 노출)
//           lg 미만(모바일) = 1단, 경고 아이콘 클릭 시 문장 아래로 펼쳐짐
//
// 발화자 파동 효과(SpeakingRing): 지금은 currentSpeaker 상태만 보고 켜지는
// 장식용 애니메이션. 실제 마이크 볼륨에 반응하게 하려면 Web Audio API의
// AnalyserNode로 볼륨을 읽어서 파동 강도/속도에 매핑하면 됨 (2차 개선 과제).

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
  speakerLabel: string;
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
    speakerLabel: "나",
    speakerName: "장주연 · KR",
    main: "그 부분은 검토해보겠습니다.",
    note: {
      speakerIntent: "신중한 유보, 즉답 회피",
      listenerMisread: "긍정 신호로 오독될 수 있음",
      advice: "기한을 구체적으로 되짚어 말해보기",
    },
  },
  {
    id: "s2",
    speakerId: "p2",
    speakerLabel: "Diep",
    speakerName: "Diep · VN",
    main: "네, 이해했습니다.",
    sub: "Vâng, tôi hiểu rồi.",
  },
  {
    id: "s3",
    speakerId: "p3",
    speakerLabel: "John",
    speakerName: "John · US",
    main: "좋아요, 그럼 승인된 거죠?",
    sub: "Great, so is this approved then?",
    note: {
      speakerIntent: "확인 차 가볍게 되물음",
      listenerMisread: "이미 확정 승인된 것으로 단정할 위험",
      advice: "아직 검토 단계임을 다시 짚어주기",
    },
  },
];

function NoteCard({ line }: { line: SubtitleLine }) {
  if (!line.note) return null;
  const isMe = participants.find((p) => p.id === line.speakerId)?.isMe;
  const misreadLabel = isMe ? "수신자 오해 소지" : "내가 오해할 소지";

  return (
    <div className="rounded-lg border border-red-100 border-l-4 border-l-accent bg-white px-3.5 py-3 text-xs space-y-2.5">
      <div>
        <p className="text-gray-400 mb-0.5">화자 의도 ({line.speakerLabel})</p>
        <p className="text-gray-800 font-medium">{line.note.speakerIntent}</p>
      </div>
      <div>
        <p className="text-gray-400 mb-0.5">{misreadLabel}</p>
        <p className="text-gray-800 font-medium">{line.note.listenerMisread}</p>
      </div>
      <div>
        <p className="text-gray-400 mb-0.5">권장 대응</p>
        <p className="text-gray-800 font-medium">{line.note.advice}</p>
      </div>
    </div>
  );
}

// 발화 중일 때 아바타 뒤에서 퍼지는 파동 링 2겹 (시차를 둬서 계속 퍼져나가는 느낌)
function SpeakingRing() {
  return (
    <>
      <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
      <span
        className="absolute inset-0 rounded-full bg-primary/10 animate-ping"
        style={{ animationDelay: "0.5s" }}
      />
    </>
  );
}

export default function MeetingRoom() {
  const [currentSpeaker, setCurrentSpeaker] = useState("p1");
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const notedLines = subtitles.filter((l) => l.note);

  return (
    <div className="min-h-screen bg-[#EDECE9] flex flex-col">
      {/* 회의 자체 헤더 */}
      <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold">쭈&apos;s 회의 - 2026.08.05 14:30</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>경과 12:34</span>
          </div>
        </div>
        <button className="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
          회의 종료
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* 참가자 아바타 스트립 (좌측 세로형, 데스크톱만) */}
        <div className="hidden lg:flex flex-col items-center gap-5 w-20 py-6 bg-white/60 border-r border-gray-100">
          <span className="text-[10px] text-gray-400 text-center leading-tight mb-1">
            아바타 클릭 시<br />발화자 전환
          </span>
          {participants.map((p) => {
            const isSpeaking = currentSpeaker === p.id;
            return (
              <button key={p.id} onClick={() => setCurrentSpeaker(p.id)} className="flex flex-col items-center gap-1 group">
                <div className="relative w-11 h-11">
                  {isSpeaking && <SpeakingRing />}
                  <div
                    className={`relative w-11 h-11 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      p.isMe ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                    } ${isSpeaking ? "ring-2 ring-primary" : "group-hover:ring-2 group-hover:ring-gray-200"}`}
                  >
                    {p.isMe ? "나" : p.lang}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                </div>
                <span className="text-[11px] text-gray-500">{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* 모바일 전용 상단 아바타 스트립 (가로형) */}
        <div className="lg:hidden fixed top-16 left-0 right-0 z-10 flex items-center gap-5 px-4 py-2.5 bg-white/90 backdrop-blur-sm border-b border-gray-100 overflow-x-auto">
          {participants.map((p) => {
            const isSpeaking = currentSpeaker === p.id;
            return (
              <button key={p.id} onClick={() => setCurrentSpeaker(p.id)} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="relative w-9 h-9">
                  {isSpeaking && <SpeakingRing />}
                  <div
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                      p.isMe ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                    } ${isSpeaking ? "ring-2 ring-primary" : ""}`}
                  >
                    {p.isMe ? "나" : p.lang}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 자막 피드 */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 lg:py-8 pt-16 lg:pt-8 flex flex-col gap-3 max-w-2xl mx-auto w-full">
          {subtitles.map((line) => {
            const isMe = participants.find((p) => p.id === line.speakerId)?.isMe;
            return (
              <div key={line.id} className={`max-w-[85%] lg:max-w-[75%] ${isMe ? "self-end" : "self-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 ${isMe ? "bg-primary/10" : "bg-white border border-gray-100"} ${
                    line.note ? "lg:cursor-default cursor-pointer" : ""
                  }`}
                  onClick={() => line.note && setOpenNoteId(openNoteId === line.id ? null : line.id)}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[11px] font-medium text-gray-400">
                      {isMe ? `나 (${line.speakerName})` : line.speakerName}
                    </span>
                    {line.note && <span className="text-accent text-xs">⚠</span>}
                  </div>
                  <p className="text-sm text-gray-800">{line.main}</p>
                  {line.sub && <p className="text-xs text-gray-400 mt-0.5">{line.sub}</p>}
                </div>

                {line.note && openNoteId === line.id && (
                  <div className="lg:hidden mt-1.5">
                    <NoteCard line={line} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 문화 경고 패널 - 데스크톱만 */}
        <aside className="hidden lg:flex flex-col gap-3 w-80 px-5 py-6 border-l border-gray-100 bg-white/40 overflow-y-auto">
          <p className="text-sm font-semibold text-gray-800">문화 경고</p>
          {notedLines.length === 0 && (
            <p className="text-xs text-gray-400">아직 감지된 문화 오해가 없습니다.</p>
          )}
          {notedLines.map((line) => (
            <NoteCard key={line.id} line={line} />
          ))}
        </aside>
      </div>
    </div>
  );
}
