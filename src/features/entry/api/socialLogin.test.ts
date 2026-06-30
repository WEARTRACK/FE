import { describe, expect, it, vi } from "vitest";

const postMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    post: postMock,
  },
}));

describe("socialLogin", () => {
  it("returns login result for a valid response", async () => {
    postMock.mockResolvedValueOnce({
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          memberId: 1,
          nickname: "user",
          profileCompleted: true,
          accessToken: "a",
          refreshToken: "r",
          closetId: 3,
        },
      },
    });

    const { socialLogin } = await import("./socialLogin");
    const result = await socialLogin({ provider: "KAKAO", handoffToken: "token" });

    expect(result.closetId).toBe(3);
  });

  it("rejects an invalid closetId", async () => {
    postMock.mockResolvedValueOnce({
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          memberId: 1,
          nickname: "user",
          profileCompleted: true,
          accessToken: "a",
          refreshToken: "r",
          closetId: 0,
        },
      },
    });

    const { socialLogin } = await import("./socialLogin");

    await expect(socialLogin({ provider: "KAKAO", handoffToken: "token" })).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });
});
