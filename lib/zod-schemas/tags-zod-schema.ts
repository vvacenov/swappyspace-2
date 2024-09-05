import { z } from "zod";

export const tagSchema = z
  .string()
  .trim()
  .min(3, "A tag should be at minimum 3 characters long")
  .max(30, "Tag cannot exceed 30 characters")
  .regex(
    /^[a-zA-Z0-9-_]+$/,
    "Tag can only contain letters, numbers, hyphens, and underscores"
  );
