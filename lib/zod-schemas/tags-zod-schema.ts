import { z } from "zod";

export const tagSchema = z
  .string()
  .trim()
  .min(1, "Tag cannot be empty")
  .max(30, "Tag cannot exceed 30 characters")
  .regex(
    /^[a-zA-Z0-9-_]+$/,
    "Tag can only contain letters, numbers, hyphens, and underscores"
  );
