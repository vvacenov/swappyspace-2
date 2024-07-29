"use server";

import { DecodeShortURL } from "@/lib/URLs/shorten-url";
import { createClient } from "@/utils/supabase/server";

export async function deleteLink(linkId: string) {
  const supabase = createClient();
  const linkIdLocal = DecodeShortURL(linkId);
  console.log(linkIdLocal as number);
  const { error } = await supabase
    .from("url")
    .delete()
    .eq("id", linkIdLocal as number);

  if (error) throw error;
  return { success: true };
}
