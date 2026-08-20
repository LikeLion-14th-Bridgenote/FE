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

  // 매 렌더링마다 최신 콜백을 ref에 저장 (useEffect 재실행 방지용)
  useEffect(() => {
    onChunkRef.current = onChunk;
  }, [onChunk]);

  // 마이크 스트림 획득/해제 (enabled가 바뀔 때만)
  useEffect(() => {
    if (!enabled) {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      return;
    }

    let cancelled = false;

    const acquireStream = async () => {
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

    const startRecorder = (stream: MediaStream) => {
      // 기존 recorder가 있으면 정리
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

      recorder.start(chunkIntervalMs);
    };

    acquireStream();

    return () => {
      cancelled = true;
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [enabled, chunkIntervalMs]);

  // speakerKey 변경 시: 마이크 스트림은 유지하고 MediaRecorder만 재시작 (새 webm 헤더 생성)
  useEffect(() => {
    const stream = streamRef.current;
    if (!enabled || !stream || stream.getTracks().every((t) => t.readyState === "ended")) {
      return;
    }

    // 기존 recorder 정지
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // 새 recorder 시작 (새 webm 헤더 포함)
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    mediaRecorderRef.current = recorder;
    seqRef.current = 0;

    recorder.ondataavailable = async (event) => {
      if (event.data.size === 0) return;
      const base64 = await blobToBase64(event.data);
      seqRef.current += 1;
      onChunkRef.current(base64, seqRef.current);
    };

    recorder.start(chunkIntervalMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakerKey]);

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
