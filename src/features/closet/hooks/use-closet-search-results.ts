import { useCallback, useEffect, useMemo, useState } from "react";

import {
  mockClosetRepository,
  type ClosetDataRepository,
} from "@/features/closet/data/closet-repository";
import type { ClosetItem } from "@/features/closet/types/closet-item";
import type { ClosetSearchParams } from "@/features/closet/types/closet-search";
import {
  filterClosetItemsBySearchParams,
  getClosetSearchLabel,
} from "@/features/closet/utils/closet-search";

export function useClosetSearchResults(
  searchParams: ClosetSearchParams | null,
  repository: ClosetDataRepository = mockClosetRepository,
) {
  const [revision, setRevision] = useState(0);
  const [allItems, setAllItems] = useState<ClosetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function fetchItems() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await repository.getAllItems();
        if (!isActive) {
          return;
        }
        setAllItems(data);
      } catch (targetError) {
        if (!isActive) {
          return;
        }
        setError(
          targetError instanceof Error ? targetError : new Error("Failed to fetch closet items"),
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchItems();

    return () => {
      isActive = false;
    };
  }, [repository, revision]);

  const items = useMemo(() => {
    if (!searchParams) {
      return [];
    }

    return filterClosetItemsBySearchParams(allItems, searchParams);
  }, [allItems, searchParams]);

  const queryLabel = useMemo(() => {
    if (!searchParams) {
      return null;
    }

    return getClosetSearchLabel(searchParams);
  }, [searchParams]);

  return { items, isLoading, error, refetch, queryLabel };
}
