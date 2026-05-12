import { create } from "zustand";

import type { PredictedClosetSection } from "@/features/clothes-registration/api/uploadClosetPhoto";

type ClosetRegistrationState = {
  imageUri: string | null;
  imageUrl: string | null;
  templateId: string | null;
  predictedSections: PredictedClosetSection[];
  setDraft: (draft: Partial<Pick<ClosetRegistrationState, "imageUri" | "imageUrl" | "templateId" | "predictedSections">>) => void;
  resetDraft: () => void;
};

const initialState = {
  imageUri: null,
  imageUrl: null,
  templateId: null,
  predictedSections: [],
} satisfies Pick<
  ClosetRegistrationState,
  "imageUri" | "imageUrl" | "templateId" | "predictedSections"
>;

export const useClosetRegistrationStore = create<ClosetRegistrationState>()((set) => ({
  ...initialState,
  setDraft: (draft) =>
    set((state) => ({
      ...state,
      ...draft,
    })),
  resetDraft: () =>
    set(() => ({
      ...initialState,
    })),
}));
