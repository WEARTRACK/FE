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
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          memberId: 1,
          nickname: "user",
          requiredTermsAgreed: true,
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
    expect(result.requiredTermsAgreed).toBe(true);
  });

  it("normalizes bearer-prefixed access tokens before returning a login result", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          memberId: 1,
          nickname: "user",
          requiredTermsAgreed: true,
          profileCompleted: true,
          accessToken: "Bearer access-token",
          refreshToken: " refresh-token ",
          closetId: null,
        },
      },
    });

    const { socialLogin } = await import("./socialLogin");
    const result = await socialLogin({ provider: "KAKAO", handoffToken: "token" });

    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken).toBe("refresh-token");
  });

  it("rejects an invalid closetId", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          memberId: 1,
          nickname: "user",
          requiredTermsAgreed: true,
          profileCompleted: true,
          accessToken: "a",
          refreshToken: "r",
          closetId: 0,
          providerEmail: "user@example.com",
        },
      },
    });

    const { socialLogin } = await import("./socialLogin");

    const error = await socialLogin({ provider: "KAKAO", handoffToken: "token" }).catch(
      (caught: unknown) => caught,
    );

    expect(error).toMatchObject({ code: "INVALID_RESPONSE" });
    expect((error as { details: unknown }).details).toEqual({
      isSuccess: true,
      code: "COMMON_200",
      message: "ok",
      result: {
        memberId: 1,
        nickname: "user",
        requiredTermsAgreed: true,
        profileCompleted: true,
        closetId: 0,
        providerEmail: "user@example.com",
      },
    });
  });

  it("uses a legacy terms agreement fallback when requiredTermsAgreed is missing", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          memberId: 1,
          nickname: "user",
          profileCompleted: false,
          accessToken: "a",
          refreshToken: "r",
        },
      },
    });

    const { socialLogin } = await import("./socialLogin");
    const result = await socialLogin({ provider: "KAKAO", handoffToken: "token" });

    expect(result.requiredTermsAgreed).toBe(false);
  });

  it("throws the API error when an unsuccessful response omits result", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: false,
        code: "AUTH_400_4",
        message: "Invalid OAuth handoff token.",
      },
    });

    const { socialLogin } = await import("./socialLogin");

    await expect(socialLogin({ provider: "KAKAO", handoffToken: "token" })).rejects.toMatchObject({
      code: "AUTH_400_4",
      message: "Invalid OAuth handoff token.",
      status: 200,
    });
  });

  it("redacts tokens from unsuccessful response details", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: false,
        code: "AUTH_400_4",
        message: "Invalid OAuth handoff token.",
        result: {
          accessToken: "access-secret",
          refreshToken: "refresh-secret",
          providerEmail: "user@example.com",
        },
      },
    });

    const { socialLogin } = await import("./socialLogin");
    const error = await socialLogin({ provider: "KAKAO", handoffToken: "token" }).catch(
      (caught: unknown) => caught,
    );

    expect((error as { details: unknown }).details).toEqual({
      providerEmail: "user@example.com",
    });
  });

  it("redacts tokens from invalid envelope details", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        accessToken: "access-secret",
        refreshToken: "refresh-secret",
        traceId: "trace-123",
      },
    });

    const { socialLogin } = await import("./socialLogin");
    const error = await socialLogin({ provider: "KAKAO", handoffToken: "token" }).catch(
      (caught: unknown) => caught,
    );

    expect(error).toMatchObject({ code: "INVALID_RESPONSE" });
    expect((error as { details: unknown }).details).toEqual({ traceId: "trace-123" });
  });
});
