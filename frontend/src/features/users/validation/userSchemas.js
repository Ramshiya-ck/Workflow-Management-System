import { z } from "zod";

export const userCreateSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().optional().or(z.literal("")),
    email: z.string().trim().min(1, "Email is required.").email("Invalid email format."),
    phoneNumber: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || /^\+?1?\d{9,15}$/.test(val), {
        message: "Invalid phone number format. E.g. +919999888877",
      }),
    role: z.string().min(1, "Role is required."),
    departmentId: z.string().optional().nullable().or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .refine((val) => /[A-Za-z]/.test(val) && /\d/.test(val), {
        message: "Password must contain at least one letter and one number.",
      }),
    confirmPassword: z.string().min(1, "Confirm password is required."),
    isActive: z.boolean().default(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const userUpdateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().min(1, "Email is required.").email("Invalid email format."),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^\+?1?\d{9,15}$/.test(val), {
      message: "Invalid phone number format. E.g. +919999888877",
    }),
  role: z.string().min(1, "Role is required."),
  departmentId: z.string().optional().nullable().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .refine((val) => /[A-Za-z]/.test(val) && /\d/.test(val), {
        message: "Password must contain at least one letter and one number.",
      }),
    confirmPassword: z.string().min(1, "Please confirm password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
