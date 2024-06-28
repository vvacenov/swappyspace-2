export type User = {
  avatar_url: string | null;
  full_name: string | null;
  id: string;
  updated_at: string | null;
  username: string | null;
  website: string | null;
  email: string | null;
  public_id: number | null;
};

export type UserProfileUpdate = {
  avatar_url?: string | null;
  full_name?: string | null;
  website?: string | null;
};
