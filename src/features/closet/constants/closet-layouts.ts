import type {
  ClosetSectionId,
  ClosetSectionSlot,
  ClosetTemplateId,
  ClosetTemplateLayout,
} from "@/features/closet/types/closet-layout";

type SlotSpec = Omit<ClosetSectionSlot, "id">;

export const CLOSET_TEMPLATE_IDS = [
  "LAYOUT_1",
  "LAYOUT_2",
  "LAYOUT_3",
  "LAYOUT_4",
  "LAYOUT_5",
  "LAYOUT_6",
  "LAYOUT_7",
  "LAYOUT_8",
  "LAYOUT_9",
] as const;

const LAYOUT_SPECS: Record<(typeof CLOSET_TEMPLATE_IDS)[number], SlotSpec[]> = {
  LAYOUT_1: [
    { left: 10.7, top: 20.2, width: 78.6, height: 24.2, heightPx: 206 },
    { left: 10.7, top: 27.1, width: 78.6, height: 29.7, heightPx: 253 },
  ],
  LAYOUT_2: [
    { left: 10.7, top: 20.2, width: 78.6, height: 40.3, heightPx: 343 },
    { left: 10.7, top: 61.5, width: 78.6, height: 4.2, heightPx: 36 },
    { left: 10.7, top: 66.8, width: 78.6, height: 8.1, heightPx: 69 },
  ],
  LAYOUT_3: [
    { left: 10.7, top: 20.2, width: 78.6, height: 10.9, heightPx: 93 },
    { left: 10.7, top: 32.5, width: 78.6, height: 31.6, heightPx: 269 },
    { left: 10.7, top: 65.5, width: 78.6, height: 4.2, heightPx: 36 },
    { left: 10.7, top: 70.7, width: 78.6, height: 4.2, heightPx: 36 },
  ],
  LAYOUT_4: [
    { left: 4.3, top: 2.5, width: 37.2, height: 53.8, heightPx: 458 },
    { left: 46.1, top: 2.5, width: 37.2, height: 11.7, heightPx: 100 },
    { left: 46.1, top: 4.7, width: 37.2, height: 11.7, heightPx: 100 },
    { left: 46.1, top: 30.4, width: 37.2, height: 11.7, heightPx: 100 },
    { left: 46.1, top: 44.5, width: 37.2, height: 11.7, heightPx: 100 },
  ],
  LAYOUT_5: [
    { left: 4.3, top: 2.5, width: 37.2, height: 6.3, heightPx: 54 },
    { left: 4.3, top: 10.4, width: 37.2, height: 45.8, heightPx: 390 },
    { left: 46.1, top: 2.5, width: 37.2, height: 6.3, heightPx: 54 },
    { left: 46.1, top: 10.4, width: 37.2, height: 30.4, heightPx: 259 },
    { left: 46.1, top: 42.4, width: 37.2, height: 6.5, heightPx: 55 },
    { left: 46.1, top: 49.8, width: 37.2, height: 6.5, heightPx: 55 },
  ],
  LAYOUT_6: [
    { left: 4.3, top: 2.5, width: 37.2, height: 31.6, heightPx: 269 },
    { left: 4.3, top: 35, width: 37.2, height: 6.5, heightPx: 55 },
    { left: 4.3, top: 42.4, width: 37.2, height: 6.5, heightPx: 55 },
    { left: 4.3, top: 49.8, width: 37.2, height: 6.5, heightPx: 55 },
    { left: 46.1, top: 2.5, width: 37.2, height: 39, heightPx: 332 },
    { left: 46.1, top: 42.4, width: 37.2, height: 6.5, heightPx: 55 },
    { left: 46.1, top: 49.8, width: 37.2, height: 6.5, heightPx: 55 },
  ],
  LAYOUT_7: [
    { left: 4.3, top: 2.5, width: 37.2, height: 6.3, heightPx: 54 },
    { left: 4.3, top: 10, width: 37.2, height: 29, heightPx: 247 },
    { left: 4.3, top: 40.3, width: 37.2, height: 4.7, heightPx: 40 },
    { left: 4.3, top: 45.9, width: 37.2, height: 4.7, heightPx: 40 },
    { left: 4.3, top: 51.5, width: 37.2, height: 4.7, heightPx: 40 },
    { left: 46.1, top: 2.5, width: 37.2, height: 6.3, heightPx: 54 },
    { left: 46.1, top: 10, width: 37.2, height: 32.9, heightPx: 280 },
    { left: 46.1, top: 44.2, width: 37.2, height: 12, heightPx: 102 },
  ],
  LAYOUT_8: [
    { left: 4.3, top: 2.5, width: 37.2, height: 4.3, heightPx: 37 },
    { left: 4.3, top: 7.9, width: 37.2, height: 28.3, heightPx: 241 },
    { left: 4.3, top: 37.4, width: 37.2, height: 18.8, heightPx: 160 },
    { left: 46.1, top: 2.5, width: 37.2, height: 6.3, heightPx: 54 },
    { left: 46.1, top: 10, width: 37.2, height: 6.3, heightPx: 54 },
    { left: 46.1, top: 17.5, width: 37.2, height: 6.3, heightPx: 54 },
    { left: 46.1, top: 25, width: 37.2, height: 6.3, heightPx: 54 },
    { left: 46.1, top: 32.7, width: 37.2, height: 10.7, heightPx: 91 },
    { left: 46.1, top: 44.8, width: 37.2, height: 10.7, heightPx: 91 },
  ],
  LAYOUT_9: [
    { left: 4.3, top: 2.5, width: 37.2, height: 6.3, heightPx: 54 },
    { left: 4.3, top: 10, width: 37.2, height: 18.4, heightPx: 157 },
    { left: 4.3, top: 29.6, width: 37.2, height: 8.3, heightPx: 71 },
    { left: 4.3, top: 38.7, width: 37.2, height: 8.3, heightPx: 71 },
    { left: 4.3, top: 47.9, width: 37.2, height: 8.3, heightPx: 71 },
    { left: 46.1, top: 2.5, width: 37.2, height: 6.3, heightPx: 54 },
    { left: 46.1, top: 10, width: 37.2, height: 18.4, heightPx: 157 },
    { left: 46.1, top: 29.6, width: 37.2, height: 8.3, heightPx: 71 },
    { left: 46.1, top: 38.7, width: 37.2, height: 8.3, heightPx: 71 },
    { left: 46.1, top: 47.9, width: 37.2, height: 8.3, heightPx: 71 },
  ],
};

function withSectionIds(slots: SlotSpec[]): ClosetSectionSlot[] {
  return slots.map((slot, index) => ({
    id: `section-${index + 1}` as ClosetSectionId,
    ...slot,
  }));
}

const NEW_LAYOUTS = CLOSET_TEMPLATE_IDS.reduce(
  (layouts, templateId) => ({
    ...layouts,
    [templateId]: withSectionIds(LAYOUT_SPECS[templateId]),
  }),
  {} as Pick<ClosetTemplateLayout, (typeof CLOSET_TEMPLATE_IDS)[number]>,
);

export const CLOSET_LAYOUTS: ClosetTemplateLayout = {
  ...NEW_LAYOUTS,
  LAYOUT_A: NEW_LAYOUTS.LAYOUT_6,
  LAYOUT_B: NEW_LAYOUTS.LAYOUT_3,
  LAYOUT_C: NEW_LAYOUTS.LAYOUT_3,
  LAYOUT_D: NEW_LAYOUTS.LAYOUT_7,
  LAYOUT_E: NEW_LAYOUTS.LAYOUT_9,
};

export function getClosetTemplateSectionCount(templateId: ClosetTemplateId) {
  return CLOSET_LAYOUTS[templateId].length;
}
