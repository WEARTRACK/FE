import { beforeEach, describe, expect, it, vi } from "vitest";

const patchMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    patch: patchMock,
  },
}));

describe("saveNickname", () => {
  beforeEach(() => {
    patchMock.mockReset();
  });

  it("preserves the API error when an unsuccessful response omits result", async () => {
    patchMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: false,
        code: "MEMBER_409_1",
        message: "이미 사용 중인 닉네임입니다.",
      },
    });

    const { saveNickname } = await import("./saveNickname");

    await expect(saveNickname({ nickname: "taken" })).rejects.toMatchObject({
      code: "MEMBER_409_1",
      message: "이미 사용 중인 닉네임입니다.",
    });
  });

  it("still requires result for a successful response", async () => {
    patchMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "저장되었습니다.",
      },
    });

    const { saveNickname } = await import("./saveNickname");

    await expect(saveNickname({ nickname: "new-name" })).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });
});
