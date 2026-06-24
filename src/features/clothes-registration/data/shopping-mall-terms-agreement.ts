import AsyncStorage from "@react-native-async-storage/async-storage";

import { storageKeys } from "@/lib/storage/keys";

export const shoppingMallTermsVersion = "v1";

function getAgreementStorageKey(memberId: number) {
  return `${storageKeys.shoppingMallTermsAgreement}:${memberId}`;
}

export async function hasAgreedToShoppingMallTerms(memberId: number) {
  const agreedVersion = await AsyncStorage.getItem(getAgreementStorageKey(memberId));
  return agreedVersion === shoppingMallTermsVersion;
}

export async function saveShoppingMallTermsAgreement(memberId: number) {
  await AsyncStorage.setItem(getAgreementStorageKey(memberId), shoppingMallTermsVersion);
}
