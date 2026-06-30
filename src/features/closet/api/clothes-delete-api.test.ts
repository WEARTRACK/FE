import { describe, expect, it, vi } from "vitest";

const deleteMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    delete: deleteMock,
  },
}));

describe("deleteClothes", () => {
  it("returns null when successful delete response has no result", async () => {
    deleteMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
      },
    });

    const { deleteClothes } = await import("./clothes-delete-api");

    await expect(deleteClothes(1)).resolves.toBeNull();
  });
});
