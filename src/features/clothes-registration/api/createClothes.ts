import { apiClient } from "@/lib/api/client";

export type CreateClothesPayload = {
  photoId: number;
  imageUrl: string;
  productName: string;
  brandName: string;
  color: string;
  category: string;
  purchaseDate: string;
  price: number;
  closetId: number;
  sectionId: number;
};

export type CreateClothesResult = {
  clothesId: number;
  photoId: number;
  imageUrl: string;
  productName?: string | null;
  brandName?: string | null;
  color: string;
  category: string;
  purchaseDate?: string | null;
  price: number;
  closetId?: number;
  sectionId?: number;
  setionId?: number;
  createdAt: string;
};

type CreateClothesResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: CreateClothesResult;
};

export function toClothesColorValue(color: string) {
  return color.trim().toUpperCase();
}

export function toClothesCategoryValue(category: string) {
  const normalized = category
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  if (normalized === "tshirt") {
    return "T_SHIRT";
  }

  return category.trim().toUpperCase().replace(/[\s-]/g, "_");
}

export async function createClothes(payload: CreateClothesPayload) {
  const { data } = await apiClient.post<CreateClothesResponse>("/api/clothes", payload);
  return data.result;
}
