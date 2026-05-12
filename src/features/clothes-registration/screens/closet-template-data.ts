import type { FC } from "react";
import type { SvgProps } from "react-native-svg";

import ClosetTemplate1 from "../../../../assets/closet-template-1.svg";
import ClosetTemplate2 from "../../../../assets/closet-template-2.svg";
import ClosetTemplate3 from "../../../../assets/closet-template-3.svg";
import ClosetTemplate4 from "../../../../assets/closet-template-4.svg";
import ClosetTemplate5 from "../../../../assets/closet-template-5.svg";

export type ClosetTemplateId =
  | "template1"
  | "template2"
  | "template3"
  | "template4"
  | "template5";

export type ClosetTemplate = {
  id: ClosetTemplateId;
  image: FC<SvgProps>;
  sectionCount: number;
  imageWidth: number;
  imageHeight: number;
  fillFrame?: boolean;
};

export const closetTemplates: ClosetTemplate[] = [
  { id: "template1", image: ClosetTemplate1, sectionCount: 7, imageWidth: 241, imageHeight: 352 },
  {
    id: "template2",
    image: ClosetTemplate2,
    sectionCount: 4,
    imageWidth: 222,
    imageHeight: 352,
    fillFrame: true,
  },
  { id: "template3", image: ClosetTemplate3, sectionCount: 4, imageWidth: 241, imageHeight: 352 },
  { id: "template4", image: ClosetTemplate4, sectionCount: 8, imageWidth: 244, imageHeight: 352 },
  { id: "template5", image: ClosetTemplate5, sectionCount: 10, imageWidth: 241, imageHeight: 352 },
];

export function getClosetTemplate(templateId?: string) {
  return closetTemplates.find((template) => template.id === templateId) ?? closetTemplates[0];
}

export function getClosetTemplateRequestId(templateId?: string) {
  const matched = templateId?.match(/^template(\d+)$/);
  if (!matched) {
    return null;
  }

  const parsed = Number(matched[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getClosetTemplateSections(templateId?: string) {
  const template = getClosetTemplate(templateId);

  return Array.from({ length: template.sectionCount }, (_, index) => ({
    id: `${template.id}-section-${index + 1}`,
    label: `칸 ${index + 1}`,
    initialName: "",
  }));
}
