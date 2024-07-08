"use server";

import { createClient } from "@/utils/supabase/server";
import { UserProfileUpdate } from "@/utils/types/user";
import {
  profileNameTest,
  profileWebsiteTest,
  profileEmailTest,
} from "@/lib/zod-schemas/update-profile-schema";

type ServerError = {
  error_message: string;
  code?: number;
};

type ProfileUpdateResponse = {
  result?: boolean;
  serverError?: ServerError;
};

export async function updateUserProfile(
  updates: UserProfileUpdate
): Promise<ProfileUpdateResponse> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      return {
        serverError: { error_message: "Unauthorized.", code: 401 },
      };
    }

    const { ...allowedUpdates } = updates;

    if (allowedUpdates.website) {
      const result = profileWebsiteTest.safeParse({
        website: allowedUpdates.website,
      });
      if (!result.success) {
        return {
          serverError: {
            error_message:
              result?.error?.errors[0]?.message || "Error parsing website URL.",
            code: 304,
          },
        };
      }
    }
    if (allowedUpdates.full_name) {
      const result = profileNameTest.safeParse({
        name: allowedUpdates.full_name,
      });
      if (!result.success) {
        return {
          serverError: {
            error_message:
              result?.error?.errors[0]?.message || "Error parsing full name.",
            code: 304,
          },
        };
      }
    }
    if (allowedUpdates.email) {
      const result = profileEmailTest.safeParse({
        email: allowedUpdates.email,
      });
      if (!result.success) {
        return {
          serverError: {
            error_message:
              result?.error?.errors[0]?.message ||
              "Error parsing email address.",
            code: 304,
          },
        };
      }
    }

    const { error, data } = await supabase
      .from("profiles")
      .update(allowedUpdates)
      .eq("id", userData.user.id)
      .single();

    if (error) {
      return {
        serverError: { error_message: "Internal server error. :(", code: 500 },
      };
    }

    return { result: true };
  } catch (error: any) {
    if (error instanceof Error) {
      return {
        serverError: { error_message: "Internal server error. :(", code: 500 },
      };
    } else {
      return {
        serverError: { error_message: "Internal server error. :(", code: 500 },
      };
    }
  }
}
