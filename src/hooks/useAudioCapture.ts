import { useCallback, useEffect, useRef, useState } from "react";

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
  const chunkIntervalRef = useRef(chunkIntervalMs);

  useEffect(() => {
    onChunkRef.current = onChunk;
  }, [onChunk]);

  useEffect(() => {
    chunkIntervalRef.current = chunkIntervalMs;
  }, [chunkIntervalMs]);

  const startRecorder = useCallback((stream: MediaStream) => {
    // 기존 recorder 정지
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    mediaRecorderRef.current = recorder;
    seqRef.current = 0;

    recorder.ondataavailable = async (event) => {
      if (event.data.size === 0) return;
      const base64 = await blobToBase64(event.data);
      seqRef.current += 1;
      onChunkRef.current(base64, seqRef.current);
    };

    recorder.start(chunkIntervalRef.current);
  }, []);

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
        startRecorder(stream);
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
  }, [enabled, chunkIntervalMs, startRecorder]);

  // 외부에서 호출: MediaRecorder만 재시작 (마이크 스트림 유지, 새 webm 헤더 생성)
  const restart = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || stream.getTracks().every((t) => t.readyState === "ended")) {
      return;
    }
    startRecorder(stream);
  }, [startRecorder]);

  return { error, restart };
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
