"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { PasswordStrengthRgx } from "@/lib/password-strength/password-strength-regex";
import { testEmail } from "@/lib/zod-schemas/signup-zod-schema";
import { checkEmail } from "./check-user-email";
import { SiteNavigation } from "@/lib/site-navigation/site-navigation";
import { headers } from "next/headers";

type serverError = {
  error_message: string;
  code?: number;
};

const provideValidEmail = "Please, provide a valid email address.";
const enterEmailPlease = "Email is required.";
const provideBetterPwd = "Please, create a bit safer password.";
const bummer = "Error signing you up. :( Try again later.";
const emailIsTaken = "That email is already taken.";
const incorrectCreds = "Wrong email or password. Try again.";
const plsConfirm = "Please, confirm your email first.";
const bummer2 = "Error signin you in. :( Try again later.";

export async function logIn(formData: FormData) {
  let serverError: serverError | null = null;

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  if (!data.email) {
    serverError = { error_message: enterEmailPlease };
    return serverError;
  }

  const emailTest = testEmailInput(data?.email);
  if (!emailTest) {
    serverError = { error_message: provideValidEmail };
    return serverError;
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    if (error.message === "Invalid login credentials") {
      serverError = { error_message: incorrectCreds, code: 401 };
      return serverError;
    }
    if (error.message === "Email not confirmed") {
      serverError = { error_message: plsConfirm };
      return serverError;
    } else {
      serverError = { error_message: bummer2 };
    }
    return serverError;
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  let serverError: serverError | null = null;

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const emailTest = testEmailInput(data?.email);
  if (!emailTest) {
    serverError = { error_message: provideValidEmail };
    return serverError;
  }

  const passwordTest = testPassword(data.password);
  if (!passwordTest) {
    serverError = { error_message: provideBetterPwd };
    return serverError;
  }

  const result = await checkEmail(data.email);
  if (result?.error) {
    console.log(result.error);
    serverError = { error_message: bummer };
    return serverError;
  }

  if (result) {
    serverError = { error_message: emailIsTaken };
    return serverError;
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp(data);

  if (error) {
    serverError = { error_message: error.message };
    return serverError;
  }
  cookies().set("emailSent", "true", { path: "/", maxAge: 60 * 5 });

  revalidatePath("/", "layout");
  redirect(SiteNavigation.confirmEmailSent);
}

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

function testEmailInput(email: string): boolean {
  const result = testEmail.safeParse({ email: email });

  if (!result.success) {
    return false;
  }

  return true;
}
