"use server";
import { createClient } from "@/utils/supabase/server";
import { AvatarURLTest } from "@/lib/zod-schemas/update-profile-schema";
import xss from "xss";

type ServerError = {
  error_message: string;
  code?: number;
};

type AvatarResponse = {
  result?: boolean;
  serverError?: ServerError;
};

export async function setAvatar(
  url: string,
  userId: string
): Promise<AvatarResponse> {
  const supabase = createClient();
  try {
    // Sanitiziraj URL i userId pomoću xss
    const sanitizedUrl = xss(url);
    const sanitizedUserId = xss(userId);

    if (!sanitizedUrl) {
      return {
        serverError: { error_message: "Invalid URL", code: 400 },
      };
    }

    const test = AvatarURLTest.safeParse({ url: sanitizedUrl });

    if (!test.success) {
      return {
        serverError: { error_message: "Invalid URL", code: 400 },
      };
    }

    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      return {
        serverError: { error_message: "Unauthorized", code: 401 },
      };
    }
    if (userData.user.id !== sanitizedUserId) {
      return {
        serverError: { error_message: "Unauthorized", code: 401 },
      };
    }
    const { error, data } = await supabase
      .from("profiles")
      .update({ avatar_url: sanitizedUrl })
      .eq("id", sanitizedUserId)
      .single();

    if (error) {
      return {
        serverError: { error_message: error.message, code: 500 },
      };
    }

    return { result: true };
  } catch (error: any) {
    if (error instanceof Error) {
      return { serverError: { error_message: error.message, code: 500 } };
    } else {
      return {
        serverError: { error_message: "Internal server error.", code: 500 },
      };
    }
  }
}
