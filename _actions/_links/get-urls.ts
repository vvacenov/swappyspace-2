"use server";

import { createClient } from "@/utils/supabase/server";
import { DecodeShortURL, EncodeShortURL } from "@/lib/URLs/shorten-url";
import xss from "xss";
import { LinksFilter } from "@/utils/types/types";

interface Link {
  id: string;
  url_long: string;
  created_at: string;
  tags: string[];
}

interface SupabaseLink {
  id: number | string;
  url_long: string;
  created_at: string | null;
  tags: string[] | null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getLinks(filter: LinksFilter): Promise<Link[]> {
  const supabase = createClient();

  const searchFilter: LinksFilter = {
    id: filter.id ? xss(filter.id) : null,
    tags: filter.tags?.map((tag) => xss(tag)) || null,
    excat_tags: filter.excat_tags,
    url_long: filter.url_long ? xss(filter.url_long) : null,
    created_at: filter.created_at
      ? new Date(xss(filter.created_at)).toDateString()
      : null,
    asc: filter.asc,
  };

  try {
    const { data: user_data, error: auth_error } =
      await supabase.auth.getSession();

    if (auth_error) {
      throw new Error(auth_error.message || "Authentication error");
    }

    if (!user_data?.session?.user.id) {
      throw new Error("Please, log in. Session is missing or expired");
    }

    const userId: string = user_data?.session?.user.id;

    const query = supabase.from("url").select("*").eq("owned_by", userId);

    if (searchFilter.url_long) {
      query.ilike("url_long", `%${searchFilter.url_long}%`);
    }

    if (searchFilter.created_at) {
      query.eq("created_at", searchFilter.created_at);
    }

    if (searchFilter.tags && searchFilter.tags.length > 0) {
      if (searchFilter.excat_tags) {
        // exact match tags
        query.contains("tags", searchFilter.tags);
      } else {
        // partial match tags
        query.overlaps("tags", searchFilter.tags);
      }
    }

    query.order("created_at", { ascending: searchFilter.asc });

    const { data: linksData, error: linksError } = await query;

    if (linksError) {
      console.log(linksError.message);
      throw new Error(linksError.message || "Failed to fetch links");
    }

    const encodedLinks: Link[] = linksData.map((link: SupabaseLink) => ({
      id: EncodeShortURL(Number(link.id)),
      url_long: link.url_long,
      created_at: link.created_at || "",
      tags: link.tags || [],
    }));

    return encodedLinks;
  } catch (err) {
    console.log(err);
    throw new Error(
      err instanceof Error ? err.message : "Internal server error"
    );
  }
}
