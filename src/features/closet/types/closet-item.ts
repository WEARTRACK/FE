import type { ClosetSectionId } from "@/features/closet/types/closet-layout";

export type ClosetColor =
  | "red"
  | "pink"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "navy"
  | "purple"
  | "white"
  | "beige"
  | "brown"
  | "gray"
  | "black";
export type ClosetCategory =
  | "tshirt"
  | "shirt"
  | "knit"
  | "hoodie"
  | "vest"
  | "cardigan"
  | "pants"
  | "shorts"
  | "skirt"
  | "dress"
  | "jacket"
  | "coat"
  | "padding";

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
