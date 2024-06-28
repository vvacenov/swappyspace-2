import {
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@/utils/types/user";

export const emptyUser: User = {
  avatar_url: null,
  full_name: null,
  id: "",
  updated_at: null,
  username: null,
  website: null,
  email: null,
  public_id: null,
};

export default function useUser(): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: user } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
        return user || emptyUser;
      }
      return emptyUser;
    },
  });
}
