import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getMessaging,
  subscribeToTopic,
  unsubscribeFromTopic,
} from "@react-native-firebase/messaging";

import {
  subscribeAppNotificationTopics,
  unsubscribeAppNotificationTopics,
} from "./notification-topics";

vi.mock("@react-native-firebase/messaging", () => ({
  getMessaging: vi.fn(),
  subscribeToTopic: vi.fn(),
  unsubscribeFromTopic: vi.fn(),
}));

describe("notification topics", () => {
  const messaging = { app: "weartrack" };
  const getMessagingMock = vi.mocked(getMessaging);
  const subscribeMock = vi.mocked(subscribeToTopic);
  const unsubscribeMock = vi.mocked(unsubscribeFromTopic);

  beforeEach(() => {
    getMessagingMock.mockReset();
    subscribeMock.mockReset();
    unsubscribeMock.mockReset();
    getMessagingMock.mockReturnValue(messaging as unknown as ReturnType<typeof getMessaging>);
    subscribeMock.mockResolvedValue(undefined);
    unsubscribeMock.mockResolvedValue(undefined);
  });

  it("subscribes to daily review and weekly report topics", async () => {
    await subscribeAppNotificationTopics();

    expect(subscribeMock).toHaveBeenCalledWith(messaging, "daily-review-reminder");
    expect(subscribeMock).toHaveBeenCalledWith(messaging, "weekly-fashion-report");
  });

  it("unsubscribes from every app topic", async () => {
    await unsubscribeAppNotificationTopics();

    expect(unsubscribeMock).toHaveBeenCalledWith(messaging, "daily-review-reminder");
    expect(unsubscribeMock).toHaveBeenCalledWith(messaging, "weekly-fashion-report");
  });
});
