import { beforeEach, describe, expect, it, vi } from "vitest";
import { router } from "expo-router";

import { navigateFromNotificationData } from "./notification-navigation";

vi.mock("expo-router", () => ({
  router: {
    push: vi.fn(),
  },
}));

describe("navigateFromNotificationData", () => {
  const pushMock = vi.mocked(router.push);

  beforeEach(() => {
    pushMock.mockReset();
  });

  it("opens the daily review screen", () => {
    expect(navigateFromNotificationData({ type: "DAILY_REVIEW_REMINDER" })).toBe(true);
    expect(pushMock).toHaveBeenCalledWith("/weekly-review");
  });

  it("opens the report screen for the week in the notification", () => {
    expect(
      navigateFromNotificationData({
        screen: "WEEKLY_FASHION_REPORT",
        weekStartDate: "2026-06-14",
      }),
    ).toBe(true);
    expect(pushMock).toHaveBeenCalledWith({
      pathname: "/report",
      params: { weekStartDate: "2026-06-14" },
    });
  });

  it("does not navigate when a weekly report date is missing or malformed", () => {
    expect(navigateFromNotificationData({ type: "WEEKLY_FASHION_REPORT" })).toBe(false);
    expect(
      navigateFromNotificationData({
        type: "WEEKLY_FASHION_REPORT",
        weekStartDate: "2026/06/14",
      }),
    ).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
  });
});
