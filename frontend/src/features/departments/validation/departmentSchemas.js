import { z } from "zod";

/**
 * Validation schema for corporate department definitions.
 */
export const departmentSchema = z.object({
  name: z
    .string()
    .min(2, "Department name must be at least 2 characters")
    .max(100, "Maximum length is 100 characters")
    .trim(),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(10, "Maximum length is 10 characters")
    .toUpperCase()
    .trim()
    .regex(/^[A-Z]{2,10}$/, "Code must consist of 2 to 10 English letters only"),
  isActive: z.boolean().default(true),
});
