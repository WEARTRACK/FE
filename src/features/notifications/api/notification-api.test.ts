import { beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();
const deleteMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    delete: deleteMock,
    post: postMock,
  },
}));

describe("notification-api", () => {
  beforeEach(() => {
    vi.resetModules();
    postMock.mockReset();
    deleteMock.mockReset();
  });

  it("normalizes bearer-prefixed access tokens when registering an FCM token", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: null,
      },
    });

    const { registerNotificationFcmToken } = await import("./notification-api");

    await registerNotificationFcmToken(
      {
        token: "fcm-token",
        deviceType: "IOS",
      },
      "Bearer access-token",
    );

    expect(postMock).toHaveBeenCalledWith(
      "/api/notifications/fcm-token",
      {
        token: "fcm-token",
        deviceType: "IOS",
      },
      {
        headers: {
          Authorization: "Bearer access-token",
        },
      },
    );
  });

  it("normalizes bearer-prefixed access tokens when deleting an FCM token", async () => {
    deleteMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: null,
      },
    });

    const { deleteNotificationFcmToken } = await import("./notification-api");

    await deleteNotificationFcmToken({ token: "fcm-token" }, "Bearer access-token");

    expect(deleteMock).toHaveBeenCalledWith("/api/notifications/fcm-token", {
      data: {
        token: "fcm-token",
      },
      headers: {
        Authorization: "Bearer access-token",
      },
    });
  });
});
