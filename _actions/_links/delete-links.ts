"use server";

import { DecodeShortURL } from "@/lib/URLs/shorten-url";
import { createClient } from "@/utils/supabase/server";
import xss from "xss";

export async function deleteLink(linkId: string) {
  const supabase = createClient();

  // Sanitiziraj linkId koristeći xss
  const sanitizedLinkId = xss(linkId);

  // Dekodiraj i validiraj linkId
  const linkIdLocal = DecodeShortURL(sanitizedLinkId);

  // Provjeri je li linkId broj nakon dekodiranja
  if (isNaN(Number(linkIdLocal))) {
    throw new Error("Invalid link ID format");
  }

  console.log(linkIdLocal);

  const { error } = await supabase
    .from("url")
    .delete()
    .eq("id", Number(linkIdLocal));

  if (error) throw error;

  return { success: true };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
