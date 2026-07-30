import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";

import ClosetTemplate10_1 from "../../../../assets/closet-template-10-1.svg";
import ClosetTemplate10_2 from "../../../../assets/closet-template-10-2.svg";
import ClosetTemplate2_1 from "../../../../assets/closet-template-2-1.svg";
import ClosetTemplate3_1 from "../../../../assets/closet-template-3-1.svg";
import ClosetTemplate4_1 from "../../../../assets/closet-template-4-1.svg";
import ClosetTemplate4_2 from "../../../../assets/closet-template-4-2.svg";
import ClosetTemplate4_3 from "../../../../assets/closet-template-4-3.svg";
import ClosetTemplate5_1 from "../../../../assets/closet-template-5-1.svg";
import ClosetTemplate6_1 from "../../../../assets/closet-template-6-1.svg";
import ClosetTemplate7_1 from "../../../../assets/closet-template-7-1.svg";
import ClosetTemplate7_2 from "../../../../assets/closet-template-7-2.svg";
import ClosetTemplate8_1 from "../../../../assets/closet-template-8-1.svg";
import ClosetTemplate8_2 from "../../../../assets/closet-template-8-2.svg";
import ClosetTemplate9_1 from "../../../../assets/closet-template-9-1.svg";
import { CLOSET_LAYOUTS } from "@/features/closet/constants/closet-layouts";
import type { ClosetTemplateId } from "@/features/closet/types/closet-layout";

type ClosetTemplateImage = ComponentType<SvgProps>;

export type ClosetTemplate = {
  id: string;
  sectionCount: number;
  layoutId: ClosetTemplateId;
  Image: ClosetTemplateImage;
};

const layoutIdBySectionCount: Record<number, ClosetTemplateId> = {
  2: "LAYOUT_1",
  3: "LAYOUT_2",
  4: "LAYOUT_3",
  5: "LAYOUT_4",
  6: "LAYOUT_5",
  7: "LAYOUT_6",
  8: "LAYOUT_7",
  9: "LAYOUT_8",
  10: "LAYOUT_9",
};

function createTemplate(
  id: string,
  sectionCount: number,
  Image: ClosetTemplateImage,
): ClosetTemplate {
  return {
    id,
    sectionCount,
    layoutId: layoutIdBySectionCount[sectionCount],
    Image,
  };
}

export const closetTemplates: ClosetTemplate[] = [
  createTemplate("2-1", 2, ClosetTemplate2_1),
  createTemplate("3-1", 3, ClosetTemplate3_1),
  createTemplate("4-1", 4, ClosetTemplate4_1),
  createTemplate("4-2", 4, ClosetTemplate4_2),
  createTemplate("4-3", 4, ClosetTemplate4_3),
  createTemplate("5-1", 5, ClosetTemplate5_1),
  createTemplate("6-1", 6, ClosetTemplate6_1),
  createTemplate("7-1", 7, ClosetTemplate7_1),
  createTemplate("7-2", 7, ClosetTemplate7_2),
  createTemplate("8-1", 8, ClosetTemplate8_1),
  createTemplate("8-2", 8, ClosetTemplate8_2),
  createTemplate("9-1", 9, ClosetTemplate9_1),
  createTemplate("10-1", 10, ClosetTemplate10_1),
  createTemplate("10-2", 10, ClosetTemplate10_2),
];

export function getClosetTemplate(templateId?: string | null) {
  if (!templateId) {
    return null;
  }

  const matchedTemplate = closetTemplates.find((template) => template.id === templateId);
  if (matchedTemplate) {
    return matchedTemplate;
  }

  const sectionCount = Number(templateId);
  return Number.isInteger(sectionCount)
    ? (closetTemplates.find((template) => template.sectionCount === sectionCount) ?? null)
    : null;
}

export function getClosetTemplatesByIds(templateIds: string[]) {
  return templateIds.flatMap((templateId) => {
    const template = getClosetTemplate(templateId);
    return template ? [template] : [];
  });
}

export function getRandomTemplateIdsBySectionCounts(sectionCounts: number[]) {
  const seenSectionCounts = new Set<number>();

  return sectionCounts.flatMap((sectionCount) => {
    if (seenSectionCounts.has(sectionCount)) {
      return [];
    }

    seenSectionCounts.add(sectionCount);
    const candidates = closetTemplates.filter((template) => template.sectionCount === sectionCount);
    const selectedTemplate = candidates[Math.floor(Math.random() * candidates.length)];

    return selectedTemplate ? [selectedTemplate.id] : [];
  });
}

export function getClosetTemplateSections(templateId?: string | null) {
  const template = getClosetTemplate(templateId);
  if (!template) {
    return [];
  }

  return CLOSET_LAYOUTS[template.layoutId].map((slot, index) => ({
    id: `${template.id}-section-${index + 1}`,
    label: `칸 ${index + 1}`,
    initialName: "",
    slot,
  }));
}
