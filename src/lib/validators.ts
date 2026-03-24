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
  pickupLocation: z
    .object({
      latitude: z.number().min(-90, "Latitude must be between -90 and 90.").max(90, "Latitude must be between -90 and 90."),
      longitude: z
        .number()
        .min(-180, "Longitude must be between -180 and 180.")
        .max(180, "Longitude must be between -180 and 180.")
    })
    .nullable()
    .refine((value) => value !== null, "Add the exact pickup point that should appear on the map."),
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

export const toolRequestSchema = z.object({
  title: z.string().min(4, "Add a clear title for what you need.").max(120, "Keep the title under 120 characters."),
  description: z
    .string()
    .min(10, "Add a few more details so neighbors know what could help.")
    .max(2000, "Descriptions must be under 2000 characters."),
  category: z.enum(CATEGORIES),
  neighborhood: z
    .string()
    .min(2, "Add the neighborhood where you want to borrow.")
    .max(80, "Keep the neighborhood under 80 characters."),
  neededBy: z.string().optional().or(z.literal(""))
});

export const toolRequestCommentSchema = z.object({
  message: z.string().max(1000, "Keep your reply under 1000 characters.").optional().or(z.literal(""))
});

export const borrowRequestChatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Write a message before sending.")
    .max(1000, "Keep your message under 1000 characters.")
});

export const borrowRequestReviewSchema = z.object({
  rating: z.number().int().min(1, "Choose a rating.").max(5, "Ratings go up to 5."),
  comment: z
    .string()
    .trim()
    .max(1000, "Keep your review under 1000 characters.")
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || value.length >= 10, "Add a little more detail or leave the review text blank.")
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ListingFormValues = z.infer<typeof listingSchema>;
export type BorrowRequestFormValues = z.infer<typeof borrowRequestSchema>;
export type ToolRequestFormValues = z.infer<typeof toolRequestSchema>;
export type ToolRequestCommentFormValues = z.infer<typeof toolRequestCommentSchema>;
export type BorrowRequestChatMessageFormValues = z.infer<typeof borrowRequestChatMessageSchema>;
export type BorrowRequestReviewFormValues = z.infer<typeof borrowRequestReviewSchema>;
