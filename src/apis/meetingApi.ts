import api from "./axiosInstance";

// BE 담당: 전진수 (/api/meetings/...)
// DTO 네이밍: 엔티티명 + 행위(CRUD/Get) + 형태(Req/Res) + Dto (BE README 기준)
export const meetingApi = {
  create: (data: { title?: string; description?: string; expectedCount?: number }) =>
    api.post("/api/meetings", data),
  get: (meetingId: string) => api.get(`/api/meetings/${meetingId}`),
  join: (meetingId: string) => api.post(`/api/meetings/${meetingId}/join`),
  consent: (meetingId: string) => api.post(`/api/meetings/${meetingId}/consent`),
  end: (meetingId: string) => api.post(`/api/meetings/${meetingId}/end`),
  getMinutes: (meetingId: string) => api.get(`/api/meetings/${meetingId}/minutes`),
  getArchive: () => api.get("/api/meetings"),
};
