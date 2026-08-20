import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { meetingApi } from "../../apis/meetingApi";
import { useAuthStore } from "../../stores/authStore";
import { useMeetingSocket } from "../../hooks/useMeetingSocket";
import { useAudioCapture } from "../../hooks/useAudioCapture";

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
  id: string;
  speakerIndex: number;
  main: string;
  sub?: string;
  note?: CulturalNote;
}

interface Toast {
  id: string;
  text: string;
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

function SpeakingRing() {
  return (
    <>
      <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
      <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDelay: "0.5s" }} />
    </>
  );
}

export default function MeetingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const profileId = useAuthStore((s) => s.profileId);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [hostId, setHostId] = useState<string | null>(null);
  const [meetingStatus, setMeetingStatus] = useState<"waiting" | "live" | "ended">("waiting");
  const [meetingStartedAt, setMeetingStartedAt] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState<number | null>(null);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ending, setEnding] = useState(false);
  const [wsClosedCode, setWsClosedCode] = useState<number | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const manualSpeakerRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const pushToast = (text: string) => {
    const tid = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id: tid, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== tid)), 3000);
  };

  const refreshMeeting = async () => {
    if (!id) return;
    try {
      const res = await meetingApi.get(id);
      setParticipants(res.data.participants || []);
      setHostId(res.data.host_id ?? null);
      setMeetingStatus(res.data.status ?? "waiting");
      if (res.data.started_at) setMeetingStartedAt(res.data.started_at);
      return res.data;
    } catch (e) {
      setError("회의 정보를 불러오지 못했습니다.");
      return null;
    }
  };

  useEffect(() => {
    if (!id) return;
    const init = async () => {
      setLoading(true);
      await refreshMeeting();
      setLoading(false);
    };
    init();
  }, [id]);

  useEffect(() => {
    if (!id || meetingStatus === "ended") return;
    const needsRefresh = !meetingStartedAt || participants.length === 0;
    if (!needsRefresh) return;
    const interval = setInterval(refreshMeeting, 3000);
    return () => clearInterval(interval);
  }, [id, meetingStartedAt, participants.length, meetingStatus]);

  useEffect(() => {
    if (!meetingStartedAt) return;
    const startTime = new Date(meetingStartedAt).getTime();
    const timer = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [meetingStartedAt]);

  useEffect(() => {
    if (manualSpeakerRef.current || currentSpeakerIndex !== null) return;
    if (!hostId || participants.length === 0) return;
    const host = participants.find((p) => p.profile_id === hostId);
    if (host) setCurrentSpeakerIndex(host.speaker_index);
  }, [participants, hostId, currentSpeakerIndex]);

  // 새 메시지 오면 자동으로 아래로 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [subtitles]);

  const { sendSpeakerSwitch, sendAudioChunk } = useMeetingSocket({
    meetingId: id,
    accessToken,
    onCaption: (msg) => {
      if (!msg.is_final) return;
      setSubtitles((prev) => {
        const existingIndex = prev.findIndex((line) => line.id === msg.sentence_id);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            main: msg.source_text,
            speakerIndex: msg.speaker_index,
          };
          return updated;
        }
        return [...prev, { id: msg.sentence_id, speakerIndex: msg.speaker_index, main: msg.source_text }];
      });
    },
    onTranslation: (msg) => {
      setSubtitles((prev) => prev.map((line) => (line.id === msg.sentence_id ? { ...line, sub: msg.text } : line)));
    },
    onWarning: (msg) => {
      setSubtitles((prev) =>
        prev.map((line) =>
          line.id === msg.sentence_id
            ? {
                ...line,
                note: {
                  speakerIntent: msg.speaker_intent || msg.note_type,
                  listenerMisread: msg.listener_misread || `위험도: ${msg.risk_level}`,
                  advice: msg.advice || "상대에게 다시 한번 확인해보세요",
                },
              }
            : line
        )
      );
    },
    onMeetingStarted: (startedAt) => {
      setMeetingStatus("live");
      if (startedAt) setMeetingStartedAt(startedAt);
      setWsConnected(true);
    },
    onMeetingEnded: () => {
      setMeetingStatus("ended");
      pushToast("회의가 종료되었습니다. 회의록으로 이동합니다.");
      if (id) setTimeout(() => navigate(`/meetings/${id}/minutes`), 1200);
    },
    onParticipantJoined: (msg) => {
      setParticipants((prev) => {
        if (prev.some((p) => p.profile_id === msg.profile_id)) return prev;
        pushToast(`${msg.nickname}님이 입장했습니다`);
        return [...prev, { profile_id: msg.profile_id, nickname: msg.nickname, language: msg.language, speaker_index: msg.speaker_index }];
      });
    },
    onParticipantLeft: (msg) => {
      setParticipants((prev) => {
        const target = prev.find((p) => p.profile_id === msg.profile_id);
        if (target) pushToast(`${target.nickname}님이 퇴장했습니다`);
        return prev.filter((p) => p.profile_id !== msg.profile_id);
      });
    },
    onClose: (code) => {
      setWsClosedCode(code);
      setWsConnected(false);
    },
  });

  useEffect(() => {
    setWsConnected(true);
  }, [id, accessToken]);

  const isCurrentSpeaker = currentSpeakerIndex !== null;

  const { error: micError } = useAudioCapture({
    enabled: isCurrentSpeaker && meetingStatus !== "ended",
    onChunk: (base64Data, seq) => {
      if (currentSpeakerIndex !== null) sendAudioChunk(currentSpeakerIndex, seq, base64Data);
    },
  });

  const handleSpeakerSwitch = (speakerIndex: number) => {
    manualSpeakerRef.current = true;
    setCurrentSpeakerIndex(speakerIndex);
    sendSpeakerSwitch(speakerIndex);
  };

  const handleEndMeeting = async () => {
    if (!id) return;
    setEnding(true);
    try {
      await meetingApi.end(id);
    } catch (e) {
      pushToast("회의 종료 중 오류가 발생했습니다.");
    } finally {
      setEnding(false);
    }
  };

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isHost = hostId === profileId;
  const notedLines = subtitles.filter((l) => l.note);

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-400">회의 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-accent">{error}</p>
      </div>
    );
  }

  if (wsClosedCode === 4403) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-accent">회의 참가 절차가 완료되지 않았습니다. 다시 입장해주세요.</p>
      </div>
    );
  }

  if (wsClosedCode === 4409) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-accent">이미 종료된 회의입니다.</p>
      </div>
    );
  }

  if (wsClosedCode === 4401 || wsClosedCode === 4404) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-accent">
          {wsClosedCode === 4401 ? "인증에 실패했습니다. 다시 로그인해주세요." : "회의를 찾을 수 없습니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#EDECE6] flex flex-col overflow-hidden">
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="bg-gray-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg">
            {toast.text}
          </div>
        ))}
      </div>

      <header className="flex-shrink-0 flex items-center justify-between px-6 h-16 bg-white border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">회의 진행 중</p>
            {meetingStatus === "waiting" && (
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">대기 중</span>
            )}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                wsConnected ? "text-primary bg-primary/10" : "text-accent bg-accent/10"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? "bg-primary" : "bg-accent"}`} />
              {wsConnected ? "연결됨" : "연결 끊김"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>경과 {meetingStartedAt ? formatElapsed(elapsedSeconds) : "--:--"}</span>
            {isCurrentSpeaker && !micError && (
              <span className="flex items-center gap-1 text-primary ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                마이크 켜짐
              </span>
            )}
            {micError && <span className="text-accent ml-2">⚠ {micError}</span>}
          </div>
        </div>
        {isHost && (
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleEndMeeting}
              disabled={ending}
              className="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {ending ? "종료 중..." : "회의 종료"}
            </button>
            <span className="text-[10px] text-gray-400">마지막 발화 후 2초 뒤 눌러주세요</span>
          </div>
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="hidden lg:flex flex-shrink-0 flex-col items-center gap-5 w-20 py-6 bg-white/60 border-r border-gray-100 overflow-y-auto">
          <span className="text-[10px] text-gray-400 text-center leading-tight mb-1">
            아바타 클릭 시<br />발화자 전환
          </span>
          {participants.length === 0 && <p className="text-[10px] text-gray-300 text-center px-1">참가자 대기 중</p>}
          {participants.map((p) => {
            const isSpeaking = currentSpeakerIndex === p.speaker_index;
            const isMePart = p.profile_id === profileId;
            return (
              <button key={p.profile_id} onClick={() => handleSpeakerSwitch(p.speaker_index)} className="flex flex-col items-center gap-1 group">
                <div className="relative w-11 h-11">
                  {isSpeaking && <SpeakingRing />}
                  <div
                    className={`relative w-11 h-11 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isMePart ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                    } ${isSpeaking ? "ring-2 ring-primary" : "group-hover:ring-2 group-hover:ring-gray-200"}`}
                  >
                    {isMePart ? "나" : p.language.toUpperCase()}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                </div>
                <span className="text-[11px] text-gray-500">{p.nickname}</span>
              </button>
            );
          })}
        </div>

        <div className="lg:hidden fixed top-16 left-0 right-0 z-10 flex items-center gap-5 px-4 py-2.5 bg-white/90 backdrop-blur-sm border-b border-gray-100 overflow-x-auto">
          {participants.length === 0 && <p className="text-[11px] text-gray-300">참가자 대기 중</p>}
          {participants.map((p) => {
            const isSpeaking = currentSpeakerIndex === p.speaker_index;
            const isMePart = p.profile_id === profileId;
            return (
              <button key={p.profile_id} onClick={() => handleSpeakerSwitch(p.speaker_index)} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="relative w-9 h-9">
                  {isSpeaking && <SpeakingRing />}
                  <div
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                      isMePart ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
                    } ${isSpeaking ? "ring-2 ring-primary" : ""}`}
                  >
                    {isMePart ? "나" : p.language.toUpperCase()}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 lg:py-8 pt-16 lg:pt-8 flex flex-col gap-3 w-full">
          {subtitles.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-10">아직 발화 기록이 없습니다. 발화자 전환 후 대화를 시작해보세요.</p>
          )}
          {subtitles.map((line) => {
            const speaker = participants.find((p) => p.speaker_index === line.speakerIndex);
            const isMe = speaker?.profile_id === profileId;
            return (
              <div key={line.id} className={`max-w-[85%] lg:max-w-[75%] ${isMe ? "self-end" : "self-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 ${isMe ? "bg-primary/10" : "bg-white border border-gray-100"} ${
                    line.note ? "lg:cursor-default cursor-pointer" : ""
                  }`}
                  onClick={() => line.note && setOpenNoteId(openNoteId === line.id ? null : line.id)}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[11px] font-medium text-gray-400">{speaker?.nickname || `화자 ${line.speakerIndex}`}</span>
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
          <div ref={chatEndRef} />
        </div>

        <aside className="hidden lg:flex flex-shrink-0 flex-col gap-3 w-80 px-5 py-6 border-l border-gray-100 bg-white/40 overflow-y-auto">
          <p className="text-sm font-semibold text-gray-800">문화 경고</p>
          {notedLines.length === 0 && <p className="text-xs text-gray-400">아직 감지된 문화 오해가 없습니다.</p>}
          {notedLines.map((line) => (
            <NoteCard key={line.id} line={line} isMe={false} />
          ))}
        </aside>
      </div>
    </div>
  );
}