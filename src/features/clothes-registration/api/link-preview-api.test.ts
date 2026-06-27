import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.EXPO_PUBLIC_API_BASE_URL = "http://localhost:3000";

const postMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    post: postMock,
  },
}));

const validPreview = {
  sourceShop: "ZIGZAG",
  sourceUrl: "https://zigzag.kr/catalog/products/160269610",
  productName: "셔츠",
  imageUrl: "https://image.example.com/shirt.jpg",
  price: 27360,
  brandName: "매니크",
  category: "Shirt",
  color: null,
  reasonCode: null,
};

describe("fetchProductLinkPreview", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("requests a link preview with an extended timeout", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: validPreview,
      },
    });

    const { fetchProductLinkPreview } = await import("./link-preview-api");

    await expect(
      fetchProductLinkPreview("https://zigzag.kr/catalog/products/160269610"),
    ).resolves.toEqual(validPreview);
    expect(postMock).toHaveBeenCalledWith(
      "/api/clothes/link-preview",
      { url: "https://zigzag.kr/catalog/products/160269610" },
      { timeout: 30000 },
    );
  });

  it("rejects malformed successful responses", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: { ...validPreview, price: "27360" },
      },
    });

    const { fetchProductLinkPreview } = await import("./link-preview-api");

    await expect(
      fetchProductLinkPreview("https://zigzag.kr/catalog/products/160269610"),
    ).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });
});
