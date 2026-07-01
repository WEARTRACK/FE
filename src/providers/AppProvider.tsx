import { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { useNotificationSetup } from "@/features/notifications/useNotificationSetup";
import { queryClient } from "@/lib/queryClient";

export function AppProvider({ children }: PropsWithChildren) {
  useNotificationSetup();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
