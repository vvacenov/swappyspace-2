"use server";

import { createClient } from "@/utils/supabase/server";
import { PasswordStrengthRgx } from "@/lib/password-strength/password-strength-regex";
import xss from "xss";

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
  const supabase = createClient();
  try {
    const rawPassword = formData.get("password");

    if (!rawPassword) {
      return { message: MESSAGES.emptyPassword, status: 400, error: true };
    }

    // Sanitiziraj lozinku pomoću xss
    const password = xss(rawPassword as string);

    const passwordTest = testPassword(password);
    if (!passwordTest) {
      return { message: MESSAGES.weakPassword, status: 400, error: true };
    }

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
