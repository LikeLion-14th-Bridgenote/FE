// BE DTO 네이밍 규칙(README 기준): 엔티티명 + 행위 + 형태(Req/Res) + Dto
export interface MeetingCreateReqDto {
  title?: string;
  description?: string;
  expectedCount?: number;
}

export interface MeetingCreateResDto {
  meetingId: string;
  inviteUrl: string;
}

export interface CulturalNote {
  riskLevel: "High" | "Med" | "Low";
  noteType: string;
  speakerIntent: string;
  listenerMisread: string;
  advice: string;
  rewriteText: string;
}
