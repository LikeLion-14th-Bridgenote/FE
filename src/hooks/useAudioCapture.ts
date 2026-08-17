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

  useEffect(() => {
    if (!enabled) {
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      return;
    }

    let cancelled = false;

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
          onChunk(base64, seqRef.current);
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
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [enabled, chunkIntervalMs, onChunk]);

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