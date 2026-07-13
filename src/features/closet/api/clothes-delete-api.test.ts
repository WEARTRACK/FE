import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

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

  it("throws when the delete request fails with 404", async () => {
    const notFoundError = new ApiError({
      code: "CLOTHES_404",
      message: "옷을 찾을 수 없습니다.",
      status: 404,
    });
    deleteMock.mockRejectedValueOnce(notFoundError);

    const { deleteClothes } = await import("./clothes-delete-api");

    await expect(deleteClothes(999)).rejects.toBe(notFoundError);
  });
});
