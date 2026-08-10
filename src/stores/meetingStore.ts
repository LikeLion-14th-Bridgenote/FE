import { create } from "zustand";

interface MeetingState {
  meetingId: string | null;
  currentSpeakerId: string | null;
  setMeetingId: (id: string) => void;
  setCurrentSpeaker: (id: string) => void;
  reset: () => void;
}

// TODO(주연/진수): 회의장 실시간 상태(참가자 목록 등)는 여기 확장
export const useMeetingStore = create<MeetingState>((set) => ({
  meetingId: null,
  currentSpeakerId: null,
  setMeetingId: (id) => set({ meetingId: id }),
  setCurrentSpeaker: (id) => set({ currentSpeakerId: id }),
  reset: () => set({ meetingId: null, currentSpeakerId: null }),
}));
