import { useMemo } from "react";

import { useClosetTemplate } from "@/features/closet/hooks/use-closet-data";
import {
  toClosetSectionOptions,
  type ClosetSectionOption,
} from "@/features/closet/utils/closet-section-options";

export function useClothesStorageSections(): {
  options: ClosetSectionOption[];
  isLoading: boolean;
  error: Error | null;
} {
  const { template, isLoading, error } = useClosetTemplate();
  const options = useMemo(() => {
    if (error) {
      return [];
    }

    return toClosetSectionOptions(template);
  }, [error, template]);

  return {
    options,
    isLoading,
    error,
  };
}
