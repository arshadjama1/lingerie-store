import { z } from "zod";

export const CreateAddressSchema = z.object({
  label: z.string().min(1).max(50).default("home"),
  fullName: z.string().min(1, "Full name is required").max(255),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Pincode must be a valid 6-digit postal code"),
  isDefault: z.boolean().optional().default(false),
});

export const UpdateAddressSchema = CreateAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;
