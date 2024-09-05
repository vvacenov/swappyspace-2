"use server";

import { createClient } from "@/utils/supabase/server";
import { SiteNavigation, baseUrl } from "@/lib/site-navigation/site-navigation";
import { headers } from "next/headers";
import xss from "xss";

type ServerError = {
  message: string;
  status: number;
  error: boolean;
};

export async function resetPwd(formData: FormData) {
  const supabase = createClient();
  try {
    const rawEmail = formData.get("email");
    if (!rawEmail) {
      return {
        message: "Please enter email address.",
        status: 400,
        error: true,
      };
    }

    // Sanitiziraj email pomoću xss
    const email = xss(rawEmail as string);

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: baseUrl + SiteNavigation.resetPassword,
    });

    if (error) {
      return {
        message: error.message,
        status: 500,
        error: true,
      };
    }

    return {
      message: "Password reset email sent successfully.",
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
