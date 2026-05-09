import { apiClient } from "@/lib/api/client";

export type CreateClothesPayload = {
  photoId: number;
  imageUrl: string;
  color: string;
  category: string;
  price: number;
  sectionId: number;
};

export type CreateClothesResult = {
  clothesId: number;
  photoId: number;
  imageUrl: string;
  color: string;
  category: string;
  price: number;
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
  return category.trim().toUpperCase().replace(/[\s-]/g, "_");
}

export async function createClothes(payload: CreateClothesPayload) {
  const { data } = await apiClient.post<CreateClothesResponse>("/api/clothes", payload);
  return data.result;
}
