import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

export type CreateClosetSectionPayload = {
  sectionOrder: number;
  sectionName: string;
};

export type CreateClosetPayload = {
  templateId: number;
  imageUrl: string;
  sections: CreateClosetSectionPayload[];
};

export type CreateClosetResult = {
  closetId: number;
  templateId: number;
  imageUrl: string;
  sections: {
    sectionId: number;
    sectionOrder: number;
    sectionName: string;
  }[];
};

type CreateClosetResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: CreateClosetResult | null;
};

export async function createCloset(payload: CreateClosetPayload) {
  const { data } = await apiClient.post<CreateClosetResponse>("/api/closets", payload);

  if (!data.isSuccess || !data.result) {
    throw new ApiError({
      code: data.code,
      message: data.message,
      status: 400,
      details: data.result,
    });
  }

  return data.result;
}
