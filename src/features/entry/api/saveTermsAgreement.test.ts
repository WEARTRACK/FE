import { beforeEach, describe, expect, it, vi } from "vitest";

const postMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    post: postMock,
  },
}));

describe("saveTermsAgreement", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("accepts the backend void response when result is omitted", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "요청에 성공했습니다.",
      },
    });

    const { saveTermsAgreement } = await import("./saveTermsAgreement");

    await expect(saveTermsAgreement()).resolves.toMatchObject({
      isSuccess: true,
      code: "COMMON_200",
    });
    expect(postMock).toHaveBeenCalledWith("/api/members/me/terms-agreement", {
      requiredTermsAgreed: true,
    });
  });

  it("keeps accepting a null result for compatible API responses", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "요청에 성공했습니다.",
        result: null,
      },
    });

    const { saveTermsAgreement } = await import("./saveTermsAgreement");

    await expect(saveTermsAgreement()).resolves.toMatchObject({
      isSuccess: true,
      result: null,
    });
  });

  it("rejects a malformed response envelope", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
      },
    });

    const { saveTermsAgreement } = await import("./saveTermsAgreement");

    await expect(saveTermsAgreement()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });
});
