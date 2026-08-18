import { useEffect, useRef, useState } from "react";

interface UseAudioCaptureOptions {
  enabled: boolean;
  onChunk: (base64Data: string, seq: number) => void;
  chunkIntervalMs?: number;
}

export function useAudioCapture({ enabled, onChunk, chunkIntervalMs = 250 }: UseAudioCaptureOptions) {
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const seqRef = useRef(0);
  const onChunkRef = useRef(onChunk);

  // 매 렌더링마다 최신 콜백을 ref에 저장 (useEffect 재실행 방지용)
  useEffect(() => {
    onChunkRef.current = onChunk;
  }, [onChunk]);

  useEffect(() => {
    if (!enabled) {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      return;
    }

    let cancelled = false;
    seqRef.current = 0;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = async (event) => {
          if (event.data.size === 0) return;
          const base64 = await blobToBase64(event.data);
          seqRef.current += 1;
          onChunkRef.current(base64, seqRef.current);
        };

        recorder.start(chunkIntervalMs);
      } catch (e) {
        setError("마이크 권한이 필요합니다.");
      }
    };

    start();

    return () => {
      cancelled = true;
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [enabled, chunkIntervalMs]); // onChunk 제거! enabled가 바뀔 때만 recorder 재생성

  return { error };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}