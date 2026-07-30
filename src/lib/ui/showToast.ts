export type ToastTone = "default" | "success" | "warning" | "error";

export type ToastOptions = {
  message: string;
  tone?: ToastTone;
  duration?: number;
};

export type ToastRequest = {
  id: number;
  message: string;
  tone: ToastTone;
  duration: number;
};

type ToastListener = (toast: ToastRequest) => void;

const DEFAULT_TOAST_DURATION = 2200;
let nextToastId = 1;
const toastListeners = new Set<ToastListener>();

function resolveToastDuration(options: ToastOptions) {
  if (options.duration) {
    return options.duration;
  }

  const lineCount = options.message.split(/\r?\n/).length;
  const messageLength = options.message.length;

  if (lineCount > 1 || messageLength > 80) {
    return options.tone === "error" ? 4000 : 3600;
  }

  if (messageLength > 48) {
    return options.tone === "error" ? 3600 : 3200;
  }

  return options.tone === "error" ? 3000 : DEFAULT_TOAST_DURATION;
}

export function subscribeToast(listener: ToastListener) {
  toastListeners.add(listener);

  return () => {
    toastListeners.delete(listener);
  };
}

function normalizeToastOptions(input: string | ToastOptions): ToastOptions {
  if (typeof input === "string") {
    return { message: input };
  }

  return input;
}

export function showToast(input: string | ToastOptions) {
  const options = normalizeToastOptions(input);
  const toast: ToastRequest = {
    id: nextToastId++,
    message: options.message,
    tone: options.tone ?? "default",
    duration: resolveToastDuration(options),
  };

  toastListeners.forEach((listener) => {
    listener(toast);
  });
}
