import { z } from "zod";
import { urlPattern } from "@/lib/zod-schemas/URL-REGEX";

export const profileNameTest = z.object({
  name: z
    .string()
    .min(3, {
      message: "Username should have at least 3 characters. Please try again.",
    })
    .max(40, {
      message:
        "Maximum length for username is 60 characters. Please try again.",
    }),
});

export const profileWebsiteTest = z.object({
  website: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .max(1000),
});
