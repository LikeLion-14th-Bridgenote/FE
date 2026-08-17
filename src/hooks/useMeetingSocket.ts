import { useEffect, useRef } from "react";

interface CaptionMessage {
  type: "caption";
  sentence_id: string;
  speaker_index: number;
  source_lang: string;
  source_text: string;
  is_final: boolean;
}

interface TranslationMessage {
  type: "translation";
  sentence_id: string;
  target_lang: string;
  text: string;
}

interface WarningMessage {
  type: "warning";
  sentence_id: string;
  risk_level: string;
  note_type: string;
  speaker_intent: string;
  listener_misread: string;
  advice: string;
  rewrite_text: string;
}

interface MeetingStatusMessage {
  type: "meeting_started" | "meeting_ended";
  meeting_id: string;
  started_at?: string;
  ended_at?: string;
}

interface ParticipantEventMessage {
  type: "participant_joined" | "participant_left";
  profile_id: string;
  nickname: string;
  language: string;
  speaker_index: number;
}

type ServerMessage =
  | CaptionMessage
  | TranslationMessage
  | WarningMessage
  | MeetingStatusMessage
  | ParticipantEventMessage;

interface UseMeetingSocketOptions {
  meetingId: string | undefined;
  accessToken: string | null;
  onCaption?: (msg: CaptionMessage) => void;
  onTranslation?: (msg: TranslationMessage) => void;
  onWarning?: (msg: WarningMessage) => void;
  onMeetingStarted?: (startedAt: string) => void;
  onMeetingEnded?: (endedAt: string) => void;
  onParticipantJoined?: (msg: ParticipantEventMessage) => void;
  onParticipantLeft?: (msg: ParticipantEventMessage) => void;
  onClose?: (code: number) => void;
}

export function useMeetingSocket({
  meetingId,
  accessToken,
  onCaption,
  onTranslation,
  onWarning,
  onMeetingStarted,
  onMeetingEnded,
  onParticipantJoined,
  onParticipantLeft,
  onClose,
}: UseMeetingSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!meetingId || !accessToken) return;

    const wsUrl = `${import.meta.env.VITE_WS_URL}/meetings/${meetingId}?token=${accessToken}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data: ServerMessage = JSON.parse(event.data);
      // eslint-disable-next-line no-console
      console.log("[WS 수신]", data.type, data);
      switch (data.type) {
        case "caption":
          onCaption?.(data);
          break;
        case "translation":
          onTranslation?.(data);
          break;
        case "warning":
          onWarning?.(data);
          break;
        case "meeting_started":
          onMeetingStarted?.(data.started_at ?? "");
          break;
        case "meeting_ended":
          onMeetingEnded?.(data.ended_at ?? "");
          break;
        case "participant_joined":
          onParticipantJoined?.(data);
          break;
        case "participant_left":
          onParticipantLeft?.(data);
          break;
      }
    };

    ws.onclose = (event) => {
      if (event.code === 4401) console.error("WebSocket 인증 실패");
      if (event.code === 4404) console.error("회의를 찾을 수 없음");
      if (event.code === 4409) console.error("이미 종료된 회의");
      onClose?.(event.code);
    };

    return () => {
      ws.close();
    };
  }, [meetingId, accessToken]);

  const sendSpeakerSwitch = (speakerIndex: number) => {
    wsRef.current?.send(JSON.stringify({ type: "speaker_switch", speaker_index: speakerIndex }));
  };

  const sendAudioChunk = (speakerIndex: number, seq: number, base64Data: string) => {
    wsRef.current?.send(
      JSON.stringify({ type: "audio_chunk", speaker_index: speakerIndex, seq, data: base64Data })
    );
  };

  return { sendSpeakerSwitch, sendAudioChunk };
}