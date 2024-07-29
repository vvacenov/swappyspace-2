"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { DecodeShortURL } from "@/lib/URLs/shorten-url";

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 30;

const tagSchema = z.string().min(1).max(MAX_TAG_LENGTH);

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

    // Validate and clean tags
    const validTags = Array.from(new Set(tags)) // Remove duplicates
      .filter((tag) => {
        try {
          tagSchema.parse(tag);
          return true;
        } catch {
          return false;
        }
      })
      .slice(0, MAX_TAGS);

    // Additional backend validation
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

    // Update tags
    const { data, error } = await supabase
      .from("url")
      .update({ tags: validTags })
      .eq("id", linkIdLocal)
      .select();

    if (error) throw new Error("Failed to update tags");
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

    // Validate new tag
    tagSchema.parse(newTag);

    // Fetch current tags
    const { data: currentData, error: fetchError } = await supabase
      .from("url")
      .select("tags")
      .eq("id", linkIdLocal)
      .single();

    if (fetchError) throw new Error("Failed to fetch current tags");

    const currentTags = currentData.tags || [];

    // Check if tag already exists
    if (currentTags.includes(newTag)) {
      throw new Error("This tag already exists for this link.");
    }

    // Check if max tags limit is reached
    if (currentTags.length >= MAX_TAGS) {
      throw new Error(`Maximum number of tags (${MAX_TAGS}) reached.`);
    }

    // Add new tag
    const newTags = [...currentTags, newTag];

    // Update tags
    const { data, error } = await supabase
      .from("url")
      .update({ tags: newTags })
      .eq("id", linkIdLocal)
      .select();

    if (error) throw new Error("Failed to add tag");
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

    // Fetch current tags
    const { data: currentData, error: fetchError } = await supabase
      .from("url")
      .select("tags")
      .eq("id", linkIdLocal)
      .single();

    if (fetchError) throw new Error("Failed to fetch current tags");

    const currentTags = currentData.tags || [];

    // Remove the tag
    const newTags = currentTags.filter((tag: string) => tag !== tagToRemove);

    // Update tags
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
