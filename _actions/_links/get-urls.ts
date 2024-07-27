"use server";

import { createClient } from "@/utils/supabase/server";
import { EncodeShortURL } from "@/lib/URLs/shorten-url";
import { SHORTENER_BASEURL } from "@/lib/URLs/shortener_base_url";

interface Link {
  id: string;
  url_long: string;
  created_at: string;
}

interface SupabaseLink {
  id: number | string;
  url_long: string;
  created_at: string | null;
}

export async function getLinks(): Promise<Link[]> {
  try {
    const supabase = createClient();
    const { data: user_data, error: auth_error } =
      await supabase.auth.getUser();

    if (auth_error) {
      throw new Error(auth_error.message || "Authentication error");
    }

    if (!user_data?.user?.id) {
      throw new Error("Please, log in. Session expired");
    }

    const userId: string = user_data.user.id;

    const { data: linksData, error: linksError } = await supabase
      .from("url")
      .select("id, url_long, created_at")
      .eq("owned_by", userId)
      .order("id", { ascending: false });

    if (linksError) {
      throw new Error(linksError.message || "Failed to fetch links");
    }

    const encodedLinks: Link[] = linksData.map((link: SupabaseLink) => ({
      id: SHORTENER_BASEURL + EncodeShortURL(Number(link.id)),
      url_long: link.url_long,
      created_at: link.created_at ? link.created_at : "", // Ensure created_at is a string
    }));

    return encodedLinks;
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Internal server error"
    );
  }
}
