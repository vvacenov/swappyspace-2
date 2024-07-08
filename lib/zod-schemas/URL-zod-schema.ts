import { z } from "zod";
import { urlPattern } from "./URL-REGEX";

export const testURL = z.object({
  url: z.string().refine(
    (value) => {
      return urlPattern.test(value);
    },
    {
      message: "Invalid URL format. Please enter a valid URL.",
    }
  ),
});
