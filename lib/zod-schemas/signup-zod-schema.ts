import { z } from "zod";
import { PasswordStrengthRgx } from "../password-strength/password-strength-regex";

export const signupZodSchema = z.object({
  email: z
    .string()
    .email({ message: "That email doesn't look right. Try again." }),
  password: z
    .string()
    .min(9, { message: "Please enter your password." })
    .superRefine((password, ctx) => {
      if (!PasswordStrengthRgx.regexLetters.test(password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must contain at least one letter.",
        });
      }
      if (!PasswordStrengthRgx.regexNumbers.test(password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must contain at least one number.",
        });
      }
      if (!PasswordStrengthRgx.regexSpecialChars.test(password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must contain at least one special character.",
        });
      }
    }),
});

export const testEmail = z.object({
  email: z.string().email(),
});
