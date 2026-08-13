import { useEffect, useRef } from "react";

// 담당: 주연
// 순수 WebSocket 방식 (STOMP 아님, 진수님 확인 완료)
// 메시지는 type 필드로 구분: caption / translation / warning
// 클라이언트 → 서버로는 audio_chunk / speaker_switch 전송

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
}

type ServerMessage = CaptionMessage | TranslationMessage | WarningMessage;

interface UseMeetingSocketOptions {
  meetingId: string | undefined;
  accessToken: string | null;
  onCaption?: (msg: CaptionMessage) => void;
  onTranslation?: (msg: TranslationMessage) => void;
  onWarning?: (msg: WarningMessage) => void;
}

export function useMeetingSocket({
  meetingId,
  accessToken,
  onCaption,
  onTranslation,
  onWarning,
}: UseMeetingSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!meetingId || !accessToken) return;

    const wsUrl = `${import.meta.env.VITE_WS_URL}/meetings/${meetingId}?token=${accessToken}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data: ServerMessage = JSON.parse(event.data);
      if (data.type === "caption") onCaption?.(data);
      if (data.type === "translation") onTranslation?.(data);
      if (data.type === "warning") onWarning?.(data);
    };

    ws.onclose = (event) => {
      if (event.code === 4401) console.error("WebSocket 인증 실패");
      if (event.code === 4404) console.error("회의를 찾을 수 없음");
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