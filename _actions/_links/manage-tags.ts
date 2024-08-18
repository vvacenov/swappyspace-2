"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { DecodeShortURL } from "@/lib/URLs/shorten-url";

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 30;

const tagSchema = z
  .string()
  .min(1, "Tag cannot be empty")
  .max(MAX_TAG_LENGTH, `Tag must be ${MAX_TAG_LENGTH} characters or less`)
  .regex(/^[a-zA-Z0-9]+$/, "Tag can only contain letters and numbers");

export async function getTagsForLink(linkId: string) {
  try {
    const supabase = createClient();
    const linkIdLocal = DecodeShortURL(linkId);

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
  try {
    const supabase = createClient();
    const linkIdLocal = DecodeShortURL(linkId);

    const validTags = Array.from(new Set(tags))
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

    if (error) throw new Error("Failed to update tags");
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error in updateTags:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unable to update tags. Please try again.");
  }
}

export async function addTag(linkId: string, newTag: string) {
  try {
    const supabase = createClient();
    const linkIdLocal = DecodeShortURL(linkId);

    tagSchema.parse(newTag);

    const { data: currentData, error: fetchError } = await supabase
      .from("url")
      .select("tags")
      .eq("id", linkIdLocal)
      .single();

    if (fetchError) throw new Error("Failed to fetch current tags");

    const currentTags = currentData.tags || [];

    if (currentTags.includes(newTag)) {
      throw new Error("This tag already exists for this link.");
    }

    if (currentTags.length >= MAX_TAGS) {
      throw new Error(`Maximum number of tags (${MAX_TAGS}) reached.`);
    }

    const newTags = [...currentTags, newTag];

    const { data, error } = await supabase
      .from("url")
      .update({ tags: newTags })
      .eq("id", linkIdLocal)
      .select();

    if (error) throw new Error("Failed to add tag");
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error in addTag:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unable to add tag. Please try again.");
  }
}

export async function removeTag(linkId: string, tagToRemove: string) {
  try {
    const supabase = createClient();
    const linkIdLocal = DecodeShortURL(linkId);

    const { data: currentData, error: fetchError } = await supabase
      .from("url")
      .select("tags")
      .eq("id", linkIdLocal)
      .single();

    if (fetchError) throw new Error("Failed to fetch current tags");

    const currentTags = currentData.tags || [];

    if (!currentTags.includes(tagToRemove)) {
      throw new Error("This tag does not exist for this link.");
    }

    const newTags = currentTags.filter((tag: string) => tag !== tagToRemove);

    const { data, error } = await supabase
      .from("url")
      .update({ tags: newTags })
      .eq("id", linkIdLocal)
      .select();

    if (error) throw new Error("Failed to remove tag");
    return data;
  } catch (error) {
    console.error("Error in removeTag:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unable to remove tag. Please try again.");
  }
}

export async function getAllTags() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("url")
      .select("tags")
      .not("tags", "is", null);

    if (error) throw new Error("Failed to fetch tags");

    const allTags = Array.from(
      new Set(data.flatMap((item) => item.tags || []))
    );

    return allTags;
  } catch (error) {
    console.error("Error in getAllTags:", error);
    throw new Error("Unable to load all tags. Please try again later.");
  }
}

export async function searchLinksByTag(tag: string) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("url")
      .select("*")
      .contains("tags", [tag]);

    if (error) throw new Error("Failed to search links by tag");

    return data;
  } catch (error) {
    console.error("Error in searchLinksByTag:", error);
    throw new Error("Unable to search links by tag. Please try again later.");
  }
}

export async function getMostUsedTags(limit: number = 10) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("url")
      .select("tags")
      .not("tags", "is", null);

    if (error) throw new Error("Failed to fetch tags");

    const tagCounts = data
      .flatMap((item) => item.tags || [])
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const mostUsedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag]) => tag);

    return mostUsedTags;
  } catch (error) {
    console.error("Error in getMostUsedTags:", error);
    throw new Error("Unable to get most used tags. Please try again later.");
  }
}
