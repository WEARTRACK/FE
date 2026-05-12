import { describe, expect, it, vi } from "vitest";

const deleteMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    delete: deleteMock,
  },
}));

describe("deleteClothes", () => {
  it("throws INVALID_RESPONSE when result is undefined", async () => {
    deleteMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
      },
    });

    const { deleteClothes } = await import("./clothes-delete-api");

    await expect(deleteClothes(1)).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });
});
