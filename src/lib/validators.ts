import { z } from "zod";

import { CATEGORIES } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters.")
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Tell neighbors your name.").max(80, "Keep it under 80 characters."),
  neighborhood: z
    .string()
    .min(2, "Add your neighborhood so people nearby can find you.")
    .max(80, "Keep it under 80 characters.")
});

export const listingSchema = z.object({
  title: z.string().min(2, "Add a short title.").max(120, "Keep the title under 120 characters."),
  description: z
    .string()
    .min(10, "Add a few more details so borrowers know what they are requesting.")
    .max(2000, "Descriptions must be under 2000 characters."),
  category: z.enum(CATEGORIES),
  neighborhood: z
    .string()
    .min(2, "Add the neighborhood where pickup happens.")
    .max(80, "Keep the neighborhood under 80 characters."),
  isAvailable: z.boolean()
});

export const borrowRequestSchema = z
  .object({
    startDate: z.string().min(1, "Choose a start date."),
    endDate: z.string().min(1, "Choose an end date."),
    message: z.string().max(500, "Keep your message under 500 characters.").optional().or(z.literal(""))
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: "End date must be the same day or after the start date.",
    path: ["endDate"]
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ListingFormValues = z.infer<typeof listingSchema>;
export type BorrowRequestFormValues = z.infer<typeof borrowRequestSchema>;
