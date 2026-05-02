import type {
  ClosetSectionSlot,
  ClosetTemplateId,
  ClosetTemplateLayout,
} from "@/features/closet/types/closet-layout";

const BASE_SCREEN_WIDTH = 393;
const BASE_SCREEN_HEIGHT = 852;
const BASE_FRAME_LEFT = 24;
const BASE_FRAME_TOP = 155;
const BASE_FRAME_WIDTH = 345;
const BASE_FRAME_HEIGHT = 517;

const SCREEN_LAYOUTS: ClosetTemplateLayout = {
  LAYOUT_A: [
    { id: "section-1", left: 10.4, top: 21.7, width: 37.2, height: 23.7 },
    { id: "section-2", left: 52.2, top: 21.7, width: 37.2, height: 23.7 },
    { id: "section-3", left: 10.4, top: 47.5, width: 37.2, height: 10.4 },
    { id: "section-4", left: 52.2, top: 47.5, width: 37.2, height: 26.9 },
    { id: "section-5", left: 10.4, top: 60.3, width: 37.2, height: 3.9 },
    { id: "section-6", left: 10.4, top: 65.5, width: 37.2, height: 3.9 },
    { id: "section-7", left: 10.4, top: 70.7, width: 37.2, height: 3.9 },
  ],
  LAYOUT_B: [
    { id: "section-1", left: 10.4, top: 21.7, width: 78.6, height: 23.7 },
    { id: "section-2", left: 10.4, top: 47.5, width: 78.6, height: 13.5 },
    { id: "section-3", left: 10.4, top: 63.3, width: 78.6, height: 6.1 },
    { id: "section-4", left: 10.4, top: 70.7, width: 78.6, height: 3.9 },
  ],
  LAYOUT_C: [
    { id: "section-1", left: 10.4, top: 21.7, width: 78.6, height: 6.0 },
    { id: "section-2", left: 10.4, top: 30.2, width: 78.6, height: 30.5 },
    { id: "section-3", left: 10.4, top: 63.3, width: 78.6, height: 6.1 },
    { id: "section-4", left: 10.4, top: 70.7, width: 78.6, height: 3.9 },
  ],
  LAYOUT_D: [
    { id: "section-1", left: 10.4, top: 21.7, width: 78.6, height: 6.0 },
    { id: "section-2", left: 10.4, top: 30.6, width: 36.9, height: 30.5 },
    { id: "section-3", left: 10.4, top: 63.3, width: 36.9, height: 6.1 },
    { id: "section-4", left: 10.4, top: 70.7, width: 36.9, height: 3.9 },
    { id: "section-5", left: 52.2, top: 30.6, width: 36.9, height: 6.2 },
    { id: "section-6", left: 52.2, top: 37.7, width: 36.9, height: 6.2 },
    { id: "section-7", left: 52.2, top: 44.7, width: 36.9, height: 6.2 },
    { id: "section-8", left: 52.2, top: 52.3, width: 36.9, height: 22.2 },
  ],
  LAYOUT_E: [
    { id: "section-1", left: 10.4, top: 21.7, width: 48.3, height: 27.5 },
    { id: "section-2", left: 10.4, top: 51.1, width: 48.3, height: 14.8 },
    { id: "section-3", left: 10.4, top: 67.1, width: 23.2, height: 8.1 },
    { id: "section-4", left: 35.6, top: 67.1, width: 23.2, height: 8.1 },
    { id: "section-5", left: 62.1, top: 21.8, width: 27.0, height: 8.0 },
    { id: "section-6", left: 62.1, top: 30.88, width: 27.0, height: 8.0 },
    { id: "section-7", left: 62.1, top: 39.96, width: 27.0, height: 8.0 },
    { id: "section-8", left: 62.1, top: 49.04, width: 27.0, height: 8.0 },
    { id: "section-9", left: 62.1, top: 58.12, width: 27.0, height: 8.0 },
    { id: "section-10", left: 62.1, top: 67.2, width: 27.0, height: 8.0 },
  ],
};

function convertToFramePercent(slot: ClosetSectionSlot): ClosetSectionSlot {
  const leftPx = (slot.left / 100) * BASE_SCREEN_WIDTH;
  const topPx = (slot.top / 100) * BASE_SCREEN_HEIGHT;
  const widthPx = (slot.width / 100) * BASE_SCREEN_WIDTH;
  const heightPx = (slot.height / 100) * BASE_SCREEN_HEIGHT;

  return {
    ...slot,
    left: ((leftPx - BASE_FRAME_LEFT) / BASE_FRAME_WIDTH) * 100,
    top: ((topPx - BASE_FRAME_TOP) / BASE_FRAME_HEIGHT) * 100,
    width: (widthPx / BASE_FRAME_WIDTH) * 100,
    height: (heightPx / BASE_FRAME_HEIGHT) * 100,
  };
}

function convertLayoutToFramePercent(templateId: ClosetTemplateId): ClosetSectionSlot[] {
  return SCREEN_LAYOUTS[templateId].map(convertToFramePercent);
}

export const CLOSET_LAYOUTS: ClosetTemplateLayout = {
  LAYOUT_A: convertLayoutToFramePercent("LAYOUT_A"),
  LAYOUT_B: convertLayoutToFramePercent("LAYOUT_B"),
  LAYOUT_C: convertLayoutToFramePercent("LAYOUT_C"),
  LAYOUT_D: convertLayoutToFramePercent("LAYOUT_D"),
  LAYOUT_E: convertLayoutToFramePercent("LAYOUT_E"),
};
