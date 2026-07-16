import { beforeEach, describe, expect, it, vi } from "vitest";

const getMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: getMock,
  },
}));

describe("checkNicknameDuplicate", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("handles an unsuccessful response without result", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: false,
        code: "MEMBER_409_1",
        message: "이미 사용 중인 닉네임입니다.",
      },
    });

    const { checkNicknameDuplicate } = await import("./checkNicknameDuplicate");

    await expect(checkNicknameDuplicate(" taken ")).resolves.toEqual({
      nickname: "taken",
      isDuplicate: true,
    });
  });

  it("keeps the API error when an unsuccessful response omits result", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: false,
        code: "AUTH_401_1",
        message: "인증이 필요합니다.",
      },
    });

    const { checkNicknameDuplicate } = await import("./checkNicknameDuplicate");

    await expect(checkNicknameDuplicate("taken")).rejects.toMatchObject({
      code: "AUTH_401_1",
      message: "인증이 필요합니다.",
    });
  });

  it("still requires result for a successful response", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "조회되었습니다.",
      },
    });

    const { checkNicknameDuplicate } = await import("./checkNicknameDuplicate");

    await expect(checkNicknameDuplicate("taken")).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });
});
