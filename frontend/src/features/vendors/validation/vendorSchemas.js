import { z } from "zod";

/**
 * Validation constraints for registration/modifications of enterprise supplier profiles.
 */
export const vendorSchema = z.object({
  name: z
    .string()
    .min(2, "Vendor name must be at least 2 characters")
    .max(150, "Maximum length is 150 characters")
    .trim(),
  address: z
    .string()
    .min(1, "Address is required")
    .trim(),
  mobileNumber: z
    .string()
    .min(9, "Mobile number must contain at least 9 digits")
    .max(15, "Mobile number cannot exceed 15 digits")
    .regex(/^\+?1?\d{9,15}$/, "Must be entered in the format: '+999999999'. Up to 15 digits allowed."),
  gstNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/, "Invalid GST Number format. Must be a valid 15-character GSTIN."),
  creditDays: z.coerce
    .number()
    .min(0, "Credit days must be a non-negative number"),
  isActive: z.boolean().default(true),
});
