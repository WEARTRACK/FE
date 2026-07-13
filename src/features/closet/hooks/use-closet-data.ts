import { useCallback, useEffect, useState } from "react";

import type { ClosetDataRepository } from "@/features/closet/data/closet-repository";
import { getClosetRepository } from "@/features/closet/data/closet-repository-provider";
import type { ClosetStatisticsSummary } from "@/features/closet/types/closet-statistics";
import type { ClosetSectionId, ClosetTemplate } from "@/features/closet/types/closet-layout";
import { buildClosetStatistics } from "@/features/closet/utils/closet-statistics";

type ClosetDataHookOptions = {
  closetId?: number | null;
  repository?: ClosetDataRepository;
};

const EMPTY_CLOSET_TEMPLATE: ClosetTemplate = {
  templateId: "LAYOUT_1",
  sections: [],
};

function isClosetRepository(value: ClosetDataHookOptions | ClosetDataRepository | undefined): value is ClosetDataRepository {
  return Boolean(value && "getTemplate" in value && typeof value.getTemplate === "function");
}

function resolveHookOptions(optionsOrRepository?: ClosetDataHookOptions | ClosetDataRepository) {
  if (isClosetRepository(optionsOrRepository)) {
    return {
      closetId: null,
      repository: optionsOrRepository,
    };
  }

  return {
    closetId: optionsOrRepository?.closetId ?? null,
    repository: optionsOrRepository?.repository ?? getClosetRepository(),
  };
}

export function useClosetTemplate(optionsOrRepository?: ClosetDataHookOptions | ClosetDataRepository) {
  const { closetId, repository } = resolveHookOptions(optionsOrRepository);
  const [revision, setRevision] = useState(0);
  const [template, setTemplate] =
    useState<Awaited<ReturnType<ClosetDataRepository["getTemplate"]>>>(EMPTY_CLOSET_TEMPLATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const refetch = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function fetchTemplate() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await repository.getTemplate(closetId);
        if (!isActive) {
          return;
        }
        setTemplate(data);
      } catch (targetError) {
        if (!isActive) {
          return;
        }
        setError(
          targetError instanceof Error ? targetError : new Error("Failed to fetch closet template"),
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchTemplate();
    return () => {
      isActive = false;
    };
  }, [closetId, repository, revision]);

  return { template, isLoading, error, refetch };
}

export function useClosetItemsBySection(
  sectionId: ClosetSectionId,
  optionsOrRepository?: ClosetDataHookOptions | ClosetDataRepository,
) {
  const { closetId, repository } = resolveHookOptions(optionsOrRepository);
  const [revision, setRevision] = useState(0);
  const [items, setItems] = useState<
    Awaited<ReturnType<ClosetDataRepository["getItemsBySectionId"]>>
  >([]);
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
        const data = await repository.getItemsBySectionId(sectionId, closetId);
        if (!isActive) {
          return;
        }
        setItems(data);
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
  }, [closetId, repository, revision, sectionId]);

  return { items, isLoading, error, refetch };
}

export function useClosetItem(
  sectionId: ClosetSectionId,
  itemId: string | null,
  optionsOrRepository?: ClosetDataHookOptions | ClosetDataRepository,
) {
  const { closetId, repository } = resolveHookOptions(optionsOrRepository);
  const [revision, setRevision] = useState(0);
  const [item, setItem] = useState<Awaited<ReturnType<ClosetDataRepository["getItemById"]>>>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const refetch = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    if (!itemId) {
      setItem(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    const currentItemId = itemId;

    async function fetchItem() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await repository.getItemById(sectionId, currentItemId, closetId);
        if (!isActive) {
          return;
        }
        setItem(data);
      } catch (targetError) {
        if (!isActive) {
          return;
        }
        setError(
          targetError instanceof Error ? targetError : new Error("Failed to fetch closet item"),
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchItem();
    return () => {
      isActive = false;
    };
  }, [closetId, itemId, repository, revision, sectionId]);

  return { item, isLoading, error, refetch };
}

export function useClosetStatistics(optionsOrRepository?: ClosetDataHookOptions | ClosetDataRepository) {
  const { closetId, repository } = resolveHookOptions(optionsOrRepository);
  const [revision, setRevision] = useState(0);
  const [statistics, setStatistics] = useState<ClosetStatisticsSummary>({
    totalCount: 0,
    rankedCategories: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const refetch = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function fetchStatistics() {
      try {
        setIsLoading(true);
        setError(null);
        const items = await repository.getAllItems(closetId);
        if (!isActive) {
          return;
        }
        setStatistics(buildClosetStatistics(items));
      } catch (targetError) {
        if (!isActive) {
          return;
        }
        setError(
          targetError instanceof Error
            ? targetError
            : new Error("Failed to fetch closet statistics"),
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    fetchStatistics();
    return () => {
      isActive = false;
    };
  }, [closetId, repository, revision]);

  return { statistics, isLoading, error, refetch };
}
