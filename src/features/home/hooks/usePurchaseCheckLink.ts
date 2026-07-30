import { useMutation } from "@tanstack/react-query";

import {
  purchaseCheckLink,
  type PurchaseCheckLinkPayload,
} from "@/features/home/api/purchase-check-link-api";

export function usePurchaseCheckLink() {
  return useMutation({
    mutationFn: (payload: PurchaseCheckLinkPayload) => purchaseCheckLink(payload),
  });
}
