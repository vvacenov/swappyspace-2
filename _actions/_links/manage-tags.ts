"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { DecodeShortURL } from "@/lib/URLs/shorten-url";
import xss from "xss";
import { MAX_TAGS, MAX_TAG_LENGTH } from "@/utils/rules/short_urls";

const tagSchema = z
  .string()
  .min(1, "Tag cannot be empty")
  .max(MAX_TAG_LENGTH, `Tag must be ${MAX_TAG_LENGTH} characters or less`)
  .regex(/^[a-zA-Z0-9]+$/, "Tag can only contain letters and numbers");

export async function getTagsForLink(linkId: string) {
  const supabase = createClient();
  try {
    // Sanitiziraj linkId prije dekodiranja
    const sanitizedLinkId = xss(linkId);
    const linkIdLocal = DecodeShortURL(sanitizedLinkId);

    const { data, error } = await supabase
      .from("url")
      .select("tags")
      .eq("id", linkIdLocal)
      .single();

    if (error) throw new Error("Failed to fetch tags");
    return data.tags || [];
  } catch (error) {
    console.error("Error in getTagsForLink:", error);
    throw new Error("Unable to load tags. Please try again later.");
  }
}

export async function updateTags(linkId: string, tags: string[]) {
  const supabase = createClient();
  try {
    // Sanitiziraj linkId prije dekodiranja
    const sanitizedLinkId = xss(linkId);
    const linkIdLocal = DecodeShortURL(sanitizedLinkId);

    // Sanitiziraj i validiraj tagove
    const validTags = Array.from(new Set(tags))
      .map((tag) => xss(tag)) // Sanitiziraj svaki tag
      .filter((tag) => {
        try {
          tagSchema.parse(tag);
          return true;
        } catch {
          return false;
        }
      })
      .slice(0, MAX_TAGS);

    if (validTags.some((tag) => tag.length > MAX_TAG_LENGTH)) {
      throw new Error(
        `One or more tags exceed the maximum length of ${MAX_TAG_LENGTH} characters.`
      );
    }

    if (validTags.length > MAX_TAGS) {
      throw new Error(
        `The number of tags exceeds the maximum limit of ${MAX_TAGS}.`
      );
    }

    const { data, error } = await supabase
      .from("url")
      .update({ tags: validTags })
      .eq("id", linkIdLocal)
      .select();

    if (error) {
      throw new Error("Failed to update tags");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unable to update tags. Please try again.");
  }
}

export async function getUniqueTagsForUser() {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw new Error("Failed to get user for tags list.");
    }

    const { data: tags, error: tags_error } = await supabase
      .from("url")
      .select("tags")
      .eq("owned_by", data.user?.id)
      .order("tags", { ascending: true });

    if (tags_error) {
      throw new Error("Failed to  get tags.");
    }

    const uniqueTags = getUniqueTagsFast(tags);

    return uniqueTags;
  } catch (error) {
    if (error instanceof Error) throw error;
    else throw new Error("Unable to get tags list.");
  }
}

interface TagObject {
  tags: string[];
}

function getUniqueTagsFast(arr: TagObject[]): string[] {
  const tagSet = new Set<string>();
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].tags.length; j++) {
      tagSet.add(arr[i].tags[j]);
    }
  }
  return Array.from(tagSet);
}
