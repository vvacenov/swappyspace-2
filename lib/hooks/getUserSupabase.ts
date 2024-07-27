"use server ";
import { createClient } from "@/utils/supabase/server";

export async function getUser(user_id: string) {
  const supabase = createClient();
  const { data: user } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user_id)
    .single();

  return user;
}
