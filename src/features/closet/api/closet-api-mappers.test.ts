import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

import { resolveClosetImageUrl } from "./closet-api-mappers";

vi.mock("@/config/env", () => ({
  env: { apiBaseUrl: "https://api.example.com" },
}));

describe("resolveClosetImageUrl", () => {
  it("resolves relative image paths against the API base URL", () => {
    expect(resolveClosetImageUrl("/images/tshirt.png")).toBe(
      "https://api.example.com/images/tshirt.png",
    );
  });

  it("keeps an absolute HTTPS image URL from an external image host", () => {
    const imageUrl = "https://cdn.example.com/images/tshirt.png";

    expect(resolveClosetImageUrl(imageUrl)).toBe(imageUrl);
  });

  it("rejects an empty image URL", () => {
    expect(() => resolveClosetImageUrl("   ")).toThrowError(ApiError);

    try {
      resolveClosetImageUrl("   ");
    } catch (error) {
      expect(error).toMatchObject({ code: "INVALID_IMAGE_URL" });
    }
  });
});
