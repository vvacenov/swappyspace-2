import { z } from "zod";

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

export const profileEmailTest = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .nonempty({ message: "Email address cannot be empty." }),
});

export const AvatarURLTest = z.object({
  url: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .min(86)
    .max(160)
    .regex(
      /^https:\/\/lrfapwkpjlxzbddoyeuh\.supabase\.co\/storage\/v1\/object\/public\/(avatars|user_avatars)\/.*/,
      {
        message: "URL must start with the expected base path.",
      }
    ),
});
