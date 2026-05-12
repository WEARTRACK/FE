import { describe, expect, it, vi } from "vitest";

process.env.EXPO_PUBLIC_API_BASE_URL = "http://localhost:3000";

const patchMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    patch: patchMock,
  },
}));

describe("updateClothes", () => {
  it("converts sectionId section-* to number in request payload", async () => {
    patchMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          clothesId: 1,
          imageUrl: "/uploads/a.png",
          color: "white",
          category: "knite",
          price: 1000,
          sectionId: 2,
          sectionName: "상의",
        },
      },
    });

    const { updateClothes } = await import("./clothes-update-api");

    await updateClothes(1, {
      color: "white",
      category: "knit",
      price: 1000,
      sectionId: "section-3",
    });

    expect(patchMock).toHaveBeenCalledWith(
      "/api/clothes/1",
      expect.objectContaining({ sectionId: 3 }),
    );
  });

  it("converts response sectionId number to section-*", async () => {
    patchMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          clothesId: 2,
          imageUrl: "/uploads/b.png",
          color: "black",
          category: "shirt",
          price: 2000,
          sectionId: 2,
          sectionName: "상의",
        },
      },
    });

    const { updateClothes } = await import("./clothes-update-api");

    const result = await updateClothes(2, {
      color: "black",
      category: "shirt",
      price: 2000,
      sectionId: "section-2",
    });

    expect(result.sectionId).toBe("section-2");
  });

  it("throws when response sectionId is out of range", async () => {
    patchMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          clothesId: 3,
          imageUrl: "/uploads/c.png",
          color: "black",
          category: "shirt",
          price: 3000,
          sectionId: 99,
          sectionName: "unknown",
        },
      },
    });

    const { updateClothes } = await import("./clothes-update-api");

    await expect(
      updateClothes(3, {
        color: "black",
        category: "shirt",
        price: 3000,
        sectionId: "section-3",
      }),
    ).rejects.toMatchObject({ code: "INVALID_SECTION_ID" });
  });
});
