import { useMutation } from "@tanstack/react-query";

import {
  purchaseCheckPhoto,
  type PurchaseCheckPhotoPayload,
} from "@/features/home/api/purchase-check-photo-api";

export function usePurchaseCheckPhoto() {
  return useMutation({
    mutationFn: (payload: PurchaseCheckPhotoPayload) => purchaseCheckPhoto(payload),
  });
}
