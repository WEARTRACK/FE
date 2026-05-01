import type { Href } from "expo-router";

import { getStorageItem, removeStorageItem, setStorageItem } from "@/lib/storage/asyncStorage";
import { storageKeys } from "@/lib/storage/keys";

type SocialAuthIntent = {
  successHref: Href | null;
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
