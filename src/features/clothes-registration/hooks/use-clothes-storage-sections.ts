import { useMemo } from "react";

import { useClosetTemplate } from "@/features/closet/hooks/use-closet-data";
import {
  toClosetSectionOptions,
  type ClosetSectionOption,
} from "@/features/closet/utils/closet-section-options";
import {
  getClosetClothesCount,
  hasReachedClothesLimit,
} from "@/features/clothes-registration/utils/clothesLimit";

export function useClothesStorageSections(): {
  options: ClosetSectionOption[];
  isClosetFull: boolean;
  isLoading: boolean;
  error: Error | null;
} {
  const { template, isLoading, error } = useClosetTemplate();
  const clothesCount = useMemo(() => getClosetClothesCount(template.sections), [template.sections]);
  const options = useMemo(() => {
    if (error) {
      return [];
    }

    return toClosetSectionOptions(template);
  }, [error, template]);

  return {
    options,
    isClosetFull: hasReachedClothesLimit(clothesCount),
    isLoading,
    error,
  };
}
