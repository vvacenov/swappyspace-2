import { z } from "zod";

export const urlTest = z.object({
  long_url: z
    .string()
    .min(5, {
      message: "Well... That's too short. Link should be 5 characters or more.",
    })
    .max(2000, { message: "URL's over 2000 characters are not allowed." }),

  antibot: z.string().optional(),
});
