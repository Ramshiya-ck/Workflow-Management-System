import { z } from "zod";

/**
 * Validation constraints for registration/modifications of enterprise supplier profiles.
 */
export const vendorSchema = z.object({
  name: z
    .string()
    .min(2, "Vendor name must be at least 2 characters")
    .max(100, "Maximum length is 100 characters")
    .trim(),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(10, "Maximum length is 10 characters")
    .toUpperCase()
    .trim()
    .regex(/^[A-Z0-9]+$/, "Code must consist of uppercase alphanumeric characters only"),
  contactPerson: z
    .string()
    .min(2, "Contact person name must be at least 2 characters")
    .max(100, "Maximum length is 100 characters")
    .trim(),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address")
    .trim(),
  phone: z
    .string()
    .min(9, "Phone number must contain at least 9 digits")
    .max(15, "Phone number cannot exceed 15 digits")
    .regex(/^\+?[0-9\s-]+$/, "Please enter a valid phone number format"),
  address: z.string().optional().default(""),
  gstNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Please enter a valid 15-digit GSTIN format"),
  isActive: z.boolean().default(true),
});
