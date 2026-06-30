import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.EXPO_PUBLIC_API_BASE_URL = "http://localhost:3000";

const postMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    post: postMock,
  },
}));

const payload = {
  sourceUrl: "https://zigzag.kr/catalog/products/160269610",
  productName: "셔츠",
  imageUrl: "https://image.example.com/shirt.jpg",
  imageType: "EXTERNAL_URL" as const,
  price: 27360,
  color: "Blue",
  category: "Shirt",
  purchaseDate: "2026-06-24",
  storageLocation: "행거",
  sectionId: 1,
};

const result = {
  clothesId: 12,
  photoId: 34,
  imageUrl: payload.imageUrl,
  productName: payload.productName,
  color: payload.color,
  category: payload.category,
  price: payload.price,
  purchaseDate: payload.purchaseDate,
  storageLocation: payload.storageLocation,
  sectionId: payload.sectionId,
  createdAt: "2026-06-24T11:31:38.339815993",
};

describe("createClothesFromLink", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("sends the confirmed link-registration payload", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result,
      },
    });

    const { createClothesFromLink } = await import("./create-clothes-from-link-api");

    await expect(createClothesFromLink(payload)).resolves.toEqual(result);
    expect(postMock).toHaveBeenCalledWith("/api/clothes/from-link", payload);
  });

  it("rejects business failures returned with a success status", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: false,
        code: "PRODUCT_LINK_4003",
        message: "상품 정보를 불러올 수 없습니다.",
        result: null,
      },
    });

    const { createClothesFromLink } = await import("./create-clothes-from-link-api");

    await expect(createClothesFromLink(payload)).rejects.toMatchObject({
      code: "PRODUCT_LINK_4003",
    });
  });
});
