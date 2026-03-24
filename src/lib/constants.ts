import { ListingCategory } from "@/types/database";

export const CATEGORIES = [
  "Tools",
  "Outdoor",
  "Kitchen",
  "Electronics",
  "Sports",
  "Other"
] as const satisfies readonly ListingCategory[];

export const OPEN_FREE_MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export const DEFAULT_MAP_VIEW = {
  latitude: 39.8283,
  longitude: -98.5795,
  zoom: 3.5
} as const;

export const AVAILABILITY_OPTIONS = [
  { label: "Available", value: true },
  { label: "Unavailable", value: false }
];
