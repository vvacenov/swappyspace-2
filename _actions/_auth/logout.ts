"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { SiteNavigation } from "@/lib/site-navigation/site-navigation";

type serverError = {
  error_message: string;
  code?: number;
};

export async function logout() {
  let serverError: serverError | null = null;

  const supabase = createClient();

  const { error } = await supabase.auth.signOut();
  if (error) {
    serverError = { error_message: error.message };
    return serverError;
  }
  revalidatePath("/", "layout");
  redirect(SiteNavigation.home);
}
