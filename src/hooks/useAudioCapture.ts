import { useEffect, useRef, useState } from "react";

interface UseAudioCaptureOptions {
  enabled: boolean;
  onChunk: (base64Data: string, seq: number) => void;
  chunkIntervalMs?: number;
  speakerKey?: number | null;
}

export function useAudioCapture({ enabled, onChunk, chunkIntervalMs = 250, speakerKey }: UseAudioCaptureOptions) {
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const seqRef = useRef(0);
  const onChunkRef = useRef(onChunk);

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
        // 기존 스트림이 살아있으면 재사용, 아니면 새로 획득
        let stream = streamRef.current;
        if (!stream || stream.getTracks().every((t) => t.readyState === "ended")) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
        }

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
      // speakerKey 변경으로 인한 재실행 시에는 스트림을 유지 (enabled 변경 시에만 정리)
    };
  }, [enabled, chunkIntervalMs, speakerKey]);

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
