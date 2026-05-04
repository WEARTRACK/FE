import { MOCK_CLOSET_ITEMS } from "@/features/closet/mock/closet-items";
import { MOCK_CLOSET_TEMPLATE } from "@/features/closet/mock/closet-template";
import type { ClosetItem } from "@/features/closet/types/closet-item";
import type { ClosetSectionId, ClosetTemplate } from "@/features/closet/types/closet-layout";

export type ClosetDataRepository = {
  getTemplate: () => Promise<ClosetTemplate>;
  getItemsBySectionId: (sectionId: ClosetSectionId) => Promise<ClosetItem[]>;
  getItemById: (sectionId: ClosetSectionId, itemId: string) => Promise<ClosetItem | null>;
};

export const mockClosetRepository: ClosetDataRepository = {
  getTemplate: async () => structuredClone(MOCK_CLOSET_TEMPLATE),
  getItemsBySectionId: async (sectionId) =>
    structuredClone(MOCK_CLOSET_ITEMS.filter((item) => item.sectionId === sectionId)),
  getItemById: async (sectionId, itemId) => {
    const item = MOCK_CLOSET_ITEMS.find((target) => target.sectionId === sectionId && target.id === itemId);
    return item ? structuredClone(item) : null;
  },
};
