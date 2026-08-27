import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cleanupCurrentMemberData: vi.fn(),
  getState: vi.fn(),
  queryClient: {},
}));

vi.mock("@/features/mypage/utils/cleanupCurrentMemberData", () => ({
  cleanupCurrentMemberData: mocks.cleanupCurrentMemberData,
}));

vi.mock("@/lib/queryClient", () => ({
  queryClient: mocks.queryClient,
}));

vi.mock("@/stores/useSessionStore", () => ({
  useSessionStore: {
    getState: mocks.getState,
  },
}));

describe("expireCurrentSession", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.cleanupCurrentMemberData.mockReset();
    mocks.getState.mockReset();
    mocks.getState.mockReturnValue({ memberId: 42 });
  });

  it("shares one cleanup across concurrent expiration signals", async () => {
    let finishCleanup: (() => void) | undefined;
    mocks.cleanupCurrentMemberData.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishCleanup = resolve;
        }),
    );

    const { expireCurrentSession } = await import("./expireCurrentSession");
    const firstExpiration = expireCurrentSession();
    const secondExpiration = expireCurrentSession();

    expect(mocks.cleanupCurrentMemberData).toHaveBeenCalledOnce();
    expect(mocks.cleanupCurrentMemberData).toHaveBeenCalledWith({
      memberId: 42,
      queryClient: mocks.queryClient,
    });

    finishCleanup?.();
    await expect(Promise.all([firstExpiration, secondExpiration])).resolves.toEqual([
      undefined,
      undefined,
    ]);
  });
});
