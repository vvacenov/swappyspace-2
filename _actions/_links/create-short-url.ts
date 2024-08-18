"use server";

import { createClient } from "@/utils/supabase/server";
import { EncodeShortURL } from "@/lib/URLs/shorten-url";
import { SHORTENER_BASEURL } from "@/lib/URLs/shortener_base_url";
import { z } from "zod";

const inputSchema = z.object({
  long_url: z.string().url("Please enter a valid URL"),
  antibot: z.string().max(0, "Bot detection triggered"),
});

export async function createShortUrl(formData: FormData) {
  const long_url = formData.get("long_url") as string;
  const antibot = formData.get("antibot") as string;

  try {
    const validatedInput = inputSchema.parse({ long_url, antibot });

    const supabase = createClient();
    const { data: user_data, error: auth_error } =
      await supabase.auth.getUser();

    if (auth_error || !user_data?.user?.id) {
      return {
        message: "Authentication failed. Please log in and try again.",
        status: 401,
        error: true,
      };
    }

    const userId = user_data.user.id;

    // Provjeri korisnikov counter
    const { data: counterData, error: counterError } = await supabase
      .from("counter")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (counterError) {
      console.error("Counter error:", counterError);
      return {
        message:
          "An error occurred while processing your request. Please try again.",
        status: 500,
        error: true,
      };
    }

    if (counterData.remaining_links <= 0) {
      return {
        message:
          "You've reached the maximum number of allowed links. Please upgrade your account to create more.",
        status: 403,
        error: true,
      };
    }

    // Umetni novi URL
    const { error: insertError, data: insertData } = await supabase
      .from("url")
      .insert({
        url_long: validatedInput.long_url,
        owned_by: userId,
      })
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return {
        message: "Failed to create short URL. Please try again later.",
        status: 500,
        error: true,
      };
    }

    // Ažuriraj remaining_links
    const { error: updateError } = await supabase
      .from("counter")
      .update({ remaining_links: counterData.remaining_links - 1 })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Counter update error:", updateError);
      return {
        message:
          "Short URL created, but failed to update your account. Please try again later",
        error: true,
      };
    }

    const hash = EncodeShortURL(insertData[0].id);

    return {
      message: SHORTENER_BASEURL + hash,
      status: 200,
      error: false,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    if (err instanceof z.ZodError) {
      return {
        message: err.errors[0].message,
        status: 400,
        error: true,
      };
    }
    return {
      message: "An unexpected error occurred. Please try again later.",
      status: 500,
      error: true,
    };
  }
}
