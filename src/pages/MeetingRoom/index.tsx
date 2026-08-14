import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { meetingApi } from "../../apis/meetingApi";
import { useAuthStore } from "../../stores/authStore";
import { useMeetingSocket } from "../../hooks/useMeetingSocket";

// 담당: 주연
// WebSocket: 순수 WebSocket, type 필드로 메시지 구분 (진수님 확인 완료)
// TODO: 마이크 캡처(audio_chunk 전송)는 다음 작업에서 별도 진행
// TODO: host_id 기반 종료 버튼 노출은 authStore에 profileId 저장되면 반영
// TODO: 참가자 실시간 입퇴장, 회의 종료 브로드캐스트는 진수님 답변 대기 중

interface Participant {
  profile_id: string;
  nickname: string;
  language: string;
  speaker_index: number;
}

interface CulturalNote {
  speakerIntent: string;
  listenerMisread: string;
  advice: string;
}

interface SubtitleLine {
  id: string; // sentence_id
  speakerIndex: number;
  main: string;
  sub?: string;
  note?: CulturalNote;
}

function NoteCard({ line, isMe }: { line: SubtitleLine; isMe: boolean }) {
  if (!line.note) return null;
  const misreadLabel = isMe ? "수신자 오해 소지" : "내가 오해할 소지";

  return (
    <div className="rounded-lg border border-red-100 border-l-4 border-l-accent bg-white px-3.5 py-3 text-xs space-y-2.5">
      <div>
        <p className="text-gray-400 mb-0.5">화자 의도</p>
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

// 발화 중일 때 아바타 뒤에서 퍼지는 파동 링 2겹
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
  const { id } = useParams();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 회의 정보 + 참가자 목록 불러오기
  useEffect(() => {
    if (!id) return;
    const loadMeeting = async () => {
      try {
        setLoading(true);
        const res = await meetingApi.get(id);
        setParticipants(res.data.participants || []);
      } catch (e) {
        setError("회의 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    loadMeeting();
  }, [id]);

  // 경과 시간 타이머
  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // WebSocket 연결 — 자막/번역/경고 실시간 수신
  const { sendSpeakerSwitch } = useMeetingSocket({
    meetingId: id,
    accessToken,
    onCaption: (msg) => {
      if (!msg.is_final) return; // 확정 발화만 자막에 추가
      setSubtitles((prev) => [
        ...prev,
        { id: msg.sentence_id, speakerIndex: msg.speaker_index, main: msg.source_text },
      ]);
    },
    onTranslation: (msg) => {
      setSubtitles((prev) =>
        prev.map((line) =>
          line.id === msg.sentence_id ? { ...line, sub: msg.text } : line
        )
      );
    },
    onWarning: (msg) => {
      setSubtitles((prev) =>
        prev.map((line) =>
          line.id === msg.sentence_id
            ? {
                ...line,
                note: {
                  speakerIntent: msg.note_type,
                  listenerMisread: `위험도: ${msg.risk_level}`,
                  advice: "상대에게 다시 한번 확인해보세요",
                },
              }
            : line
        )
      );
    },
  });

  const handleSpeakerSwitch = (speakerIndex: number) => {
    setCurrentSpeakerIndex(speakerIndex);
    sendSpeakerSwitch(speakerIndex);
  };

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const notedLines = subtitles.filter((l) => l.note);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-400">회의 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-accent">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDECE6] flex flex-col">
      {/* 회의 자체 헤더 */}
      <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-gray-100">
        <div>
          <p className="text-sm font-semibold">회의 진행 중</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>경과 {formatElapsed(elapsedSeconds)}</span>
          </div>
        </div>
        {/* TODO: host_id === 내 profile_id 일 때만 노출 */}
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
            const isSpeaking = currentSpeakerIndex === p.speaker_index;
            return (
              <button
                key={p.profile_id}
                onClick={() => handleSpeakerSwitch(p.speaker_index)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="relative w-11 h-11">
                  {isSpeaking && <SpeakingRing />}
                  <div
                    className={`relative w-11 h-11 rounded-full flex items-center justify-center text-xs font-semibold transition-all bg-gray-100 text-gray-500 ${
                      isSpeaking ? "ring-2 ring-primary" : "group-hover:ring-2 group-hover:ring-gray-200"
                    }`}
                  >
                    {p.language.toUpperCase()}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                </div>
                <span className="text-[11px] text-gray-500">{p.nickname}</span>
              </button>
            );
          })}
        </div>

        {/* 모바일 전용 상단 아바타 스트립 */}
        <div className="lg:hidden fixed top-16 left-0 right-0 z-10 flex items-center gap-5 px-4 py-2.5 bg-white/90 backdrop-blur-sm border-b border-gray-100 overflow-x-auto">
          {participants.map((p) => {
            const isSpeaking = currentSpeakerIndex === p.speaker_index;
            return (
              <button
                key={p.profile_id}
                onClick={() => handleSpeakerSwitch(p.speaker_index)}
                className="flex flex-col items-center gap-1 flex-shrink-0"
              >
                <div className="relative w-9 h-9">
                  {isSpeaking && <SpeakingRing />}
                  <div
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-semibold bg-gray-100 text-gray-500 ${
                      isSpeaking ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    {p.language.toUpperCase()}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 자막 피드 */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 lg:py-8 pt-16 lg:pt-8 flex flex-col gap-3 max-w-2xl mx-auto w-full">
          {subtitles.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-10">
              아직 발화 기록이 없습니다. 발화자 전환 후 대화를 시작해보세요.
            </p>
          )}
          {subtitles.map((line) => {
            const speaker = participants.find((p) => p.speaker_index === line.speakerIndex);
            const isMe = false; // TODO: authStore profileId와 speaker profile_id 비교
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
                      {speaker?.nickname || `화자 ${line.speakerIndex}`}
                    </span>
                    {line.note && <span className="text-accent text-xs">⚠</span>}
                  </div>
                  <p className="text-sm text-gray-800">{line.main}</p>
                  {line.sub && <p className="text-xs text-gray-400 mt-0.5">{line.sub}</p>}
                </div>

                {line.note && openNoteId === line.id && (
                  <div className="lg:hidden mt-1.5">
                    <NoteCard line={line} isMe={isMe} />
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
            <NoteCard key={line.id} line={line} isMe={false} />
          ))}
        </aside>
      </div>
    </div>
  );
}