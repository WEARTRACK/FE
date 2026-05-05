import type { ClosetItem } from "@/features/closet/types/closet-item";
import type { ClosetSearchParams } from "@/features/closet/types/closet-search";

export function filterClosetItemsBySearchParams(
  items: ClosetItem[],
  searchParams: ClosetSearchParams,
): ClosetItem[] {
  if (searchParams.mode === "color") {
    return items.filter((item) => item.color === searchParams.value);
  }

  return items.filter((item) => item.category === searchParams.value);
}

export function getClosetSearchLabel(searchParams: ClosetSearchParams): string {
  return toDisplayLabel(searchParams.value);
}

function toDisplayLabel(value: string): string {
  if (value === "tshirt") {
    return "T-shirt";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
