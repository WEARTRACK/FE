export type AlertOptions = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  dismissible?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
};

export type AlertRequest = {
  id: number;
  title: string;
  message?: string;
  confirmAction: {
    label: string;
    onPress: () => void | Promise<void>;
  };
  cancelAction?: {
    label: string;
    onPress: () => void | Promise<void>;
  };
  dismissible: boolean;
};

type AlertListener = (alert: AlertRequest) => void;

const DEFAULT_CONFIRM_TEXT = "확인";
const DEFAULT_CANCEL_TEXT = "취소";

let nextAlertId = 1;
const alertListeners = new Set<AlertListener>();

export function subscribeAlert(listener: AlertListener) {
  alertListeners.add(listener);

  return () => {
    alertListeners.delete(listener);
  };
}

export function showAlert(options: AlertOptions) {
  const hasCancelAction = Boolean(options.cancelText || options.onCancel);

  const alert: AlertRequest = {
    id: nextAlertId++,
    title: options.title,
    message: options.message,
    dismissible: options.dismissible ?? true,
    confirmAction: {
      label: options.confirmText ?? DEFAULT_CONFIRM_TEXT,
      onPress: async () => {
        await options.onConfirm?.();
      },
    },
    cancelAction: hasCancelAction
      ? {
          label: options.cancelText ?? DEFAULT_CANCEL_TEXT,
          onPress: async () => {
            await options.onCancel?.();
          },
        }
      : undefined,
  };

  alertListeners.forEach((listener) => {
    listener(alert);
  });
}
