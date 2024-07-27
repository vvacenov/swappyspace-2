"use server";

import { createClient } from "@/utils/supabase/server";
import { EncodeShortURL, testURL } from "@/lib/URLs/shorten-url";
import { SHORTENER_BASEURL } from "@/lib/URLs/shortener_base_url";

export async function createShortUrl(long_url: string) {
  try {
    if (!long_url) {
      return {
        message: "Empty request.",
        status: 400,
        error: true,
      };
    }

    const urlTest = testURL(long_url);
    if (!urlTest) {
      return {
        message: "Input is not a valid URL.",
        status: 400,
        error: true,
      };
    }

    const supabase = createClient();
    const { data: user_data, error: auth_error } =
      await supabase.auth.getUser();

    if (auth_error) {
      return {
        message: auth_error.message,
        status: 401,
        error: true,
      };
    }

    if (!user_data?.user?.id) {
      return {
        message: "Please, log in. Session expired",
        status: 401,
        error: true,
      };
    }

    const userId = user_data.user.id;

    // Provjeri postoji li zapis u tabeli counter za korisnika
    const { data: counterData, error: counterError } = await supabase
      .from("counter")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (counterError && counterError.code !== "PGRST116") {
      // PGRST116: row not found
      return {
        message: counterError.message,
        status: 500,
        error: true,
      };
    }

    if (counterData && counterData.remaining_links <= 0) {
      return {
        message: `You have reached the maximum number of links.`,
        status: 403,
        error: true,
      };
    }

    // Umetni novi URL i dohvati podatke o unosu
    const { error: insertError, data: insertData } = await supabase
      .from("url")
      .insert({
        url_long: long_url,
        owned_by: userId,
      })
      .select();

    if (insertError) {
      return {
        message: insertError.message,
        status: 500,
        error: true,
      };
    }

    // Ako je ovo prvi link korisnika, kreiraj zapis u tabeli counter
    if (!counterData) {
      const remainingLinks = 24; // free korisnik počinje sa 25 linkova, jedan je već korišten
      const { error: counterInsertError } = await supabase
        .from("counter")
        .insert({
          user_id: userId,
          user_type: "free",
          remaining_links: remainingLinks,
        });

      if (counterInsertError) {
        return {
          message: counterInsertError.message,
          status: 500,
          error: true,
        };
      }
    } else {
      // Ažuriraj preostale linkove
      const { error: updateError } = await supabase
        .from("counter")
        .update({ remaining_links: counterData.remaining_links - 1 })
        .eq("user_id", userId);

      if (updateError) {
        return {
          message: updateError.message,
          status: 500,
          error: true,
        };
      }
    }

    // Enkodiraj ID u kratki URL
    const hash = EncodeShortURL(insertData[0].id);

    return {
      message: SHORTENER_BASEURL + hash,
      status: 200,
      error: false,
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        message: err.message,
        status: 500,
        error: true,
      };
    } else {
      return {
        message: "Internal server error",
        status: 500,
        error: true,
      };
    }
  }
}
