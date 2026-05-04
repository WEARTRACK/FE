import { useCallback, useEffect, useState } from "react";

import {
  mockClosetRepository,
  type ClosetDataRepository,
} from "@/features/closet/data/closet-repository";
import { MOCK_CLOSET_TEMPLATE } from "@/features/closet/mock/closet-template";
import type { ClosetSectionId } from "@/features/closet/types/closet-layout";

export function useClosetTemplate(repository: ClosetDataRepository = mockClosetRepository) {
  const [revision, setRevision] = useState(0);
  const [template, setTemplate] = useState<Awaited<ReturnType<ClosetDataRepository["getTemplate"]>>>(
    MOCK_CLOSET_TEMPLATE,
  );
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
        const data = await repository.getTemplate();
        if (!isActive) {
          return;
        }
        setTemplate(data);
      } catch (targetError) {
        if (!isActive) {
          return;
        }
        setError(targetError instanceof Error ? targetError : new Error("Failed to fetch closet template"));
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
  }, [repository, revision]);

  return { template, isLoading, error, refetch };
}

export function useClosetItemsBySection(
  sectionId: ClosetSectionId,
  repository: ClosetDataRepository = mockClosetRepository,
) {
  const [revision, setRevision] = useState(0);
  const [items, setItems] = useState<Awaited<ReturnType<ClosetDataRepository["getItemsBySectionId"]>>>([]);
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
        const data = await repository.getItemsBySectionId(sectionId);
        if (!isActive) {
          return;
        }
        setItems(data);
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
  }, [repository, revision, sectionId]);

  return { items, isLoading, error, refetch };
}

export function useClosetItem(
  sectionId: ClosetSectionId,
  itemId: string | null,
  repository: ClosetDataRepository = mockClosetRepository,
) {
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
        const data = await repository.getItemById(sectionId, currentItemId);
        if (!isActive) {
          return;
        }
        setItem(data);
      } catch (targetError) {
        if (!isActive) {
          return;
        }
        setError(targetError instanceof Error ? targetError : new Error("Failed to fetch closet item"));
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
  }, [itemId, repository, revision, sectionId]);

  return { item, isLoading, error, refetch };
}
