import type { ClosetSection, ClosetSectionId, ClosetTemplate } from "@/features/closet/types/closet-layout";

export type ClosetSectionOption = {
  requestSectionId: number;
  templateSectionId: ClosetSectionId;
  label: string;
};

function parseRequestSectionId(section: ClosetSection) {
  if (typeof section.apiSectionId === "number") {
    return section.apiSectionId;
  }

  const match = section.id.match(/^section-(\d+)$/);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}

export function toClosetSectionOption(section: ClosetSection): ClosetSectionOption | null {
  const requestSectionId = parseRequestSectionId(section);
  if (!requestSectionId) {
    return null;
  }

  return {
    requestSectionId,
    templateSectionId: section.id,
    label: section.sectionName ?? `칸 ${requestSectionId}`,
  };
}

export function toClosetSectionOptions(template: ClosetTemplate): ClosetSectionOption[] {
  return template.sections
    .map((section) => toClosetSectionOption(section))
    .filter((option): option is ClosetSectionOption => option !== null);
}
