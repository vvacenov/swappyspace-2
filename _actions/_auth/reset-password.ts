"use server";

import { createClient } from "@/utils/supabase/server";
import { SiteNavigation, baseUrl } from "@/lib/site-navigation/site-navigation";
import { headers } from "next/headers";

type serverError = {
  error_message: string;
  code?: number;
};

export async function resetPwd(formData: FormData) {
  const ip = await getIp();

  let serverError: serverError | null = null;

  if (!formData.get("email")) {
    serverError = { error_message: "Please enter email address." };
    return serverError;
  }

  const supabase = createClient();

  const emailInput = { email: formData.get("email") as string };

  const { data, error } = await supabase.auth.resetPasswordForEmail(
    emailInput.email,
    {
      redirectTo: baseUrl + SiteNavigation.resetPassword,
    }
  );

  if (error) {
    serverError = { error_message: error.message };
    return serverError;
  }

  return null;
}

async function getIp() {
  const ip = headers().get("x-forwarded-for");
  return ip;
}
