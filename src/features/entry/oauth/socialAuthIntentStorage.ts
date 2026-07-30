import type { PostLoginIntentSuccessHref } from "@/features/entry/utils/resolvePostLoginRoute";
import { getStorageItem, removeStorageItem, setStorageItem } from "@/lib/storage/asyncStorage";
import { storageKeys } from "@/lib/storage/keys";

type SocialAuthIntent = {
  successHref: PostLoginIntentSuccessHref | null;
};

export async function saveSocialAuthIntent(intent: SocialAuthIntent) {
  await setStorageItem<SocialAuthIntent>(storageKeys.socialAuthIntent, intent);
}

export async function getSocialAuthIntent() {
  return getStorageItem<SocialAuthIntent>(storageKeys.socialAuthIntent);
}

export async function clearSocialAuthIntent() {
  await removeStorageItem(storageKeys.socialAuthIntent);
}
