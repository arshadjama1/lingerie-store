import { z } from "zod";

export const UpdateProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .max(100, "First name cannot exceed 100 characters")
    .optional()
    .nullable(),
  lastName: z
    .string()
    .trim()
    .max(100, "Last name cannot exceed 100 characters")
    .optional()
    .nullable(),
  phone: z
    .string()
    .trim()
    .refine((val) => !val || /^\+?[0-9]{10,15}$/.test(val), {
      message: "Please enter a valid phone number (at least 10 digits)",
    })
    .optional()
    .nullable(),
  email: z
    .string()
    .trim()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Please enter a valid email address",
    })
    .optional()
    .nullable(),
  avatarUrl: z.string().trim().url("Invalid avatar URL").optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
