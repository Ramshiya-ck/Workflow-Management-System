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
    .regex(/^[A-Z0-9]+$/, "Code must consist of uppercase alphanumeric characters only"),
  managerId: z.string().min(1, "Please select a department manager"),
  description: z.string().optional().default(""),
  isActive: z.boolean().default(true),
});
