export interface UserProfile {
  id: string;
  email: string;
  name: string;
  language: string;
  culture: string;
  job: string;
  organization: string | null;
  created_at: string;
  updated_at: string;
}

export type UserProfileUpdate = Partial<
  Pick<UserProfile, "name" | "language" | "culture" | "job" | "organization">
>;
