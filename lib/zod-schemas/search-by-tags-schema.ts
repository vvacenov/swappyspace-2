import { z } from "zod";

export const tagSearchSchema = z.object({ tag: z.string() });
