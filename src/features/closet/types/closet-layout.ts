export type ClosetTemplateId =
  | "LAYOUT_1"
  | "LAYOUT_2"
  | "LAYOUT_3"
  | "LAYOUT_4"
  | "LAYOUT_5"
  | "LAYOUT_6"
  | "LAYOUT_7"
  | "LAYOUT_8"
  | "LAYOUT_9"
  | "LAYOUT_A"
  | "LAYOUT_B"
  | "LAYOUT_C"
  | "LAYOUT_D"
  | "LAYOUT_E";
export type ClosetSectionId =
  | "section-1"
  | "section-2"
  | "section-3"
  | "section-4"
  | "section-5"
  | "section-6"
  | "section-7"
  | "section-8"
  | "section-9"
  | "section-10";

export type ClosetSectionSlot = {
  id: ClosetSectionId;
  left: number;
  top: number;
  width: number;
  height: number;
  heightPx: number;
};

export type ClosetTemplateLayout = Record<ClosetTemplateId, ClosetSectionSlot[]>;

export type ClosetSection = {
  id: ClosetSectionId;
  apiSectionId?: number;
  sectionName?: string;
};

export type ClosetTemplate = {
  templateId: ClosetTemplateId;
  sections: ClosetSection[];
};

const CLOSET_SECTION_ID_SET: Record<ClosetSectionId, true> = {
  "section-1": true,
  "section-2": true,
  "section-3": true,
  "section-4": true,
  "section-5": true,
  "section-6": true,
  "section-7": true,
  "section-8": true,
  "section-9": true,
  "section-10": true,
};

export function isClosetSectionId(value: string): value is ClosetSectionId {
  return value in CLOSET_SECTION_ID_SET;
}
