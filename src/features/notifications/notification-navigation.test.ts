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

  it("opens the daily review screen from notification list copy", () => {
    expect(
      navigateFromNotificationData({
        title: "WEARTRACK",
        body: "오늘은 어떤 옷을 입었나요? 기록 후 패션소비를 확인해보세요.",
        type: "DAILY_REVIEW",
      }),
    ).toBe(true);
    expect(pushMock).toHaveBeenCalledWith("/weekly-review");
  });

  it("opens the weekly spending screen for weekly fashion report notifications", () => {
    expect(
      navigateFromNotificationData({
        screen: "WEEKLY_FASHION_REPORT",
      }),
    ).toBe(true);
    expect(pushMock).toHaveBeenCalledWith("/home/weekly-spending");
  });

  it("opens the weekly spending screen from notification list copy", () => {
    expect(
      navigateFromNotificationData({
        title: "WEARTRACK",
        body: "이번 주 패션 지출 리포트가 도착했어요. 지금 확인해보세요.",
        type: "FASHION_REPORT",
      }),
    ).toBe(true);
    expect(pushMock).toHaveBeenCalledWith("/home/weekly-spending");
  });

  it("does not navigate when the notification target is unknown", () => {
    expect(navigateFromNotificationData({ type: "LONG_UNWORN_CLOTHES" })).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
  });
});
