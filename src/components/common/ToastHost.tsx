import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FullWindowOverlay } from "react-native-screens";

import { Toast } from "@/components/common/Toast";
import { subscribeToast } from "@/lib/ui/showToast";
import type { ToastRequest } from "@/lib/ui/showToast";

const DEFAULT_EXIT_DELAY = 160;

type ToastState = ToastRequest & {
  visible: boolean;
};

export function ToastHost({ useFullWindowOverlay = false }: { useFullWindowOverlay?: boolean }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const activeToastRef = useRef<ToastState | null>(null);
  const queueRef = useRef<ToastState[]>([]);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }
  }, []);

  const showNextToast = useCallback(() => {
    if (activeToastRef.current || queueRef.current.length === 0) {
      return;
    }

    const nextToast = queueRef.current.shift();

    if (!nextToast) {
      return;
    }

    activeToastRef.current = nextToast;
    setToast({ ...nextToast, visible: true });

    clearTimers();
    dismissTimerRef.current = setTimeout(() => {
      setToast((current) => (current ? { ...current, visible: false } : current));

      cleanupTimerRef.current = setTimeout(() => {
        if (activeToastRef.current?.id === nextToast.id) {
          activeToastRef.current = null;
          setToast((current) => (current && current.id === nextToast.id ? null : current));
          showNextToast();
        }
      }, DEFAULT_EXIT_DELAY);
    }, nextToast.duration);
  }, [clearTimers]);

  const enqueueToast = useCallback(
    (nextToast: ToastState) => {
      const lastQueuedToast = queueRef.current[queueRef.current.length - 1];
      const activeToast = activeToastRef.current;

      const isSameToast = (current: ToastState | null | undefined) =>
        Boolean(
          current &&
          current.message === nextToast.message &&
          current.tone === nextToast.tone &&
          current.duration === nextToast.duration,
        );

      if (isSameToast(activeToast) || isSameToast(lastQueuedToast)) {
        return;
      }

      queueRef.current.push(nextToast);
      showNextToast();
    },
    [showNextToast],
  );

  useEffect(() => {
    return subscribeToast((nextToast) => {
      enqueueToast({ ...nextToast, visible: false });
    });
  }, [enqueueToast]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  if (!toast) {
    return null;
  }

  const content = (
    <View pointerEvents="box-none" className="absolute inset-0">
      <Toast
        bottomInset={insets.bottom + 24}
        message={toast.message}
        tone={toast.tone}
        visible={toast.visible}
      />
    </View>
  );

  if (useFullWindowOverlay) {
    return (
      <FullWindowOverlay unstable_accessibilityContainerViewIsModal={false}>
        {content}
      </FullWindowOverlay>
    );
  }

  return content;
}
