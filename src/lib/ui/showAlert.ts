export type AlertActionOptions = {
  label: string;
  onPress?: () => void | Promise<void>;
  beforePress?: () => boolean;
};

export type AlertResolvedAction = Omit<AlertActionOptions, "onPress"> & {
  onPress: () => void | Promise<void>;
};

export type AlertOptions = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  dismissible?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  confirmAction?: AlertActionOptions;
  cancelAction?: AlertActionOptions;
};

export type AlertRequest = {
  title: string;
  message?: string;
  confirmAction: AlertResolvedAction;
  cancelAction?: AlertResolvedAction;
  dismissible: boolean;
};

type AlertListener = (alert: AlertRequest) => void;

const DEFAULT_CONFIRM_TEXT = "확인";
const DEFAULT_CANCEL_TEXT = "취소";

const alertListeners = new Set<AlertListener>();

function createAlertAction(
  action: AlertActionOptions | undefined,
  fallbackLabel: string,
  fallbackOnPress?: () => void | Promise<void>,
): AlertResolvedAction {
  const onPress = action?.onPress ?? fallbackOnPress ?? (() => undefined);

  return {
    label: action?.label ?? fallbackLabel,
    onPress,
    beforePress: action?.beforePress,
  };
}

export function subscribeAlert(listener: AlertListener) {
  alertListeners.add(listener);

  return () => {
    alertListeners.delete(listener);
  };
}

export function showAlert(options: AlertOptions) {
  const hasCancelAction = Boolean(options.cancelAction || options.cancelText || options.onCancel);

  const alert: AlertRequest = {
    title: options.title,
    message: options.message,
    dismissible: options.dismissible ?? true,
    confirmAction: createAlertAction(
      options.confirmAction,
      options.confirmText ?? DEFAULT_CONFIRM_TEXT,
      options.onConfirm,
    ),
    cancelAction: hasCancelAction
      ? createAlertAction(
          options.cancelAction,
          options.cancelText ?? DEFAULT_CANCEL_TEXT,
          options.onCancel,
        )
      : undefined,
  };

  alertListeners.forEach((listener) => {
    listener(alert);
  });
}
