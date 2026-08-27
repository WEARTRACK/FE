import { beforeEach, describe, expect, it, vi } from "vitest";

import { storageKeys } from "@/lib/storage/keys";
import { sessionStorage } from "@/lib/storage/sessionStorage";

const mocks = vi.hoisted(() => ({
  asyncGetItem: vi.fn(),
  asyncRemoveItem: vi.fn(),
  asyncSetItem: vi.fn(),
  deleteSecureItem: vi.fn(),
  getSecureItem: vi.fn(),
  isSecureStoreAvailable: vi.fn(),
  setSecureItem: vi.fn(),
}));

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: mocks.asyncGetItem,
    removeItem: mocks.asyncRemoveItem,
    setItem: mocks.asyncSetItem,
  },
}));

vi.mock("expo-secure-store", () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: "WHEN_UNLOCKED_THIS_DEVICE_ONLY",
  deleteItemAsync: mocks.deleteSecureItem,
  getItemAsync: mocks.getSecureItem,
  isAvailableAsync: mocks.isSecureStoreAvailable,
  setItemAsync: mocks.setSecureItem,
}));

const persistedSession = JSON.stringify({
  state: {
    accessToken: "access-token",
    launchCount: 2,
    memberId: 42,
    refreshToken: "refresh-token",
  },
  version: 1,
});

describe("sessionStorage", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.isSecureStoreAvailable.mockResolvedValue(true);
    mocks.asyncSetItem.mockResolvedValue(undefined);
    mocks.asyncRemoveItem.mockResolvedValue(undefined);
    mocks.deleteSecureItem.mockResolvedValue(undefined);
    mocks.setSecureItem.mockResolvedValue(undefined);
  });

  it("stores tokens in SecureStore and keeps them out of AsyncStorage", async () => {
    await sessionStorage.setItem("weartrack-session", persistedSession);

    expect(mocks.setSecureItem).toHaveBeenCalledWith(
      storageKeys.sessionAccessToken,
      "access-token",
      expect.any(Object),
    );
    expect(mocks.setSecureItem).toHaveBeenCalledWith(
      storageKeys.sessionRefreshToken,
      "refresh-token",
      expect.any(Object),
    );

    const asyncStorageValue = mocks.asyncSetItem.mock.calls[0]?.[1];
    expect(asyncStorageValue).toBeTypeOf("string");
    expect(JSON.parse(asyncStorageValue).state).toEqual({
      launchCount: 2,
      memberId: 42,
    });
  });

  it("migrates legacy AsyncStorage tokens without logging the user out", async () => {
    mocks.asyncGetItem.mockResolvedValue(persistedSession);
    mocks.getSecureItem.mockResolvedValue(null);

    const hydratedValue = await sessionStorage.getItem("weartrack-session");

    expect(hydratedValue).not.toBeNull();
    expect(JSON.parse(hydratedValue as string).state).toMatchObject({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
    expect(mocks.setSecureItem).toHaveBeenCalledTimes(2);

    const sanitizedValue = mocks.asyncSetItem.mock.calls[0]?.[1];
    expect(JSON.parse(sanitizedValue).state).toEqual({
      launchCount: 2,
      memberId: 42,
    });
  });

  it("deletes both secure tokens when the persisted session is removed", async () => {
    await sessionStorage.removeItem?.("weartrack-session");

    expect(mocks.asyncRemoveItem).toHaveBeenCalledWith("weartrack-session");
    expect(mocks.deleteSecureItem).toHaveBeenCalledWith(storageKeys.sessionAccessToken);
    expect(mocks.deleteSecureItem).toHaveBeenCalledWith(storageKeys.sessionRefreshToken);
  });

  it("clears orphaned Keychain tokens when no persisted session remains", async () => {
    mocks.asyncGetItem.mockResolvedValue(null);

    await expect(sessionStorage.getItem("weartrack-session")).resolves.toBeNull();

    expect(mocks.deleteSecureItem).toHaveBeenCalledWith(storageKeys.sessionAccessToken);
    expect(mocks.deleteSecureItem).toHaveBeenCalledWith(storageKeys.sessionRefreshToken);
  });
});
