import AsyncStorage from "@react-native-async-storage/async-storage";

export async function setStorageItem<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getStorageItem<T>(key: string) {
  const rawValue = await AsyncStorage.getItem(key);

  if (!rawValue) {
    return null as T | null;
  }

  return JSON.parse(rawValue) as T;
}

export async function removeStorageItem(key: string) {
  await AsyncStorage.removeItem(key);
}

export async function clearStorage() {
  await AsyncStorage.clear();
}
