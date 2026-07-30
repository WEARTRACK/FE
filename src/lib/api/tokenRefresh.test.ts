import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearSession: vi.fn(),
  getState: vi.fn(),
  hasHydrated: vi.fn(),
  post: vi.fn(),
  rehydrate: vi.fn(),
  updateTokens: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      post: mocks.post,
    })),
  },
  AxiosError: class AxiosError extends Error {},
}));

vi.mock("@/config/env", () => ({
  env: {
    apiBaseUrl: "https://example.com",
  },
}));

vi.mock("@/stores/useSessionStore", () => ({
  useSessionStore: Object.assign(vi.fn(), {
    getState: mocks.getState,
    persist: {
      hasHydrated: mocks.hasHydrated,
      rehydrate: mocks.rehydrate,
    },
  }),
}));

describe("refreshSessionTokens", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.clearSession.mockReset();
    mocks.getState.mockReset();
    mocks.hasHydrated.mockReset();
    mocks.post.mockReset();
    mocks.rehydrate.mockReset();
    mocks.updateTokens.mockReset();
    mocks.hasHydrated.mockReturnValue(true);
    mocks.rehydrate.mockResolvedValue(undefined);
    mocks.getState.mockReturnValue({
      accessToken: "old-access-token",
      clearSession: mocks.clearSession,
      refreshToken: "old-refresh-token",
      updateTokens: mocks.updateTokens,
    });
  });

  it("posts the stored refresh token and saves the rotated tokens", async () => {
    mocks.post.mockResolvedValue({
      data: {
        code: "COMMON_200",
        isSuccess: true,
        message: "요청에 성공했습니다.",
        result: {
          accessToken: "Bearer new-access-token",
          refreshToken: " new-refresh-token ",
        },
      },
      status: 200,
    });

    const { refreshSessionTokens } = await import("./tokenRefresh");
    const result = await refreshSessionTokens();

    expect(mocks.post).toHaveBeenCalledWith("/api/auth/token/refresh", {
      refreshToken: "old-refresh-token",
    });
    expect(mocks.updateTokens).toHaveBeenCalledWith({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
    expect(result).toEqual({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
  });

  it("shares one refresh request across concurrent callers", async () => {
    mocks.post.mockResolvedValue({
      data: {
        code: "COMMON_200",
        isSuccess: true,
        message: "요청에 성공했습니다.",
        result: {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
        },
      },
      status: 200,
    });

    const { refreshSessionTokens } = await import("./tokenRefresh");
    const [firstResult, secondResult] = await Promise.all([
      refreshSessionTokens(),
      refreshSessionTokens(),
    ]);

    expect(mocks.post).toHaveBeenCalledOnce();
    expect(firstResult).toEqual(secondResult);
  });

  it("clears the session when the refresh token is rejected", async () => {
    mocks.post.mockResolvedValue({
      data: {
        code: "AUTH_401_3",
        isSuccess: false,
        message: "Invalid JWT token.",
        result: null,
      },
      status: 401,
    });

    const { refreshSessionTokens } = await import("./tokenRefresh");

    await expect(refreshSessionTokens()).rejects.toMatchObject({
      code: "AUTH_401_3",
      message: "Invalid JWT token.",
      status: 401,
    });
    expect(mocks.clearSession).toHaveBeenCalledOnce();
  });
});
