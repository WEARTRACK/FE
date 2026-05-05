import type { ClosetSectionId } from "@/features/closet/types/closet-layout";

export const CLOSET_COLORS = [
  "red",
  "pink",
  "orange",
  "yellow",
  "green",
  "blue",
  "navy",
  "purple",
  "white",
  "beige",
  "brown",
  "gray",
  "black",
] as const;

export const CLOSET_CATEGORIES = [
  "tshirt",
  "shirt",
  "knit",
  "hoodie",
  "vest",
  "cardigan",
  "pants",
  "shorts",
  "skirt",
  "dress",
  "jacket",
  "coat",
  "padding",
] as const;

export type ClosetColor = (typeof CLOSET_COLORS)[number];
export type ClosetCategory = (typeof CLOSET_CATEGORIES)[number];

export type ClosetItem = {
  id: string;
  sectionId: ClosetSectionId;
  imageUri: string;
  price: number;
  color: ClosetColor;
  colorLabel: string;
  category: ClosetCategory;
  categoryLabel: string;
};
