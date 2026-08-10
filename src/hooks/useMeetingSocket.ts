import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// ⚠️ TODO(진수 확인 필요): STOMP 구독 destination 이름 확정 전까지 미완성.
// BE README에는 /ws/meetings/{id} 엔드포인트만 명시돼 있고, 실제 토픽명
// (예: /topic/meetings/{id}/transcript, /culture-note 등)은 미확정.
export function useMeetingSocket(meetingId: string | undefined) {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!meetingId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_WS_URL}`),
      onConnect: () => {
        // TODO: client.subscribe(`/topic/meetings/${meetingId}/transcript`, ...)
        // TODO: client.subscribe(`/topic/meetings/${meetingId}/culture-note`, ...)
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [meetingId]);

  return clientRef;
}
