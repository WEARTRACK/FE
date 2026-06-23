import { create } from "zustand";

type ClosetRegistrationState = {
  imageUri: string | null;
  imageUrl: string | null;
  detectedSectionCount: number | null;
  recommendedTemplateIds: string[];
  templateId: string | null;
  setDraft: (
    draft: Partial<
      Pick<
        ClosetRegistrationState,
        "imageUri" | "imageUrl" | "detectedSectionCount" | "recommendedTemplateIds" | "templateId"
      >
    >,
  ) => void;
  resetDraft: () => void;
};

const initialState = {
  imageUri: null,
  imageUrl: null,
  detectedSectionCount: null,
  recommendedTemplateIds: [],
  templateId: null,
} satisfies Pick<
  ClosetRegistrationState,
  "imageUri" | "imageUrl" | "detectedSectionCount" | "recommendedTemplateIds" | "templateId"
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
