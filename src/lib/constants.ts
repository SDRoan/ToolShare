import { ListingCategory } from "@/types/database";

export const CATEGORIES = [
  "Tools",
  "Outdoor",
  "Kitchen",
  "Electronics",
  "Sports",
  "Other"
] as const satisfies readonly ListingCategory[];

export const AVAILABILITY_OPTIONS = [
  { label: "Available", value: true },
  { label: "Unavailable", value: false }
];
