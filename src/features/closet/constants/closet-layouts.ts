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
    { left: 5.2, top: 3.5, width: 89.6, height: 38.1, heightPx: 197 },
    { left: 5.2, top: 44.7, width: 89.6, height: 48.9, heightPx: 253 },
  ],
  LAYOUT_2: [
    { left: 5.2, top: 3.3, width: 89.6, height: 66.3, heightPx: 343 },
    { left: 5.2, top: 71.4, width: 89.6, height: 7, heightPx: 36 },
    { left: 5.2, top: 80.1, width: 89.6, height: 13.3, heightPx: 69 },
  ],
  LAYOUT_3: [
    { left: 5.2, top: 3.3, width: 89.6, height: 18, heightPx: 93 },
    { left: 5.2, top: 23.6, width: 89.6, height: 52, heightPx: 269 },
    { left: 5.2, top: 77.9, width: 89.6, height: 7, heightPx: 36 },
    { left: 5.2, top: 86.5, width: 89.6, height: 7, heightPx: 36 },
  ],
  LAYOUT_4: [
    { left: 4.9, top: 4.1, width: 42.3, height: 88.6, heightPx: 458 },
    { left: 52.5, top: 4.1, width: 42.3, height: 19.3, heightPx: 100 },
    { left: 52.5, top: 27.1, width: 42.3, height: 19.3, heightPx: 100 },
    { left: 52.5, top: 50.1, width: 42.3, height: 19.3, heightPx: 100 },
    { left: 52.5, top: 73.3, width: 42.3, height: 19.3, heightPx: 100 },
  ],
  LAYOUT_5: [
    { left: 4.9, top: 4.1, width: 42.3, height: 10.4, heightPx: 54 },
    { left: 4.9, top: 17.2, width: 42.3, height: 75.4, heightPx: 390 },
    { left: 52.5, top: 4.1, width: 42.3, height: 10.4, heightPx: 54 },
    { left: 52.5, top: 17.2, width: 42.3, height: 50.1, heightPx: 259 },
    { left: 52.5, top: 69.8, width: 42.3, height: 10.6, heightPx: 55 },
    { left: 52.5, top: 82, width: 42.3, height: 10.6, heightPx: 55 },
  ],
  LAYOUT_6: [
    { left: 4.9, top: 4.1, width: 42.3, height: 50.5, heightPx: 261 },
    { left: 4.9, top: 57.6, width: 42.3, height: 10.6, heightPx: 55 },
    { left: 4.9, top: 69.8, width: 42.3, height: 10.6, heightPx: 55 },
    { left: 4.9, top: 82, width: 42.3, height: 10.6, heightPx: 55 },
    { left: 52.5, top: 4.1, width: 42.3, height: 64.2, heightPx: 332 },
    { left: 52.5, top: 69.8, width: 42.3, height: 10.6, heightPx: 55 },
    { left: 52.5, top: 82, width: 42.3, height: 10.6, heightPx: 55 },
  ],
  LAYOUT_7: [
    { left: 4.9, top: 4.1, width: 42.3, height: 10.4, heightPx: 54 },
    { left: 4.9, top: 16.4, width: 42.3, height: 47.8, heightPx: 247 },
    { left: 4.9, top: 66.3, width: 42.3, height: 7.7, heightPx: 40 },
    { left: 4.9, top: 75.6, width: 42.3, height: 7.7, heightPx: 40 },
    { left: 4.9, top: 84.9, width: 42.3, height: 7.7, heightPx: 40 },
    { left: 52.5, top: 4.1, width: 42.3, height: 10.4, heightPx: 54 },
    { left: 52.5, top: 16.4, width: 42.3, height: 54.2, heightPx: 280 },
    { left: 52.5, top: 72.8, width: 42.3, height: 19.7, heightPx: 102 },
  ],
  LAYOUT_8: [
    { left: 4.9, top: 4.1, width: 42.3, height: 7.2, heightPx: 37 },
    { left: 4.9, top: 13, width: 42.3, height: 46.6, heightPx: 241 },
    { left: 4.9, top: 61.7, width: 42.3, height: 30.9, heightPx: 160 },
    { left: 52.5, top: 4.1, width: 42.3, height: 10.4, heightPx: 54 },
    { left: 52.5, top: 16.4, width: 42.3, height: 10.4, heightPx: 54 },
    { left: 52.5, top: 28.8, width: 42.3, height: 10.4, heightPx: 54 },
    { left: 52.5, top: 41.2, width: 42.3, height: 10.4, heightPx: 54 },
    { left: 52.5, top: 53.4, width: 42.3, height: 17.6, heightPx: 91 },
    { left: 52.5, top: 73, width: 42.3, height: 19.7, heightPx: 102 },
  ],
  LAYOUT_9: [
    { left: 4.9, top: 4.1, width: 42.3, height: 10.4, heightPx: 54 },
    { left: 4.9, top: 16.4, width: 42.3, height: 30.4, heightPx: 157 },
    { left: 4.9, top: 48.7, width: 42.3, height: 13.7, heightPx: 71 },
    { left: 4.9, top: 63.8, width: 42.3, height: 13.7, heightPx: 71 },
    { left: 4.9, top: 78.9, width: 42.3, height: 13.7, heightPx: 71 },
    { left: 52.5, top: 4.1, width: 42.3, height: 10.4, heightPx: 54 },
    { left: 52.5, top: 16.4, width: 42.3, height: 30.4, heightPx: 157 },
    { left: 52.5, top: 48.7, width: 42.3, height: 13.7, heightPx: 71 },
    { left: 52.5, top: 63.8, width: 42.3, height: 13.7, heightPx: 71 },
    { left: 52.5, top: 78.9, width: 42.3, height: 13.7, heightPx: 71 },
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
