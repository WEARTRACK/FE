import type { ClosetSection } from "@/features/closet/types/closet-layout";

export const maxClothesCountPerCloset = 80;
export const clothesLimitMessage = "옷은 옷장 1개 당 최대 80벌까지 등록할 수 있습니다.";

export function getClosetClothesCount(sections: ClosetSection[]) {
  return sections.reduce((total, section) => total + (section.clothesCount ?? 0), 0);
}

export function hasReachedClothesLimit(clothesCount: number) {
  return clothesCount >= maxClothesCountPerCloset;
}
