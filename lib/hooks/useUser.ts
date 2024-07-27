import {
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { User } from "@/utils/types/user";

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

const fetchUser = async (): Promise<User> => {
  const response = await fetch("/api/user");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data || emptyUser;
};

export default function useUser(): UseQueryResult<User, Error> {
  return useQuery<User, Error>({
    queryKey: ["user"],
    queryFn: fetchUser,
  });
}
