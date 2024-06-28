import { z } from "zod";

export const StringPassword = z.object({
  password: z.string(),
});
