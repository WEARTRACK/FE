import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getClosetRepository,
} from "@/features/closet/data/closet-repository-provider";
import type { ClosetDataRepository } from "@/features/closet/data/closet-repository";
import type { ClosetDetailResult } from "@/features/closet/api/closet-api-types";
import type {
  ClosetSearchPage,
  ClosetSearchParams,
  ClosetSearchResultItem,
} from "@/features/closet/types/closet-search";
import { getClosetSearchLabel } from "@/features/closet/utils/closet-search";
const LIST_PAGE_SIZE = 4;

const EMPTY_PAGE: ClosetSearchPage = {
  totalCount: 0,
  currentPage: 0,
  totalPages: 0,
  hasNext: false,
  items: [],
};

export function useClosetSearchResults(
  searchParams: ClosetSearchParams | null,
  repository: ClosetDataRepository = getClosetRepository(),
) {
  const [revision, setRevision] = useState(0);
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState<ClosetSearchPage>(EMPTY_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [paramError, setParamError] = useState<string | null>(null);

  const pageSize = LIST_PAGE_SIZE;
  const searchMode = searchParams?.mode ?? null;
  const searchValue = searchParams?.value ?? null;
  const normalizedSearchParams = useMemo<ClosetSearchParams | null>(() => {
    if (!searchMode || !searchValue) {
      return null;
    }

    if (searchMode === "color") {
      return { mode: "color", value: searchValue };
    }

    return { mode: "category", value: searchValue };
  }, [searchMode, searchValue]);

  const refetch = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, []);

  const onPageChange = useCallback(
    (nextPage: number) => {
      if (pageData.totalPages <= 0) {
        setPage(0);
        return;
      }

      const maxPage = Math.max(0, pageData.totalPages - 1);
      setPage(Math.max(0, Math.min(nextPage, maxPage)));
    },
    [pageData.totalPages],
  );

  const applyDetailToList = useCallback((detail: ClosetDetailResult) => {
    setPageData((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.clothesId === detail.clothesId
          ? {
              ...item,
              imageUri: detail.imageUrl,
              color: detail.color,
              category: detail.category,
              sectionName: detail.sectionName,
              price: detail.price,
            }
          : item,
      ),
    }));
  }, []);

  const removeItemOptimistic = useCallback(
    (clothesId: number) => {
      const previous = pageData;

      setPageData((current) => {
        const nextItems = current.items.filter((item) => item.clothesId !== clothesId);
        const nextTotalCount = Math.max(0, current.totalCount - 1);
        const nextTotalPages = nextTotalCount === 0 ? 0 : Math.ceil(nextTotalCount / pageSize);
        const nextCurrentPage = nextTotalPages === 0 ? 0 : Math.min(current.currentPage, nextTotalPages - 1);

        return {
          ...current,
          totalCount: nextTotalCount,
          totalPages: nextTotalPages,
          currentPage: nextCurrentPage,
          hasNext: nextCurrentPage + 1 < nextTotalPages,
          items: nextItems,
        };
      });

      return previous;
    },
    [pageData, pageSize],
  );

  useEffect(() => {
    setPage(0);
  }, [searchMode, searchValue]);

  useEffect(() => {
    let isActive = true;

    async function fetchItems() {
      if (!normalizedSearchParams) {
        setParamError("INVALID_SEARCH_PARAMS");
        setError(null);
        setPageData(EMPTY_PAGE);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setParamError(null);
        setError(null);

        const data = await repository.searchClothes({
          searchParams: normalizedSearchParams,
          page,
          size: pageSize,
        });
        const needsFallbackSimilarCount = data.items.some((item) => typeof item.similarCount !== "number");

        let nextPageData = data;

        if (needsFallbackSimilarCount && normalizedSearchParams.mode === "category") {
          const allItems = await repository.getAllItems();
          const similarCountByCategory = new Map<string, number>();

          allItems.forEach((item) => {
            similarCountByCategory.set(item.category, (similarCountByCategory.get(item.category) ?? 0) + 1);
          });

          nextPageData = {
            ...data,
            items: data.items.map((item) => ({
              ...item,
              similarCount: item.similarCount ?? similarCountByCategory.get(item.category) ?? 0,
            })),
          };
        }

        if (!isActive) {
          return;
        }

        setPageData(nextPageData);
        if (nextPageData.currentPage !== page) {
          setPage(nextPageData.currentPage);
        }
      } catch (targetError) {
        if (!isActive) {
          return;
        }

        setError(targetError instanceof Error ? targetError : new Error("Failed to fetch closet items"));
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
  }, [normalizedSearchParams, page, pageSize, repository, revision]);

  const queryLabel = useMemo(() => {
    if (!normalizedSearchParams) {
      return null;
    }

    return getClosetSearchLabel(normalizedSearchParams);
  }, [normalizedSearchParams]);

  const items = useMemo<ClosetSearchResultItem[]>(() => pageData.items, [pageData.items]);

  return {
    items,
    totalCount: pageData.totalCount,
    totalPages: pageData.totalPages,
    hasNext: pageData.hasNext,
    currentPage: pageData.currentPage,
    page,
    pageSize,
    setPage: onPageChange,
    applyDetailToList,
    removeItemOptimistic,
    paramError,
    isLoading,
    error,
    refetch,
    queryLabel,
  };
}
