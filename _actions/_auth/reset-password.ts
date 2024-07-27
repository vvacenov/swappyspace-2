"use server";

import { createClient } from "@/utils/supabase/server";
import { SiteNavigation, baseUrl } from "@/lib/site-navigation/site-navigation";
import { headers } from "next/headers";

type ServerError = {
  message: string;
  status: number;
  error: boolean;
};

export async function resetPwd(formData: FormData) {
  try {
    if (!formData.get("email")) {
      return {
        message: "Please enter email address.",
        status: 400,
        error: true,
      };
    }

    const supabase = createClient();
    const email = formData.get("email") as string;

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
