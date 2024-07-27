"use server";

import { createClient } from "@/utils/supabase/server";
import { PasswordStrengthRgx } from "@/lib/password-strength/password-strength-regex";

type ServerResponse = {
  message: string;
  status: number;
  error: boolean;
};

const MESSAGES = {
  weakPassword: "Please create a stronger password.",
  emptyPassword: "Please enter a password.",
  updateFailed:
    "Something went wrong. Unable to update your password. Please contact support.",
  updateSuccess: "Password updated successfully.",
};

export const updatePwd = async (
  formData: FormData
): Promise<ServerResponse> => {
  try {
    const password = formData.get("password") as string;

    if (!password) {
      return { message: MESSAGES.emptyPassword, status: 400, error: true };
    }

    const passwordTest = testPassword(password);
    if (!passwordTest) {
      return { message: MESSAGES.weakPassword, status: 400, error: true };
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { message: error.message, status: 500, error: true };
    }

    return { message: MESSAGES.updateSuccess, status: 200, error: false };
  } catch (err) {
    return handleServerError(err);
  }
};

function testPassword(password: string): boolean {
  return (
    PasswordStrengthRgx.regexLetters.test(password) &&
    PasswordStrengthRgx.regexNumbers.test(password) &&
    PasswordStrengthRgx.regexSpecialChars.test(password) &&
    PasswordStrengthRgx.regexLength.test(password)
  );
}

function handleServerError(err: unknown): ServerResponse {
  if (err instanceof Error) {
    return { message: err.message, status: 500, error: true };
  }
  return { message: "Internal server error", status: 500, error: true };
}
