import api from "./axiosInstance";

export const meetingApi = {
  create: (data: { title?: string; description?: string; expected_count?: number }) =>
    api.post("/api/meetings", data),

  getList: () => api.get("/api/meetings"),

  get: (meetingId: string) => api.get(`/api/meetings/${meetingId}`),

  join: (meetingId: string, inviteCode: string) =>
    api.post(`/api/meetings/${meetingId}/join`, { invite_code: inviteCode }),

  consent: (meetingId: string, agreed: boolean) =>
    api.post(`/api/meetings/${meetingId}/consent`, { agreed }),

  end: (meetingId: string) => api.post(`/api/meetings/${meetingId}/end`),

  getMinutes: (meetingId: string, params?: { language?: string; job_role?: string }) =>
    api.get(`/api/meetings/${meetingId}/minutes`, { params }),

  getUtterances: (meetingId: string, page?: number) =>
    api.get(`/api/meetings/${meetingId}/utterances`, { params: { page } }),

  getCulturalNotes: (meetingId: string) =>
    api.get(`/api/meetings/${meetingId}/cultural-notes`),
};