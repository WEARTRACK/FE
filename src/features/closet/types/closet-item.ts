import type { ClosetSectionId } from "@/features/closet/types/closet-layout";

export type ClosetColor = "navy" | "white" | "blue" | "pink" | "gray" | "black" | "beige";
export type ClosetCategory = "dress" | "shirt" | "shorts" | "jacket" | "coat" | "skirt";

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
