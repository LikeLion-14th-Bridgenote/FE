export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  language: string;
  culture: string;
  job_role: string;
  organization: string | null;
  created_at: string;
  updated_at: string;
}

export type UserProfileUpdate = Partial<
  Pick<UserProfile, "nickname" | "language" | "culture" | "job_role" | "organization">
>;
