import {
  CLOSET_LAYOUTS,
  CLOSET_TEMPLATE_IDS,
  getClosetTemplateSectionCount,
} from "@/features/closet/constants/closet-layouts";
import type { ClosetTemplateId } from "@/features/closet/types/closet-layout";

export type ClosetTemplate = {
  id: ClosetTemplateId;
  requestId: number;
  sectionCount: number;
};

export const closetTemplates: ClosetTemplate[] = CLOSET_TEMPLATE_IDS.map((templateId, index) => ({
  id: templateId,
  requestId: index + 1,
  sectionCount: getClosetTemplateSectionCount(templateId),
}));

function getClosetTemplateIdFromRequestId(requestId: number): ClosetTemplateId | null {
  const template = closetTemplates.find((candidate) => candidate.requestId === requestId);
  return template?.id ?? null;
}

export function getClosetTemplate(templateId?: string) {
  const requestId = templateId ? Number(templateId) : NaN;
  const normalizedTemplateId =
    Number.isInteger(requestId) && requestId > 0
      ? getClosetTemplateIdFromRequestId(requestId)
      : templateId;

  return (
    closetTemplates.find((template) => template.id === normalizedTemplateId) ?? closetTemplates[0]
  );
}

export function getClosetTemplateRequestId(templateId?: string) {
  const directRequestId = templateId ? Number(templateId) : NaN;
  if (Number.isInteger(directRequestId) && directRequestId > 0) {
    return directRequestId;
  }

  const matched = closetTemplates.find((template) => template.id === templateId);
  return matched?.requestId ?? null;
}

export function getClosetTemplateSections(templateId?: string) {
  const template = getClosetTemplate(templateId);

  return CLOSET_LAYOUTS[template.id].map((slot, index) => ({
    id: `${template.id}-section-${index + 1}`,
    label: `칸 ${index + 1}`,
    initialName: "",
    slot,
  }));
}
