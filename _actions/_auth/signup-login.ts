"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { PasswordStrengthRgx } from "@/lib/password-strength/password-strength-regex";
import { testEmail } from "@/lib/zod-schemas/signup-zod-schema";
import { checkEmail } from "./check-user-email";
import { SiteNavigation } from "@/lib/site-navigation/site-navigation";

type ServerError = {
  message: string;
  status: number;
  error: boolean;
};

const MESSAGES = {
  invalidEmail: "Please provide a valid email address.",
  missingEmail: "Email is required.",
  weakPassword: "Please create a stronger password.",
  signUpError: "An error occurred during sign up. Please try again later.",
  emailTaken: "This email is already taken.",
  invalidCredentials: "Invalid email or password. Please try again.",
  confirmEmail: "Please confirm your email address first.",
  signInError: "An error occurred during sign in. Please try again later.",
};

export async function logIn(formData: FormData): Promise<ServerError | null> {
  try {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    if (!data.email) {
      return { message: MESSAGES.missingEmail, status: 400, error: true };
    }

    const emailTest = testEmailInput(data.email);
    if (!emailTest) {
      return { message: MESSAGES.invalidEmail, status: 400, error: true };
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      const errorMessage = getSignInErrorMessage(error.message);
      return {
        message: errorMessage.message,
        status: errorMessage.status,
        error: true,
      };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  } catch (err) {
    return handleServerError(err);
  }
}

export async function signUp(formData: FormData): Promise<ServerError | null> {
  try {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const emailTest = testEmailInput(data.email);
    if (!emailTest) {
      return { message: MESSAGES.invalidEmail, status: 400, error: true };
    }

    const passwordTest = testPassword(data.password);
    if (!passwordTest) {
      return { message: MESSAGES.weakPassword, status: 400, error: true };
    }

    const result = await checkEmail(data.email);
    if ("error" in result && result.error) {
      return { message: MESSAGES.signUpError, status: 500, error: true };
    }

    if ("exists" in result && result.exists) {
      return { message: MESSAGES.emailTaken, status: 409, error: true };
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp(data);

    if (error) {
      return { message: error.message, status: 500, error: true };
    }

    cookies().set("emailSent", "true", { path: "/", maxAge: 60 * 5 });

    revalidatePath("/", "layout");
    redirect(SiteNavigation.confirmEmailSent);
  } catch (err) {
    return handleServerError(err);
  }
}

function testPassword(password: string): boolean {
  return (
    PasswordStrengthRgx.regexLetters.test(password) &&
    PasswordStrengthRgx.regexNumbers.test(password) &&
    PasswordStrengthRgx.regexSpecialChars.test(password) &&
    PasswordStrengthRgx.regexLength.test(password)
  );
}

function testEmailInput(email: string): boolean {
  const result = testEmail.safeParse({ email });

  return result.success;
}

function getSignInErrorMessage(errorMessage: string) {
  if (errorMessage === "Invalid login credentials") {
    return { message: MESSAGES.invalidCredentials, status: 401 };
  }
  if (errorMessage === "Email not confirmed") {
    return { message: MESSAGES.confirmEmail, status: 403 };
  }
  return { message: MESSAGES.signInError, status: 500 };
}

function handleServerError(err: unknown): ServerError {
  if (err instanceof Error) {
    return { message: err.message, status: 500, error: true };
  }
  return { message: "Internal server error", status: 500, error: true };
}
