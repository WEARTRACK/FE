import { useCallback, useRef, useState } from "react";

type SingleFlightTask<T> = () => Promise<T> | T;

export function useSingleFlightController() {
  const [isPending, setIsPending] = useState(false);
  const isPendingRef = useRef(false);
  const canRunAfterStartRef = useRef(false);

  const finish = useCallback(() => {
    isPendingRef.current = false;
    canRunAfterStartRef.current = false;
    setIsPending(false);
  }, []);

  const start = useCallback(() => {
    if (isPendingRef.current) {
      return false;
    }

    isPendingRef.current = true;
    canRunAfterStartRef.current = true;
    setIsPending(true);
    return true;
  }, []);

  const runAfterStart = useCallback(
    async <T>(task: SingleFlightTask<T>) => {
      if (!canRunAfterStartRef.current && !start()) {
        return undefined;
      }

      if (!canRunAfterStartRef.current) {
        return undefined;
      }

      canRunAfterStartRef.current = false;

      try {
        return await task();
      } finally {
        finish();
      }
    },
    [finish, start],
  );

  return {
    isPending,
    runAfterStart,
    start,
  };
}
