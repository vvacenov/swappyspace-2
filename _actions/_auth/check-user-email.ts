"use server";

import { createServiceClient } from "@/utils/supabase/service-server";

type ServerError = {
  message: string;
  status: number;
  error: boolean;
};

type CheckEmailResponse =
  | {
      exists: boolean;
      status: number;
      error: boolean;
    }
  | ServerError;

export async function checkEmail(email: string): Promise<CheckEmailResponse> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc("check_email_exists", {
      user_email: email,
    });

    if (error) {
      return {
        message: error.message,
        status: 500,
        error: true,
      };
    }

    return {
      exists: data,
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
