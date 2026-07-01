import { describe, expect, it } from "vitest";

import { getCurrentYearMonth, getMonthDistance, shiftYearMonth } from "./monthlyReportDate";

describe("monthlyReportDate", () => {
  it("formats the current year and month", () => {
    expect(getCurrentYearMonth(new Date(2026, 5, 30))).toBe("2026-06");
  });

  it("moves between months across year boundaries", () => {
    expect(shiftYearMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftYearMonth("2025-12", 1)).toBe("2026-01");
  });

  it("calculates how many months ago a report is", () => {
    expect(getMonthDistance("2026-06", "2026-03")).toBe(3);
    expect(getMonthDistance("2026-01", "2025-12")).toBe(1);
  });
});
