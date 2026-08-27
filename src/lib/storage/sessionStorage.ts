import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import type { StateStorage } from "zustand/middleware";

import { storageKeys } from "@/lib/storage/keys";

type PersistedSessionEnvelope = {
  state: Record<string, unknown>;
  version?: number;
};

let writeQueue = Promise.resolve();

function parsePersistedSession(value: string): PersistedSessionEnvelope | null {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const envelope = parsed as Partial<PersistedSessionEnvelope>;
    if (!envelope.state || typeof envelope.state !== "object") {
      return null;
    }

    return envelope as PersistedSessionEnvelope;
  } catch {
    return null;
  }
}

function readToken(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function withoutTokens(envelope: PersistedSessionEnvelope) {
  const state = { ...envelope.state };
  delete state.accessToken;
  delete state.refreshToken;

  return {
    ...envelope,
    state,
  };
}

async function canUseSecureStore() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

async function saveSecureToken(key: string, value: string | null) {
  if (value) {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

function enqueueWrite(task: () => Promise<void>) {
  const operation = writeQueue.then(task, task);
  writeQueue = operation.catch(() => undefined);
  return operation;
}

export function flushSessionStorageWrites() {
  return writeQueue;
}

export const sessionStorage: StateStorage = {
  async getItem(name) {
    await writeQueue;

    const storedValue = await AsyncStorage.getItem(name);
    if (!storedValue) {
      if (await canUseSecureStore()) {
        await Promise.all([
          SecureStore.deleteItemAsync(storageKeys.sessionAccessToken),
          SecureStore.deleteItemAsync(storageKeys.sessionRefreshToken),
        ]);
      }

      return null;
    }

    const envelope = parsePersistedSession(storedValue);
    if (!envelope) {
      return storedValue;
    }

    const sanitizedEnvelope = withoutTokens(envelope);
    const legacyAccessToken = readToken(envelope.state.accessToken);
    const legacyRefreshToken = readToken(envelope.state.refreshToken);
    let accessToken = legacyAccessToken;
    let refreshToken = legacyRefreshToken;

    if (await canUseSecureStore()) {
      const [storedAccessToken, storedRefreshToken] = await Promise.all([
        SecureStore.getItemAsync(storageKeys.sessionAccessToken),
        SecureStore.getItemAsync(storageKeys.sessionRefreshToken),
      ]);

      accessToken = readToken(storedAccessToken) ?? legacyAccessToken;
      refreshToken = readToken(storedRefreshToken) ?? legacyRefreshToken;

      await Promise.all([
        legacyAccessToken && !storedAccessToken
          ? saveSecureToken(storageKeys.sessionAccessToken, legacyAccessToken)
          : Promise.resolve(),
        legacyRefreshToken && !storedRefreshToken
          ? saveSecureToken(storageKeys.sessionRefreshToken, legacyRefreshToken)
          : Promise.resolve(),
      ]);
    }

    if ("accessToken" in envelope.state || "refreshToken" in envelope.state) {
      await AsyncStorage.setItem(name, JSON.stringify(sanitizedEnvelope));
    }

    return JSON.stringify({
      ...sanitizedEnvelope,
      state: {
        ...sanitizedEnvelope.state,
        accessToken,
        refreshToken,
      },
    });
  },

  setItem(name, value) {
    return enqueueWrite(async () => {
      const envelope = parsePersistedSession(value);
      if (!envelope) {
        await AsyncStorage.setItem(name, value);
        return;
      }

      const accessToken = readToken(envelope.state.accessToken);
      const refreshToken = readToken(envelope.state.refreshToken);

      if (await canUseSecureStore()) {
        await Promise.all([
          saveSecureToken(storageKeys.sessionAccessToken, accessToken),
          saveSecureToken(storageKeys.sessionRefreshToken, refreshToken),
        ]);
      }

      await AsyncStorage.setItem(name, JSON.stringify(withoutTokens(envelope)));
    });
  },

  removeItem(name) {
    return enqueueWrite(async () => {
      await AsyncStorage.removeItem(name);

      if (await canUseSecureStore()) {
        await Promise.all([
          SecureStore.deleteItemAsync(storageKeys.sessionAccessToken),
          SecureStore.deleteItemAsync(storageKeys.sessionRefreshToken),
        ]);
      }
    });
  },
};
