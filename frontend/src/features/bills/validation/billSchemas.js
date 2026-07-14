import { z } from "zod";

/**
 * Validation schema for registering/modifying invoice profiles.
 */
export const billSchema = z.object({
  vendor: z.string().min(1, "Please select an associated vendor"),
  department: z.string().min(1, "Please select an internal department"),
  billNumber: z
    .string()
    .min(1, "Invoice number is required")
    .max(50, "Maximum length is 50 characters")
    .trim(),
  billDate: z
    .string()
    .min(1, "Invoice issue date is required")
    .refine((val) => !isNaN(Date.parse(val)), "Please enter a valid date format"),
  amount: z
    .string()
    .min(1, "Bill amount is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Please enter a valid positive decimal amount"
    ),
  description: z.string().optional().default(""),
});
