"use server";

import { createClient } from "@/utils/supabase/server";
import { PasswordStrengthRgx } from "@/lib/password-strength/password-strength-regex";

type serverError = {
  error_message: string;
  code?: number;
};
const provideBetterPwd = "Please, create a bit safer password.";
const pwdEmpty = "Please, enter a password.";
const failedToUpdate =
  "Something went wrong. Unable to update your password. :( Please, contact support.";

export const updatePwd = async (formData: FormData) => {
  let serverError: serverError | null = null;
  const password = formData.get("password") as string;
  if (!password) {
    serverError = { error_message: pwdEmpty };
    return serverError;
  }

  const passwordTest = testPassword(password);
  if (!passwordTest) {
    serverError = { error_message: provideBetterPwd };
    return serverError;
  }

  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    serverError = { error_message: error.message };

    return serverError;
  }
};

function testPassword(password: string): boolean {
  if (
    !PasswordStrengthRgx.regexLetters.test(password) ||
    !PasswordStrengthRgx.regexNumbers.test(password) ||
    !PasswordStrengthRgx.regexSpecialChars.test(password) ||
    !PasswordStrengthRgx.regexLength.test(password)
  ) {
    return false;
  }
  return true;
}
