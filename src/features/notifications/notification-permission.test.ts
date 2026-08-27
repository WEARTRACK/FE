import { beforeEach, describe, expect, it, vi } from "vitest";

const messagingMock = {};
const hasPermissionMock = vi.fn();
const isDeviceRegisteredForRemoteMessagesMock = vi.fn();
const registerDeviceForRemoteMessagesMock = vi.fn();
const requestPermissionMock = vi.fn();

vi.mock("@react-native-firebase/messaging", () => ({
  AuthorizationStatus: {
    AUTHORIZED: 1,
    DENIED: 0,
    NOT_DETERMINED: -1,
    PROVISIONAL: 2,
  },
  getMessaging: () => messagingMock,
  hasPermission: hasPermissionMock,
  isDeviceRegisteredForRemoteMessages: isDeviceRegisteredForRemoteMessagesMock,
  registerDeviceForRemoteMessages: registerDeviceForRemoteMessagesMock,
  requestPermission: requestPermissionMock,
}));

describe("notification-permission", () => {
  beforeEach(() => {
    vi.resetModules();
    hasPermissionMock.mockReset();
    isDeviceRegisteredForRemoteMessagesMock.mockReset();
    registerDeviceForRemoteMessagesMock.mockReset();
    requestPermissionMock.mockReset();
  });

  it("checks an existing permission without showing the system prompt", async () => {
    hasPermissionMock.mockResolvedValueOnce(1);

    const { hasNotificationPermission } = await import("./notification-permission");

    await expect(hasNotificationPermission()).resolves.toBe(true);
    expect(hasPermissionMock).toHaveBeenCalledWith(messagingMock);
    expect(requestPermissionMock).not.toHaveBeenCalled();
  });

  it("requests permission only through the explicit request function", async () => {
    isDeviceRegisteredForRemoteMessagesMock.mockReturnValueOnce(false);
    registerDeviceForRemoteMessagesMock.mockResolvedValueOnce(undefined);
    requestPermissionMock.mockResolvedValueOnce(2);

    const { requestNotificationPermission } = await import("./notification-permission");

    await expect(requestNotificationPermission()).resolves.toBe(true);
    expect(registerDeviceForRemoteMessagesMock).toHaveBeenCalledWith(messagingMock);
    expect(requestPermissionMock).toHaveBeenCalledWith(messagingMock);
  });
});
