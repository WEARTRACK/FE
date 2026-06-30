import { describe, expect, it } from "vitest";

import { getCurrentWeekStartDate, shiftDate } from "./weeklyReportDate";

describe("weeklyReportDate", () => {
  it("finds Sunday as the start of the current week", () => {
    expect(getCurrentWeekStartDate(new Date(2026, 5, 30))).toBe("2026-06-28");
  });

  it("moves between report weeks across month boundaries", () => {
    expect(shiftDate("2026-06-07", -7)).toBe("2026-05-31");
    expect(shiftDate("2026-06-07", 6)).toBe("2026-06-13");
  });
});
