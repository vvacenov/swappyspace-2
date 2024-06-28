import { z } from "zod";

export const testEmail = z.object({
  email: z.string().email(),
});
