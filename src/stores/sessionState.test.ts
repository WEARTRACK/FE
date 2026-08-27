import { describe, expect, it } from "vitest";

import { hasValidAuthenticatedSession } from "@/stores/sessionState";

describe("hasValidAuthenticatedSession", () => {
  it("accepts a member session with at least one token", () => {
    expect(
      hasValidAuthenticatedSession({
        accessToken: "access-token",
        memberId: 42,
        refreshToken: null,
      }),
    ).toBe(true);
  });

  it("rejects tokens that are not associated with a member", () => {
    expect(
      hasValidAuthenticatedSession({
        accessToken: "access-token",
        memberId: null,
        refreshToken: "refresh-token",
      }),
    ).toBe(false);
  });

  it("rejects a member without authentication tokens", () => {
    expect(
      hasValidAuthenticatedSession({
        accessToken: null,
        memberId: 42,
        refreshToken: null,
      }),
    ).toBe(false);
  });
});
