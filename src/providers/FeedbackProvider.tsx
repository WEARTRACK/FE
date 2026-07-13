import { PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { FullWindowOverlay } from "react-native-screens";

import { AlertDialog } from "@/components/common/AlertDialog";
import type { AlertDialogAction } from "@/components/common/AlertDialog";
import { ToastHost } from "@/components/common/ToastHost";
import { subscribeAlert } from "@/lib/ui/showAlert";
import type { AlertRequest } from "@/lib/ui/showAlert";

type AlertState = AlertRequest & {
  visible: boolean;
};

export function FeedbackProvider({ children }: PropsWithChildren) {
  const usesFullWindowOverlay = Platform.OS === "ios";
  const [alert, setAlert] = useState<AlertState | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alertRef = useRef<AlertState | null>(null);
  const queueRef = useRef<AlertState[]>([]);
  const pendingActionRef = useRef<AlertDialogAction["onPress"] | null>(null);

  const presentAlert = useCallback((nextAlert: AlertState) => {
    const nextVisibleAlert = { ...nextAlert, visible: true };
    alertRef.current = nextVisibleAlert;
    setAlert(nextVisibleAlert);
  }, []);

  const showNextAlert = useCallback(() => {
    if (alertRef.current || queueRef.current.length === 0) {
      return;
    }

    const nextAlert = queueRef.current.shift();

    if (!nextAlert) {
      return;
    }

    presentAlert(nextAlert);
  }, [presentAlert]);

  useEffect(() => {
    return subscribeAlert((nextAlert) => {
      const lastQueuedAlert = queueRef.current[queueRef.current.length - 1];

      const isSameAlert = (current: AlertState | null | undefined) =>
        Boolean(
          current &&
          current.title === nextAlert.title &&
          current.message === nextAlert.message &&
          current.dismissible === nextAlert.dismissible,
        );

      if (isSameAlert(alertRef.current) || isSameAlert(lastQueuedAlert)) {
        return;
      }

      queueRef.current.push({ ...nextAlert, visible: false });
      showNextAlert();
    });
  }, [showNextAlert]);

  const runPendingAction = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;

    if (!action) {
      return;
    }

    // Run after dismissing the dialog to avoid presenting nested native modals.
    void Promise.resolve()
      .then(action)
      .catch((error) => {
        console.warn("[Feedback] Alert action failed", error);
      });
  }, []);

  const handleDismiss = useCallback(
    (nextAction?: AlertDialogAction["onPress"]) => {
      if (nextAction) {
        pendingActionRef.current = nextAction;
      }

      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }

      setAlert((current) => (current ? { ...current, visible: false } : current));

      dismissTimerRef.current = setTimeout(() => {
        setAlert(null);
        alertRef.current = null;
        dismissTimerRef.current = null;
        runPendingAction();
        showNextAlert();
      }, 160);
    },
    [runPendingAction, showNextAlert],
  );

  const handleAlertActionPress = useCallback(
    (action: AlertDialogAction) => {
      handleDismiss(action.onPress);
    },
    [handleDismiss],
  );

  const alertDialog = alert ? (
    <AlertDialog
      cancelAction={alert.cancelAction}
      confirmAction={alert.confirmAction}
      dismissible={alert.dismissible}
      message={alert.message}
      onActionPress={handleAlertActionPress}
      onDismiss={handleDismiss}
      title={alert.title}
      useNativeModal={!usesFullWindowOverlay}
      visible={alert.visible}
    />
  ) : null;

  const alertSurface =
    alertDialog && usesFullWindowOverlay ? (
      <FullWindowOverlay unstable_accessibilityContainerViewIsModal={Boolean(alert?.visible)}>
        <View pointerEvents="box-none" className="absolute inset-0">
          {alertDialog}
        </View>
      </FullWindowOverlay>
    ) : (
      alertDialog
    );

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }

      pendingActionRef.current = null;
    };
  }, []);

  return (
    <View className="flex-1">
      {children}
      <ToastHost useFullWindowOverlay={usesFullWindowOverlay} />
      {alertSurface}
    </View>
  );
}
