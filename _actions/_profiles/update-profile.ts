"use server";

import { createClient } from "@/utils/supabase/server";
import { UserProfileUpdate } from "@/utils/types/user";
import {
  profileNameTest,
  profileWebsiteTest,
} from "@/lib/zod-schemas/update-profile-schema";

type ServerError = {
  error_message: string;
  code?: number;
};
export async function updateUserProfile(
  updates: UserProfileUpdate
): Promise<Boolean | ServerError> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    const serverError: ServerError = {
      error_message: "Unauthorized.",
      code: 401,
    };
    return serverError;
  }

  const { ...allowedUpdates } = updates;

  if (allowedUpdates.website) {
    const result = profileWebsiteTest.safeParse({
      website: allowedUpdates.website,
    });
    if (!result.success) {
      const serverError: ServerError = {
        error_message:
          result?.error?.errors[0]?.message || "Error parsing username.",
        code: 304,
      };
      return serverError;
    }
  }
  if (allowedUpdates.full_name) {
    const result = profileNameTest.safeParse({
      name: allowedUpdates.full_name,
    });
    if (!result.success) {
      const serverError: ServerError = {
        error_message:
          result?.error?.errors[0]?.message || "Error parsing Website URL.",
        code: 304,
      };
      return serverError;
    }
  }

  const { error, data } = await supabase
    .from("profiles")
    .update(allowedUpdates)
    .eq("id", userData.user.id)
    .single();

  if (error) {
    const serverError: ServerError = {
      error_message: "Internal server error.",
      code: 500,
    };
    return serverError;
  }

  return data;
}
