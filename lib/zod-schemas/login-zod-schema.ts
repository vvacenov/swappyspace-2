import { z } from "zod";

export const loginZodSchema = z.object({
  email: z
    .string()
    .email({ message: "That email doesn't look right. Try again." }),

  password: z.string().min(1, { message: "Please enter your password." }),
});
